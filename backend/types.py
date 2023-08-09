from typing import NamedTuple, Literal, Type
from enum import Enum

AaveVersion = Literal['V2', 'V3']


class Chain(Enum):
    ETHEREUM = 'ETHEREUM'
    ETHEREUM_SEPOLIA = 'ETHEREUM_SEPOLIA'
    POLYGON_MUMBAI = 'POLYGON_MUMBAI'


class TrackedAccount(NamedTuple):
    address: str
    chain: Chain
    aave_version: AaveVersion


class TrackedAccountWithHF(NamedTuple):
    account: TrackedAccount
    health_factor_threshold: float
