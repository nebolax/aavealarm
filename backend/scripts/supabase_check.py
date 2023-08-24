from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()


supabase: Client = create_client(
    'https://bectdkadeegvxebkqzmh.supabase.co',
    os.environ['SUPABASE_KEY'],
)
# supabase.auth.sign_up({
#     'email': '2b7fe6b7-13bd-46c9-8885-44d254bebc13@aavealarm.com',
#     'password': 'aavealarm',
# })
# print('Signed up!')

supabase.from_('account').update({'last_health_factor_notification': '1970-01-01T00:00:00'}).is_('last_health_factor_notification', 'null').execute()