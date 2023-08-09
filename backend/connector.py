from abc import ABC, abstractmethod, ABCMeta
import os
from backend.exceptions import StartupException
from backend.types import AaveVersion, Chain, TrackedAccount, TrackedAccountWithHF
import websockets
import asyncio
import json
import logging
from web3 import Web3, HTTPProvider

logger = logging.getLogger(__name__)

    
WS_NEW_HEADS_SUBSCRIBE_MESSAGE = {'id': 1, 'method': 'eth_subscribe', 'params': ['newHeads']}

HEALTH_FACTOR_CHECK_PERIOD = 5
HEALTH_FACTOR_BATCH_SIZE = 100  # How many accounts to check at once. Limited by max gas per call.
MAX_UINT256 = 2 ** 256 - 1

V2_LIQUIDATION_TOPIC = ...
V3_LIQUIDATION_TOPIC = ...


def build_subscription_message(pool_address: str, liquidation_topic: str) -> dict:
    return {'id': 2, 'method': 'eth_subscribe', 'params': ['getLogs', {
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
            notifier,
            settings,
            v2_pool_address: str,
            v3_pool_address: str,
    ) -> None:
        self.http_rpc_url = http_rpc_url
        self.ws_rpc_url = ws_rpc_url
        self.web3 = Web3(HTTPProvider(http_rpc_url))
        self.chain = chain
        self.notifier = notifier
        self.settings = settings
        self.v2_pool_address = v2_pool_address
        self.v3_pool_address = v3_pool_address

        with open('./abi/v2_pool.json') as f:
            v2_pool_abi = json.loads(f.read())

        with open('./abi/v3_pool.json') as f:
            v3_pool_abi = json.loads(f.read())

        self.v2_pool_contract = self.web3.eth.contract(address=v2_pool_address, abi=v2_pool_abi)
        self.v3_pool_contract = self.web3.eth.contract(address=v3_pool_address, abi=v3_pool_abi)

    def get_relevant_accounts_with_thresholds(self) -> list[TrackedAccountWithHF]:
        """Get all accounts from the DB that belong to this chain and their threshold health factors"""
        return [
            TrackedAccountWithHF(
                account=TrackedAccount(
                    address='0x4bBa290826C253BD854121346c370a9886d1bC26',
                    chain=Chain.ETHEREUM_SEPOLIA,
                    aave_version='V3',
                ),
                health_factor_threshold=1.2,
            ),
            TrackedAccountWithHF(
                account=TrackedAccount(
                    address='0xFf385BB2bd955E906b5ED6A5535B9AFA6F9a3796',
                    chain=Chain.ETHEREUM_SEPOLIA,
                    aave_version='V3',
                ),
                health_factor_threshold=1.5,
            ),
        ]
        # return [
        #     TrackedAccountWithHF(
        #         account=TrackedAccount(
        #             address='0x4bBa290826C253BD854121346c370a9886d1bC26',
        #             chain=Chain.POLYGON_MUMBAI,
        #             aave_version='V2'
        #         ),
        #         health_factor_threshold=2.0,
        #     ),
        #     TrackedAccountWithHF(
        #         account=TrackedAccount(
        #             address='0x75a0b9a3d63c4a56198831369657d6D8F44BE25b',
        #             chain=Chain.POLYGON_MUMBAI,
        #             aave_version='V3',
        #         ),
        #         health_factor_threshold=1.8,
        #     )
        # ]

    def get_v2_health_factors(self, accounts_batch: list[TrackedAccountWithHF]) -> list[float]:
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
        
        print('aaaa v2 health factors', health_factors)
        return health_factors

    def get_v3_health_factors(self, accounts_batch: list[TrackedAccountWithHF]) -> list[float]:
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
        print('aaaa v3 health factors', health_factors)
        return health_factors

    def health_factor_periodic_task(self) -> None:
        """
        1. Get all accounts from the DB that belong to this chain and their threshold health factors.
        2. Check health factor of all these accounts.
        3. Check the health factors against the thresholds and send notifications if needed.
        """
        all_accounts = self.get_relevant_accounts_with_thresholds()
        v2_accounts = [account for account in all_accounts if account.account.aave_version == 'V2']
        v3_accounts = [account for account in all_accounts if account.account.aave_version == 'V3']

        v2_health_factors = []
        for batch in make_batches(v2_accounts, HEALTH_FACTOR_BATCH_SIZE):
            v2_health_factors += self.get_v2_health_factors(batch)
        
        v3_health_factors = []
        for batch in make_batches(v3_accounts, HEALTH_FACTOR_BATCH_SIZE):
            v3_health_factors += self.get_v3_health_factors(batch)
        
        for account, health_factor in zip(v2_accounts + v3_accounts, v2_health_factors + v3_health_factors):
            if health_factor < account.health_factor_threshold:
                self.notifier.notify_of_health_factor(account, health_factor)

    async def monitor_health_factor(self) -> None:
        """Periodically check health factor of all accounts on this chain"""
        while True:
            self.health_factor_periodic_task()
            await asyncio.sleep(HEALTH_FACTOR_CHECK_PERIOD)

    def catchup_on_liquidations(self) -> None:
        """Catchup on liquidations that occured while the program was not running"""
        last_v2_checked_block = self.settings.get_setting(f'LAST_{self.chain.name}_V2_CHECKED_BLOCK')
        v2_logs = self.web3.eth.get_logs({
            'address': self.v2_pool_address,
            'topics': [V2_LIQUIDATION_TOPIC],
            'fromBlock': last_v2_checked_block,
            'toBlock': 'latest',
        })
        for log in v2_logs:
            self.process_v2_liquidation_log(log)

        last_v3_checked_block = self.settings.get_setting(f'LAST_{self.chain.name}_V3_CHECKED_BLOCK')
        v3_logs = self.web3.eth.get_logs({
            'address': self.v3_pool_address,
            'topics': [V3_LIQUIDATION_TOPIC],
            'fromBlock': last_v3_checked_block,
            'toBlock': 'latest',
        })
        for log in v3_logs:
            self.process_v3_liquidation_log(log)

    def process_v2_liquidation_log(self, log: dict) -> None:
        """Process a single aave v2 liquidation log and emit a notification if the liquidated account is tracked."""
        ...
    
    def process_v3_liquidation_log(self, log: dict) -> None:
        """Process a single aave v3 liquidation log and emit a notification if the liquidated account is tracked."""
        ...

    async def monitor_liquidations(self, aave_version: AaveVersion) -> None:
        """Start monitoring liquidations by subscribing to the corresponding logs"""
        if aave_version == 'V2':
            pool_address = self.v2_pool_address
            liquidation_topic = V2_LIQUIDATION_TOPIC
        elif aave_version == 'V3':
            pool_address = self.v3_pool_address
            liquidation_topic = V3_LIQUIDATION_TOPIC
        else:
            raise AssertionError(f'Unknown aave version {aave_version}')

        async with websockets.connect(self.ws_rpc_url) as ws:
            await ws.send(json.dumps(build_subscription_message(pool_address, liquidation_topic)))
            raw_subscription_response = await ws.recv()

            try:
                decoded_subscription_response = json.loads(raw_subscription_response)
            except json.decoder.JSONDecodeError:
                raise StartupException(f'Failed to decode subscription response {raw_subscription_response} for {self.chain.name} aave {aave_version}')

            if 'error' in decoded_subscription_response:
                raise StartupException(f'Failed to subscribe to liquidations for {self.chain.name} aave {aave_version}. Subscription response was {decoded_subscription_response}')

            logger.info(f'Successfully subscribed to liquidations for {self.chain.name} aave {aave_version}')
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
                
                print(decoded_message)
