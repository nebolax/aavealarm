from backend.types import ChainAccount
from backend.database import Database
from typing import Literal
from datetime import datetime
import onesignal
from onesignal.api import default_api
import os
from dotenv import load_dotenv

load_dotenv()

EventType = Literal['liquidation', 'health_factor']

configuration = onesignal.Configuration(app_key = os.environ["ONESIGNAL_APP_KEY"])
ONESIGMAL_APP_ID = os.environ["ONESIGNAL_APP_ID"]

HEALTH_FACTOR_NOTIFICATION_INTERVAL = 60 * 60 * 12  # 12 hours

class Notifier:
    def __init__(self, database: Database) -> None:
        self.database = database

    def send_single_notificaion(self, onesignal_user_id: str, title: str, message: str) -> None:
        print('Sending a notification.', onesignal_user_id, title, message)
        with onesignal.ApiClient(configuration) as api_client:
            api_instance = default_api.DefaultApi(api_client)
            notification = default_api.Notification(
                app_id=ONESIGMAL_APP_ID,
                include_player_ids=[onesignal_user_id],
                target_channel='push',
                headings={'en': title},
                contents={'en': message},
            )

            try:
                # Create notification
                api_instance.create_notification(notification)
            except onesignal.ApiException as e:
                print("Exception when calling DefaultApi->create_notification: %s\n" % e)

    def notify(self, chain_account: ChainAccount, event_type: EventType, title: str, message: str) -> None:
        suubscribed_accounts = self.database.get_users_for_notification(chain_account)
        for user_account in suubscribed_accounts:
            onesignal_id, last_health_factor_notification_timestamp = user_account
            if onesignal_id is None:
                continue

            if (
                event_type == 'health_factor' and
                last_health_factor_notification_timestamp is not None and
                int(datetime.utcnow().timestamp()) - int(last_health_factor_notification_timestamp.timestamp()) < HEALTH_FACTOR_NOTIFICATION_INTERVAL
            ):
                continue  # Notification has been sent recently
            
            self.send_single_notificaion(onesignal_id, title, message)
