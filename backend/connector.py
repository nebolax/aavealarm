import asyncio
import json
import logging
import traceback
from typing import Generator

from eth_utils import to_checksum_address
from web3 import HTTPProvider, Web3
from web3.contract import Contract
from web3.types import HexBytes, LogReceipt

from backend.admin import send_admin_message
from backend.database import Database
from backend.notifier import Notifier
from backend.types import Chain, ChainAccount, ChainAccountWithAllData

HEALTH_FACTOR_CHECK_PERIOD = 60 * 15  # every 15 minutes
LIQUIDATIONS_CHECK_PERIOD = 60 * 15  # every 15 minutes
HEALTH_FACTOR_BATCH_SIZE = 100  # How many accounts to check at once. Limited by max gas per call.
MAX_UINT256 = 2 ** 256 - 1
MAX_BLOCK_RANGE = 100

LIQUIDATION_TOPIC = '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286'
MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'



def topic_to_address(topic: HexBytes) -> str:
    return to_checksum_address('0x' + topic.hex()[-40:])


def build_subscription_message(pool_address: str, liquidation_topic: str) -> dict:
    return {'id': 2, 'method': 'eth_subscribe', 'params': ['logs', {
        'address': pool_address,
        'topics': [liquidation_topic],
    }]}


def make_batches(lst: list, batch_size: int) -> Generator[list, None, None]:
    """Yield successive n-sized batches from lst."""
    for i in range(0, len(lst), batch_size):
        yield lst[i:i + batch_size]


