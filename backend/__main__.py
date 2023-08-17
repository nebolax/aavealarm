import asyncio
from backend.connector import ChainConnector
from dotenv import load_dotenv
from backend.types import Chain
from backend.database import Database
from backend.notifier import Notifier
import logging
import os
import sys

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(pathname)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler(sys.stdout),
    ],
    force=True,
)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.info('Starting backend')

LENDING_POOL_ADDRESSES = {
    Chain.ETHEREUM: ("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"),
    Chain.ETHEREUM_SEPOLIA: (None, "0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08"),
    Chain.POLYGON: ("0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf", "0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
    Chain.POLYGON_MUMBAI: ("0x9198F13B08E299d85E096929fA9781A1E3d5d827", "0x0b913A76beFF3887d35073b8e5530755D60F78C7"),
    Chain.AVALANCHE: ("0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C", "0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
    Chain.OPTIMISM: (None, "0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
    Chain.ARBITRUM: (None, "0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
    Chain.METIS: (None, "0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57"),
}

database = Database(
    supabase_url=os.environ['SUPABASE_URL'],
    supabase_key=os.environ['SUPABASE_KEY'],
)
logging.info('Connected to database')
notifier = Notifier(database=database)

connectors: list[ChainConnector] = []
for chain in Chain:
    v2_pool_address, v3_pool_address = LENDING_POOL_ADDRESSES[chain]
    if v2_pool_address is not None:
        connectors.append(ChainConnector(
            chain=chain,
            http_rpc_url=os.environ[f'{chain.value}_HTTP_RPC'],
            ws_rpc_url=os.environ[f'{chain.value}_WS_RPC'],
            notifier=notifier,
            database=database,
            pool_address=v2_pool_address,
            aave_version=2,
        ))
    
    if v3_pool_address is not None:
        connectors.append(ChainConnector(
            chain=chain,
            http_rpc_url=os.environ[f'{chain.value}_HTTP_RPC'],
            ws_rpc_url=os.environ[f'{chain.value}_WS_RPC'],
            notifier=notifier,
            database=database,
            pool_address=v3_pool_address,
            aave_version=3,
        ))

logging.info('Created connectors')

loop = asyncio.get_event_loop()
for connector in connectors:
    loop.create_task(connector.monitor_health_factor())
    loop.create_task(connector.monitor_liquidations())

logging.info('Started monitoring tasks')
loop.run_forever()
