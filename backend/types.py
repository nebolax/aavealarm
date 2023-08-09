from typing import NamedTuple, Literal, Type
from enum import Enum

AaveVersion = Literal['V2', 'V3']


class Chain(Enum):
    ETHEREUM = 'ETHEREUM'


class TrackedAccount(NamedTuple):
    address: str
    chain: Chain
    aave_version: AaveVersion


class TrackedAccountWithHF(NamedTuple):
    account: TrackedAccount
    health_factor_threshold: float
