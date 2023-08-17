import asyncio
from backend.connector import ChainConnector
from dotenv import load_dotenv
from backend.types import Chain
from backend.database import Database
from backend.notifier import Notifier
import os

load_dotenv()

database = Database(
    supabase_url=os.environ['SUPABASE_URL'],
    supabase_key=os.environ['SUPABASE_KEY'],
)
asyncio.run(ChainConnector(
    chain=Chain.ETHEREUM,
    http_rpc_url='https://eth-mainnet.g.alchemy.com/v2/h4hPadoY1pblG5s8rvQIJo7VIApDlmSc',
    ws_rpc_url='wss://rpc.ankr.com/eth/ws/8e7d67046647f68fd233a0c772f3182e368e78b530a00b5674cbb7757acc9905',
    database=database,
    notifier=Notifier(database=database),
    v2_pool_address='0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    v3_pool_address='0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
).monitor_liquidations(aave_version=2))