class ChainConnector():
    def __init__(
            self,
            chain: Chain,
            http_rpc_url: str,
            notifier: Notifier,
            database: Database,
            pool_address: str,
            aave_version: int,
    ) -> None:
        self.http_rpc_url = http_rpc_url
        self.web3 = Web3(HTTPProvider(http_rpc_url))
        self.chain = chain
        self.notifier = notifier
        self.database = database
        self.pool_address = pool_address
        self.aave_version = aave_version

        with open(f'./backend/abi/v{aave_version}_pool.json') as f:
            pool_abi = json.loads(f.read())
        
        with open('./backend/abi/erc20.json') as f:
            erc20_abi = json.loads(f.read())

        with open('./backend/abi/multicall.json') as f:
            multicall_abi = json.loads(f.read())
        
        self.erc20_abi = erc20_abi
        self.pool_contract: Contract = self.web3.eth.contract(
            address=pool_address,
            abi=pool_abi,
        )
        self.multical_contract: Contract = self.web3.eth.contract(
            address=MULTICALL_ADDRESS,
            abi=multicall_abi,
        )

    def get_health_factors(
            self,
            accounts_batch: list[ChainAccountWithAllData],
    ) -> list[float]:
        """Get aave health factors of all accounts in the batch"""
        encoded_calls = []
        for account in accounts_batch:
            encoded = self.pool_contract.encodeABI(
                fn_name='getUserAccountData',
                args=[account.account.address],
            )
            encoded_calls.append((self.pool_contract.address, encoded))

        accounts_data = self.multical_contract.functions.aggregate(encoded_calls).call()[1]

        health_factors = []
        for account_data in accounts_data:
            raw_health_factor = int.from_bytes(account_data[-32:], "big") 
            if raw_health_factor == MAX_UINT256:
                health_factors.append(-1)
            else:
                health_factors.append(raw_health_factor / 1e18)
        
        return health_factors

    def check_health_factors(self) -> None:
        """
        1. Get all accounts from the DB that belong to this chain and their threshold health factors.
        2. Check health factor of all these accounts.
        3. Check the health factors against the thresholds and send notifications if needed.
        """
        logging.info(f'Checking health factors on {self.chain.name} x Aave V{self.aave_version}')
        all_accounts = self.database.get_accounts_for_hf_check(self.chain, self.aave_version)
        health_factors: list[float] = []
        for batch in make_batches(all_accounts, HEALTH_FACTOR_BATCH_SIZE):
            health_factors += self.get_health_factors(batch)
        
        logging.info(f'Got {len(health_factors)} health factors on {self.chain.name} x Aave V{self.aave_version}')
        for account, health_factor in zip(all_accounts, health_factors):
            if health_factor < account.health_factor_threshold and health_factor != -1:
                message = f'Health factor on your account {str(self.chain)} {account.account.address} is {health_factor:.2f} which is below the threshold of {account.health_factor_threshold}.'
                self.notifier.notify_about_health_factor(account=account, message=message)

    async def monitor_health_factor(self) -> None:
        """Periodically check health factor of all accounts on this chain"""
        while True:
            try:
                self.check_health_factors()
            except Exception:
                await send_admin_message('Critical error!')
                logging.error(f'Error while checking health factors on {self.chain.name} x Aave V{self.aave_version}: {traceback.format_exc()}')
                
            await asyncio.sleep(HEALTH_FACTOR_CHECK_PERIOD)

    def catchup_on_liquidations(self) -> None:
        """Catchup on liquidations that occured while the program was not running"""
        logging.info(f'Checking for liquidations on {self.chain.name} x Aave V{self.aave_version}')
        setting_key = f'LAST_{self.chain.name}_V{self.aave_version}_CHECKED_BLOCK'
        last_checked_block_raw = self.database.get_setting(setting_key)
        current_block = self.web3.eth.block_number - 1  # Doing -1 because it may be that the current block is not confirmed yet on Avalanche.
        if last_checked_block_raw is None:
            logging.info(f'No last checked block found. But we set {setting_key} to {current_block}')
            return  # Cant do anything. No state saved.

        logging.info(f'Checking liquidations from block {last_checked_block_raw} to {current_block} on {self.chain.name} x Aave V{self.aave_version}')
        last_checked_block = int(last_checked_block_raw)
        logs = []
        for from_block in range(last_checked_block, current_block, MAX_BLOCK_RANGE):
            logs += self.web3.eth.get_logs({
                'address': self.pool_address,
                'topics': [LIQUIDATION_TOPIC],
                'fromBlock': from_block,
                'toBlock': min(current_block, from_block + MAX_BLOCK_RANGE),
            })
        logging.info(f'Found {len(logs)} liquidations on {self.chain.name} x Aave V{self.aave_version}')
        for log in logs:
            self.process_liquidation_log(log)

        self.database.set_setting(setting_key, str(current_block))
        
    def process_liquidation_log(self, log: LogReceipt) -> None:
        """Process a single aave liquidation log and send a notification if the liquidated account is tracked."""
        collateral_token_address = topic_to_address(log['topics'][1])
        debt_token_address = topic_to_address(log['topics'][2])
        user = topic_to_address(log['topics'][3])

        account = ChainAccount(
            address=user,
            chain=self.chain,
            aave_version=self.aave_version,
        )
        if not self.database.is_tracked(account):
            logging.info(f'The liquidated address {user} is not being tracked on {self.chain.name} x Aave V{self.aave_version}. Skipping.')
            return

        logging.info(f'The liquidated address {user} is being tracked on {self.chain.name} x Aave V{self.aave_version}! Querying data for the notification.')
        covered_debt_amount_raw = int(log['data'][:32].hex(), 16)
        liquidated_collateral_amount_raw = int(log['data'][32:64].hex(), 16)

        collateral_token_symbol = self.web3.eth.contract(address=collateral_token_address, abi=self.erc20_abi).functions.symbol().call()  # type: ignore[call-overload]
        collateral_token_decimals = self.web3.eth.contract(address=collateral_token_address, abi=self.erc20_abi).functions.decimals().call()  # type: ignore[call-overload]
        liquidated_collateral_amount = liquidated_collateral_amount_raw / 10 ** collateral_token_decimals

        debt_token_symbol = self.web3.eth.contract(address=debt_token_address, abi=self.erc20_abi).functions.symbol().call()  # type: ignore[call-overload]
        debt_token_decimals = self.web3.eth.contract(address=debt_token_address, abi=self.erc20_abi).functions.decimals().call()  # type: ignore[call-overload]
        covered_debt_amount = covered_debt_amount_raw / 10 ** debt_token_decimals
        
        logging.info(f'Queried data for the liquidation of {user} on {self.chain.name} x Aave V{self.aave_version}. Sending the notification!')
        message = f'Your account {user} on chain {self.chain.name} was liquidated. {collateral_token_symbol} {liquidated_collateral_amount} was liquidated to cover {debt_token_symbol} {covered_debt_amount} debt.'
        self.notifier.notify_about_liquidation(chain_account=account, title='Liquidation occured!', message=message)

    async def monitor_liquidations(self):
        """Periodically check liquidations on this chain"""
        while True:
            try:
                self.catchup_on_liquidations()
            except Exception:
                await send_admin_message('Critical error!')
                logging.error(f'Error while catching up on liquidations on {self.chain.name} x Aave V{self.aave_version}: {traceback.format_exc()}')
            await asyncio.sleep(LIQUIDATIONS_CHECK_PERIOD)
