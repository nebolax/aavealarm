from unittest.mock import patch

import freezegun
from web3.contract.contract import ContractFunction
from web3.types import HexBytes

from backend.connector import ChainConnector
from backend.database import Database
from backend.notifier import Notifier
from backend.types import Chain


@freezegun.freeze_time('2023-08-25 20:00:00')
def test_low_health_factor():
    """Test that if health factor is low, the notifications are sent.
    This test uses 4 accounts. Notifications should be sent for 1 and 4 accounts.
    On account 2 the notification was sent too recently.
    On account 3 the health factor threshold is lower than the actual health factor.
    """
    sent_notifications = []

    with patch('backend.database.create_client', new=lambda x, y: object):
      database = Database(
        supabase_url='https://mocked.url',
        supabase_key='mocked-key'
      )
    
    notifier = Notifier(database=database)

    def new_get_raw_accounts(chain, aave_version):
        return [
            {
                'address': '0x28fe46db880072E129816EE2BCE5BC5a9712A058',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 2.2,
                  'onesignal_id': 'onesignal-id-1'
                },
                'user_id': 'user-id-1',
                'last_health_factor_notification': '2023-08-25T02:00:00.00000',
            },
            {
                'address': '0xFbE87d602F7d7Dd511349BE4aCF58842392124a0',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 1.4,
                  'onesignal_id': 'onesignal-id-2'
                },
                'user_id': 'user-id-2',
                'last_health_factor_notification': '2023-08-25T10:00:00.00000',
            },
            {
                'address': '0x28fe46db880072E129816EE2BCE5BC5a9712A058',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 1.2,
                  'onesignal_id': 'onesignal-id-3'
                },
                'user_id': 'user-id-3',
                'last_health_factor_notification': '2023-08-25T02:00:00.00000',
            },
            {
                'address': '0xFbE87d602F7d7Dd511349BE4aCF58842392124a0',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 1.8,
                  'onesignal_id': 'onesignal-id-4'
                },
                'user_id': 'user-id-4',
                'last_health_factor_notification': '2023-08-25T02:00:00.00000',
            }
          ]
        
    get_raw_accounts_patch = patch.object(database, '_get_raw_accounts', new=new_get_raw_accounts)

    def new_create_notification(self, notification):
       sent_notifications.append((notification['include_player_ids'], notification['headings']['en'], notification['contents']['en']))

    create_notification_patch = patch('backend.notifier.default_api.DefaultApi.create_notification', new=new_create_notification)

    connector = ChainConnector(
        chain=Chain.ETHEREUM,
        http_rpc_url='https://eth.llamarpc.com',
        notifier=notifier,
        database=database,
        pool_address='0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
        aave_version=2,
    )
  
    disable_set_last_health_factor_notification_patch = patch.object(database, 'set_last_health_factor_notification', new=lambda account, user_id, timestamp: None)
    
    with get_raw_accounts_patch, disable_set_last_health_factor_notification_patch, create_notification_patch:
      connector.check_health_factors()

    assert sent_notifications == [
       (['onesignal-id-1'], 'Low health factor!', 'Health factor on your account Ethereum 0x28fe46db880072E129816EE2BCE5BC5a9712A058 is 1.56 which is below the threshold of 2.2.'),
       (['onesignal-id-4'], 'Low health factor!', 'Health factor on your account Ethereum 0xFbE87d602F7d7Dd511349BE4aCF58842392124a0 is 1.53 which is below the threshold of 1.8.'),
    ]


def test_liquidation():
    sent_notifications = []

    with patch('backend.database.create_client', new=lambda x, y: object):
      database = Database(
        supabase_url='https://mocked.url',
        supabase_key='mocked-key'
      )

    def new_get_setting(setting_key):
        return '10000'

    get_setting_patch = patch.object(database, 'get_setting', new=new_get_setting)
    
    notifier = Notifier(database=database)

    def new_create_notification(self, notification):
       sent_notifications.append((notification['include_player_ids'], notification['headings']['en'], notification['contents']['en']))

    create_notification_patch = patch('backend.notifier.default_api.DefaultApi.create_notification', new=new_create_notification)

    connector = ChainConnector(
        chain=Chain.ETHEREUM,
        http_rpc_url='https://it-is-mocked.anyway',
        notifier=notifier,
        database=database,
        pool_address='0xB3E147cCc3822c84f94719487C3031Fd24513F92',
        aave_version=2,
    )

    def new_get_logs(*args, **kwargs):
       return [
          {
            'address': '0xB3E147cCc3822c84f94719487C3031Fd24513F92',
            'topics': [
               HexBytes('0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286'),
               HexBytes('0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
               HexBytes('0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7'),
               HexBytes('0x000000000000000000000000612348cd2197d941b0aefd2e133d3591b26997c1'),
            ],
            'data': bytes.fromhex('000000000000000000000000000000000000000000000000000000000f512a5600000000000000000000000000000000000000000000000002466c495f276f3c000000000000000000000000b6569481dccddd527c2b0e8ba32f494e52224ca10000000000000000000000000000000000000000000000000000000000000000'),
          },
       ]

    get_logs_patch = patch('web3.eth.eth.Eth.get_logs', new=new_get_logs)

    block_number_patch = patch('web3.eth.eth.Eth.block_number', new=10010)

    is_tracked_patch = patch.object(database, 'is_tracked', new=lambda account: True)

    def new_contract_call(self: ContractFunction, *args, **kwargs):
        if self.fn_name == 'decimals':
            if self.address == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
                return 18
            else:
                return 6
        if self.fn_name == 'symbol':
            if self.address == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
                return 'WETH'
            else:
                return 'USDT'

    contract_call_patch = patch('web3.contract.contract.ContractFunction.call', new=new_contract_call)
    
    get_users_for_notification_patch = patch.object(database, 'get_users_for_notification', new=lambda account: [('onesignal-id-1', 'user-id-1'), ('onesignal-id-2', 'user-id-2')])
    disable_set_setting_patch = patch.object(database, 'set_setting', new=lambda key, value: None)

    with create_notification_patch, get_logs_patch, get_setting_patch, block_number_patch, is_tracked_patch, contract_call_patch, get_users_for_notification_patch, disable_set_setting_patch:
      connector.catchup_on_liquidations()

    assert sent_notifications == [
       (['onesignal-id-1'], 'Liquidation occured!', 'Your account 0x612348CD2197D941B0AEfd2e133d3591B26997c1 on chain ETHEREUM was liquidated. WETH 0.1639374988304341 was liquidated to cover USDT 256.977494 debt.'),
       (['onesignal-id-2'], 'Liquidation occured!', 'Your account 0x612348CD2197D941B0AEfd2e133d3591B26997c1 on chain ETHEREUM was liquidated. WETH 0.1639374988304341 was liquidated to cover USDT 256.977494 debt.'),
    ]
