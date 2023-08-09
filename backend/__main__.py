import asyncio
from backend.connector import ChainConnector
from dotenv import load_dotenv
from backend.types import Chain

load_dotenv()

asyncio.run(ChainConnector(Chain.ETHEREUM, None, None, None, None).monitor_liquidations(aave_version='V2'))
# print(Chain.ETHEREUM.name)