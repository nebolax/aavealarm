from backend.types import ChainAccount
from backend.database import Database
from typing import Literal
from datetime import datetime
import onesignal
from onesignal.api import default_api
import os
from dotenv import load_dotenv
import logging

load_dotenv()
EventType = Literal['liquidation', 'health_factor']

configuration = onesignal.Configuration(app_key = os.environ["ONESIGNAL_APP_KEY"])
ONESIGMAL_APP_ID = os.environ["ONESIGNAL_APP_ID"]

HEALTH_FACTOR_NOTIFICATION_INTERVAL = 60 * 60 * 12  # 12 hours

class Notifier:
    def __init__(self, database: Database) -> None:
        self.database = database

    def send_single_notificaion(self, onesignal_user_id: str, title: str, message: str) -> None:
        logging.info(f'Sending a notification to {onesignal_user_id} about {title}')
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
                logging.info(f'Calling DefaultApi->create_notification for {onesignal_user_id} about {title}')
                api_instance.create_notification(notification)
                logging.info(f'Notification about {title} was successfully sent to {onesignal_user_id}!')
            except onesignal.ApiException as e:
                logging.error(f'Exception when calling DefaultApi->create_notification for {onesignal_user_id} about {title}: {str(e)}')

    def notify(self, chain_account: ChainAccount, event_type: EventType, title: str, message: str) -> None:
        logging.info(f'Might send a notification about {event_type} on {str(chain_account)}')
        subscribed_accounts = self.database.get_users_for_notification(chain_account)
        logging.info(f'Found {len(subscribed_accounts)} subscribed accounts on {str(chain_account)}')
        for user_account in subscribed_accounts:
            onesignal_id, last_health_factor_notification_timestamp = user_account
            if onesignal_id is None:
                logging.error(f'Bad! No onesignal id was sent for a user account that tracks {str(chain_account)}')
                continue

            current_timestamp_seconds = int(datetime.utcnow().timestamp()) 
            last_sent_seconds = int(last_health_factor_notification_timestamp.timestamp())
            if (
                event_type == 'health_factor' and
                last_health_factor_notification_timestamp is not None and
                current_timestamp_seconds - last_sent_seconds < HEALTH_FACTOR_NOTIFICATION_INTERVAL
            ):
                logging.info(f'Not sending a notification to {onesignal_id} about {event_type} on {str(chain_account)} because the last notification was sent recently. Current time: {current_timestamp_seconds}, last sent: {last_sent_seconds}, interval: {HEALTH_FACTOR_NOTIFICATION_INTERVAL}')
                continue  # Notification has been sent recently
            
            self.send_single_notificaion(onesignal_id, title, message)
            self.database.set_last_health_factor_notification(chain_account, datetime.utcnow())
            logging.info(f'Sent a notification to {onesignal_id} about {event_type} on {str(chain_account)} and set the last notification timestamp')
