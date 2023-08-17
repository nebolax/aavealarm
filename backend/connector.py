from backend.exceptions import StartupException
from backend.types import Chain, ChainAccount, ChainAccountWithHF
import websockets
import asyncio
import json
import logging
from web3 import Web3, HTTPProvider
from web3.types import HexBytes
from eth_utils import to_checksum_address
from backend.notifier import Notifier
from backend.database import Database

logger = logging.getLogger(__name__)

    
WS_NEW_HEADS_SUBSCRIBE_MESSAGE = {'id': 1, 'method': 'eth_subscribe', 'params': ['newHeads']}

HEALTH_FACTOR_CHECK_PERIOD = 5
HEALTH_FACTOR_BATCH_SIZE = 100  # How many accounts to check at once. Limited by max gas per call.
MAX_UINT256 = 2 ** 256 - 1

LIQUIDATION_TOPIC = '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286'

def topic_to_address(topic: HexBytes) -> str:
    return to_checksum_address('0x' + topic.hex()[-40:])


def build_subscription_message(pool_address: str, liquidation_topic: str) -> dict:
    return {'id': 2, 'method': 'eth_subscribe', 'params': ['logs', {
        'address': pool_address,
        'topics': [liquidation_topic],
    }]}


def make_batches(lst: list, batch_size: int) -> list[list]:
    """Yield successive n-sized batches from lst."""
    for i in range(0, len(lst), batch_size):
        yield lst[i:i + batch_size]


