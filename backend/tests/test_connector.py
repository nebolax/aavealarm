from backend.connector import ChainConnector
from backend.types import Chain, TrackedAccount
from backend.notifier import Notifier
import asyncio


def test_connector_sepolia():
  sepolia = ChainConnector(
      chain=Chain.ETHEREUM_SEPOLIA,
      http_rpc_url='https://eth-sepolia.g.alchemy.com/v2/RnThVWRXy3tMf5kXEXSXUXOaGSAonKbS',
      ws_rpc_url='wss://eth-sepolia.g.alchemy.com/v2/RnThVWRXy3tMf5kXEXSXUXOaGSAonKbS',
      notifier=Notifier(),
      settings=None,
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
      settings=None,
      v2_pool_address='0x9198F13B08E299d85E096929fA9781A1E3d5d827',
      v3_pool_address='0x0b913A76beFF3887d35073b8e5530755D60F78C7',
  )
  asyncio.run(mumbai.monitor_health_factor())
