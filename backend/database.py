from backend.types import ChainAccount, Chain, ChainAccountWithHF
from supabase import create_client, Client
from datetime import datetime

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

    def get_users_for_notification(self, account: ChainAccount) -> list[tuple[str | None, int]]:
        """Queries users' onesignal id and accounts' last health factor notification timestamp"""
        raw_users = self.supabase.table('account').select('user(onesignal_id), last_health_factor_notification').eq('address', account.address).eq('chain', account.chain.value).eq('aave_version', account.aave_version).execute()
        users_data = []
        for raw_user in raw_users.data:
            last_health_factor_notification = None
            if raw_user['last_health_factor_notification'] is not None:
                last_health_factor_notification = datetime.fromisoformat(raw_user['last_health_factor_notification'])

            users_data.append((raw_user['user']['onesignal_id'], last_health_factor_notification))

        return users_data
    
    def set_last_health_factor_notification(self, account: ChainAccount, timestamp: datetime) -> None:
        """Set the last health factor notification timestamp for the given account"""
        self.supabase.table('account').update({'last_health_factor_notification': timestamp.isoformat()}).eq('address', account.address).eq('chain', account.chain.value).eq('aave_version', account.aave_version).execute()

    def get_all_accounts_with_health_factors(self, chain: Chain, aave_version: int) -> list[ChainAccount]:
        """Get accounts across all app users that belong to the given chain"""
        raw_accounts = self.supabase.table('account').select('address, chain, aave_version, user(health_factor_threshold)').eq('chain', chain.value).eq('aave_version', aave_version).execute()
        accounts = []
        for raw_account in raw_accounts.data:
            accounts.append(ChainAccountWithHF(
                account=ChainAccount(
                  address=raw_account['address'],
                  chain=Chain(raw_account['chain']),
                  aave_version=raw_account['aave_version'],
                ),
                health_factor_threshold=raw_account['user']['health_factor_threshold'],
            ))
        return list(set(accounts))  # remove duplicates
