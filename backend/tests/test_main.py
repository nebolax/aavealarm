from backend.connector import ChainConnector
from backend.types import Chain, ChainAccount
from backend.notifier import Notifier
import asyncio
from backend.database import Database
from dotenv import load_dotenv
import os

load_dotenv()


def test_connector_sepolia():
  sepolia = ChainConnector(
      chain=Chain.ETHEREUM_SEPOLIA,
      http_rpc_url='https://eth-sepolia.g.alchemy.com/v2/RnThVWRXy3tMf5kXEXSXUXOaGSAonKbS',
      ws_rpc_url='wss://eth-sepolia.g.alchemy.com/v2/RnThVWRXy3tMf5kXEXSXUXOaGSAonKbS',
      notifier=Notifier(),
      database=Database(supabase_url=os.environ['SUPABASE_URL'], supabase_key=os.environ['SUPABASE_KEY']),
      v2_pool_address='0x4bBa290826C253BD854121346c370a9886d1bC26',
      v3_pool_address='0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08',
  )

  # sepolia.get_v3_health_factors([
  #     TrackedAccount(
  #         address='0x4bBa290826C253BD854121346c370a9886d1bC26',
  #         chain=Chain.SEPOLIA,
  #         aave_version='V3',
  #     ),
  #     TrackedAccount(
  #       address='0xFf385BB2bd955E906b5ED6A5535B9AFA6F9a3796',
  #       chain=Chain.SEPOLIA,
  #       aave_version='V3',
  #     )
  # ])
  asyncio.run(sepolia.monitor_health_factor())


def test_connector_mumbai():
  mumbai = ChainConnector(
      chain=Chain.POLYGON_MUMBAI,
      http_rpc_url='https://polygon-mumbai.g.alchemy.com/v2/T6BEeVSoZHkas0HErYvmRcJA4QtfrhXQ',
      ws_rpc_url='wss://polygon-mumbai.g.alchemy.com/v2/T6BEeVSoZHkas0HErYvmRcJA4QtfrhXQ',
      notifier=Notifier(),
      v2_pool_address='0x9198F13B08E299d85E096929fA9781A1E3d5d827',
      v3_pool_address='0x0b913A76beFF3887d35073b8e5530755D60F78C7',
  )
  asyncio.run(mumbai.monitor_health_factor())


def test_liquidations():
  database = Database(supabase_url=os.environ['SUPABASE_URL'], supabase_key=os.environ['SUPABASE_KEY'])
  ethereum = ChainConnector(
      chain=Chain.ETHEREUM,
      http_rpc_url='https://eth-mainnet.g.alchemy.com/v2/h4hPadoY1pblG5s8rvQIJo7VIApDlmSc',
      ws_rpc_url='wss://eth-mainnet.g.alchemy.com/v2/h4hPadoY1pblG5s8rvQIJo7VIApDlmSc',
      notifier=Notifier(database=database),
      database=database,
      v2_pool_address='0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      v3_pool_address='0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  )
  ethereum.catchup_on_liquidations()


def test_database():
  database = Database(supabase_url=os.environ['SUPABASE_URL'], supabase_key=os.environ['SUPABASE_KEY'])
  # print(database.get_all_accounts_with_health_factors_on_chain(Chain.ETHEREUM_SEPOLIA))
  account = ChainAccount(
    address='0x4bBa290826C253BD854121346c370a9886d1bC26',
    chain=Chain.ETHEREUM_SEPOLIA,
    aave_version=3,
  )
  # print(database.is_tracked(account))
  print(database.get_users_for_notification(account))


def test_notifier():
  notifier = Notifier(Database(
    supabase_url=os.environ['SUPABASE_URL'], supabase_key=os.environ['SUPABASE_KEY']
  ))
  notifier.send_single_notificaion('983068ac-bd23-4cbd-b638-dd87e89e50d1', title='Test title', message='Test message')