class ChainConnector():
    def __init__(
            self,
            chain: Chain,
            http_rpc_url: str,
            ws_rpc_url: str,
            notifier: Notifier,
            database: Database,
            v2_pool_address: str,
            v3_pool_address: str,
    ) -> None:
        self.http_rpc_url = http_rpc_url
        self.ws_rpc_url = ws_rpc_url
        self.web3 = Web3(HTTPProvider(http_rpc_url))
        self.chain = chain
        self.notifier = notifier
        self.database = database
        self.v2_pool_address = v2_pool_address
        self.v3_pool_address = v3_pool_address

        with open('./backend/abi/v2_pool.json') as f:
            v2_pool_abi = json.loads(f.read())

        with open('./backend/abi/v3_pool.json') as f:
            v3_pool_abi = json.loads(f.read())
        
        with open('./backend/abi/erc20.json') as f:
            erc20_abi = json.loads(f.read())
        
        self.erc20_abi = erc20_abi
        self.v2_pool_contract = self.web3.eth.contract(address=v2_pool_address, abi=v2_pool_abi)
        self.v3_pool_contract = self.web3.eth.contract(address=v3_pool_address, abi=v3_pool_abi)

    def get_v2_health_factors(self, accounts_batch: list[ChainAccountWithHF]) -> list[float]:
        """Get aave V2 health factors of all accounts in the batch"""
        accounts_data = []
        for account in accounts_batch:
            accounts_data.append(self.v2_pool_contract.functions.getUserAccountData(account.account.address).call())

        health_factors = []
        for account_data in accounts_data:
            if account_data[-1] == MAX_UINT256:
                health_factors.append(-1)
            else:
                health_factors.append(account_data[-1] / 1e18)
        
        return health_factors

    def get_v3_health_factors(self, accounts_batch: list[ChainAccountWithHF]) -> list[float]:
        """Get aave V3 health factor of all accounts in the batch"""
        accounts_data = []
        for account in accounts_batch:
            accounts_data.append(self.v3_pool_contract.functions.getUserAccountData(account.account.address).call())

        health_factors = []
        for account_data in accounts_data:
            if account_data[-1] == MAX_UINT256:
                health_factors.append(-1)
            else:
                health_factors.append(account_data[-1] / 1e18)

        return health_factors

    def health_factor_periodic_task(self) -> None:
        """
        1. Get all accounts from the DB that belong to this chain and their threshold health factors.
        2. Check health factor of all these accounts.
        3. Check the health factors against the thresholds and send notifications if needed.
        """
        all_accounts = self.database.get_all_accounts_with_health_factors_on_chain(self.chain)
        v2_accounts = [account for account in all_accounts if account.account.aave_version == 2]
        v3_accounts = [account for account in all_accounts if account.account.aave_version == 3]

        v2_health_factors = []
        for batch in make_batches(v2_accounts, HEALTH_FACTOR_BATCH_SIZE):
            v2_health_factors += self.get_v2_health_factors(batch)
        
        v3_health_factors = []
        for batch in make_batches(v3_accounts, HEALTH_FACTOR_BATCH_SIZE):
            v3_health_factors += self.get_v3_health_factors(batch)
        
        for account, health_factor in zip(v2_accounts + v3_accounts, v2_health_factors + v3_health_factors):
            if health_factor < account.health_factor_threshold:
                message = f'Health factor on your account {self.chain.name} {account.account.address} is {health_factor} which is below the threshold of {account.health_factor_threshold}.'
                self.notifier.notify(chain_account=account.account, event_type='health_factor', title='Low health factor!', message=message)

    async def monitor_health_factor(self) -> None:
        """Periodically check health factor of all accounts on this chain"""
        while True:
            self.health_factor_periodic_task()
            await asyncio.sleep(HEALTH_FACTOR_CHECK_PERIOD)

    def catchup_on_liquidations(self) -> None:
        """Catchup on liquidations that occured while the program was not running"""
        last_v2_checked_block = int(self.database.get_setting(f'LAST_{self.chain.name}_V2_CHECKED_BLOCK'))
        v2_logs = self.web3.eth.get_logs({
            'address': self.v2_pool_address,
            'topics': [LIQUIDATION_TOPIC],
            'fromBlock': last_v2_checked_block,
            'toBlock': 'latest',
        })
        for log in v2_logs:
            self.process_liquidation_log(log)

        last_v3_checked_block = int(self.database.get_setting(f'LAST_{self.chain.name}_V3_CHECKED_BLOCK'))
        v3_logs = self.web3.eth.get_logs({
            'address': self.v3_pool_address,
            'topics': [LIQUIDATION_TOPIC],
            'fromBlock': last_v3_checked_block,
            'toBlock': 'latest',
        })
        for log in v3_logs:
            self.process_liquidation_log(log)

    def process_liquidation_log(self, log: dict) -> None:
        """Process a single aave liquidation log and send a notification if the liquidated account is tracked."""
        print('aaaa log', log)
        if log['address'] == self.v2_pool_address:
            aave_version = 2
        elif log['address'] == self.v3_pool_address:
            aave_version = 3
        else:
            raise AssertionError(f'Unknown pool address {log["address"]}')
    
        collateral_token_address = topic_to_address(log['topics'][1])
        debt_token_address = topic_to_address(log['topics'][2])
        user = topic_to_address(log['topics'][3])

        account = ChainAccount(
            address=user,
            chain=self.chain,
            aave_version=aave_version,
        )
        if not self.database.is_tracked(account):
            return

        logger.info('The liquidated address is being tracked! Sending a notification.')

        covered_debt_amount_raw = int(log['data'][:32].hex(), 16)
        liquidated_collateral_amount_raw = int(log['data'][32:64].hex(), 16)

        collateral_token_symbol = self.web3.eth.contract(address=collateral_token_address, abi=self.erc20_abi).functions.symbol().call()
        collateral_token_decimals = self.web3.eth.contract(address=collateral_token_address, abi=self.erc20_abi).functions.decimals().call()
        liquidated_collateral_amount = liquidated_collateral_amount_raw / 10 ** collateral_token_decimals

        debt_token_symbol = self.web3.eth.contract(address=debt_token_address, abi=self.erc20_abi).functions.symbol().call()
        debt_token_decimals = self.web3.eth.contract(address=debt_token_address, abi=self.erc20_abi).functions.decimals().call()
        covered_debt_amount = covered_debt_amount_raw / 10 ** debt_token_decimals

        message = f'Your account {user} on chain {self.chain.name} was liquidated. {collateral_token_symbol} {liquidated_collateral_amount} was liquidated to cover {debt_token_symbol} {covered_debt_amount} debt.'
        self.notifier.notify(chain_account=account, event_type='liquidation', title='Liquidation occured!', message=message)

    async def monitor_liquidations(self, aave_version: int) -> None:
        """Start monitoring liquidations by subscribing to the corresponding logs"""
        if aave_version == 2:
            pool_address = self.v2_pool_address
        elif aave_version == 3:
            pool_address = self.v3_pool_address
        else:
            raise AssertionError(f'Unknown aave version V{aave_version}')

        async with websockets.connect(self.ws_rpc_url) as ws:
            await ws.send(json.dumps(build_subscription_message(pool_address, LIQUIDATION_TOPIC)))
            raw_subscription_response = await ws.recv()

            try:
                decoded_subscription_response = json.loads(raw_subscription_response)
            except json.decoder.JSONDecodeError:
                raise StartupException(f'Failed to decode subscription response {raw_subscription_response} for {self.chain.name} aave V{aave_version}')

            if 'error' in decoded_subscription_response:
                raise StartupException(f'Failed to subscribe to liquidations for {self.chain.name} aave V{aave_version}. Subscription response was {decoded_subscription_response}')

            logger.info(f'Successfully subscribed to liquidations for {self.chain.name} aave V{aave_version}')
            while True:
                try:
                    raw_message = await ws.recv()
                    pass
                except:
                    logger.critical(f'Websocket connection was closed. Liquidations monitoring is stopped for {self.chain.name}')
                    break

                try:
                    decoded_message = json.loads(raw_message)
                except json.decoder.JSONDecodeError:
                    logger.critical(f'Failed to decode message {raw_message} for {self.chain.name}')
                    continue
                
                self.process_liquidation_log(decoded_message['params']['result'])
