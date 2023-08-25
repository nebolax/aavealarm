from unittest.mock import patch

import freezegun

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
                'address': '0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 1.4,
                  'onesignal_id': 'onesignal-id-1'
                },
                'user_id': 'user-id-1',
                'last_health_factor_notification': '2023-08-25T02:00:00.00000',
            },
            {
                'address': '0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25',
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
                'address': '0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25',
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
                'address': '0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25',
                'chain': 'ETHEREUM',
                'aave_version': 2,
                'user': {
                  'health_factor_threshold': 1.5,
                  'onesignal_id': 'onesignal-id-4'
                },
                'user_id': 'user-id-4',
                'last_health_factor_notification': '2023-08-25T02:00:00.00000',
            }
          ]
        
    execute_patch = patch.object(database, '_get_raw_accounts', new=new_get_raw_accounts)

    def new_create_notification(self, notification):
       sent_notifications.append((notification['include_player_ids'], notification['headings']['en'], notification['contents']['en']))

    create_notification_patch = patch('backend.notifier.default_api.DefaultApi.create_notification', new=new_create_notification)

    connector = ChainConnector(
        chain=Chain.ETHEREUM,
        http_rpc_url='https://it-is-mocked.anyway',
        ws_rpc_url='https://it-is-mocked.anyway',
        notifier=notifier,
        database=database,
        pool_address='0xB3E147cCc3822c84f94719487C3031Fd24513F92',
        aave_version=2,
    )

    def new_get_health_factors(accounts_batch):
      return [1.37] * 4

    get_health_factors_patch = patch.object(connector, 'get_health_factors', new=new_get_health_factors)

    disable_set_last_health_factor_notification_patch = patch.object(database, 'set_last_health_factor_notification', new=lambda account, user_id, timestamp: None)
    
    with execute_patch, get_health_factors_patch, disable_set_last_health_factor_notification_patch, create_notification_patch:
      connector.check_health_factors()

    assert sent_notifications == [
       (['onesignal-id-1'], 'Low health factor!', 'Health factor on your account Ethereum 0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25 is 1.37 which is below the threshold of 1.4.'),
       (['onesignal-id-4'], 'Low health factor!', 'Health factor on your account Ethereum 0xd9c4F1a86603A969898277E0D1F5B6eD6C4F6D25 is 1.37 which is below the threshold of 1.5.'),
    ]
