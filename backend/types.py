from typing import NamedTuple, Literal, Type
from enum import Enum


class Chain(Enum):
    ETHEREUM = 'ETHEREUM'
    ETHEREUM_SEPOLIA = 'ETHEREUM_SEPOLIA'
    POLYGON_MUMBAI = 'POLYGON_MUMBAI'


class ChainAccount(NamedTuple):
    address: str
    chain: Chain
    aave_version: int


class ChainAccountWithHF(NamedTuple):
    account: ChainAccount
    health_factor_threshold: float
