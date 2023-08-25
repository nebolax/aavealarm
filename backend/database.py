from datetime import datetime

from supabase import Client, create_client

from backend.types import Chain, ChainAccount, ChainAccountWithAllData

HEALTH_FACTOR_NOTIFICATION_INTERVAL = 60 * 60 * 12  # 12 hours

class Database:
    def __init__(self, supabase_url: str, supabase_key: str) -> None:
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def get_setting(self, key: str) -> any:
        response = self.supabase.table('setting').select('value').eq('key', key).execute()
        if len(response.data) == 0:
            return None
        return response.data[0]['value']
    
    def set_setting(self, key: str, value: any) -> None:
        self.supabase.table('setting').upsert({'key': key, 'value': value}).execute()

    def is_tracked(self, account: ChainAccount):
        """Check if the given account is tracked by at least one user of the app"""
        response = self.supabase.table('account').select('count').eq('address', account.address).eq('chain', account.chain.value).eq('aave_version', account.aave_version).execute()
        return response.data[0]['count'] > 0

    def get_users_for_notification(self, account: ChainAccount) -> list[tuple[str | None, datetime]]:
        """Queries users' onesignal id and accounts' last health factor notification timestamp"""
        raw_users = self.supabase.table('account').select('user(onesignal_id), user_id, last_health_factor_notification').eq('address', account.address).eq('chain', account.chain.value).eq('aave_version', account.aave_version).execute()
        users_data = []
        for raw_user in raw_users.data:
            users_data.append((raw_user['user']['onesignal_id'], raw_user['user_id']))

        return users_data
    
    def set_last_health_factor_notification(self, account: ChainAccount, user_id: str, timestamp: datetime) -> None:
        """Set the last health factor notification timestamp for the given account"""
        self.supabase.table('account').update({'last_health_factor_notification': timestamp.isoformat()}).eq('address', account.address).eq('chain', account.chain.value).eq('aave_version', account.aave_version).eq('user_id', user_id).execute()

    def get_accounts_for_hf_check(self, chain: Chain, aave_version: int) -> list[ChainAccountWithAllData]:
        """Get accounts across all app users to check their health factors"""
        raw_accounts = self.supabase.table('account').select('address, chain, aave_version, user(health_factor_threshold, onesignal_id), user_id, last_health_factor_notification').eq('chain', chain.value).eq('aave_version', aave_version).execute()
        accounts = []
        current_timestamp_seconds = int(datetime.utcnow().timestamp()) 
        for raw_account in raw_accounts.data:
            account = ChainAccountWithAllData(
                account=ChainAccount(
                  address=raw_account['address'],
                  chain=Chain(raw_account['chain']),
                  aave_version=raw_account['aave_version'],
                ),
                health_factor_threshold=raw_account['user']['health_factor_threshold'],
                user_id=raw_account['user_id'],
                onesignal_id=raw_account['user']['onesignal_id'],
            )
            last_sent_seconds = int(datetime.fromisoformat(raw_account['last_health_factor_notification']).timestamp())
            if current_timestamp_seconds - last_sent_seconds < HEALTH_FACTOR_NOTIFICATION_INTERVAL:
                # Notification has been sent recently
                continue

            accounts.append(account)

        return accounts
