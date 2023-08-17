from typing import NamedTuple, Literal, Type
from enum import Enum


class Chain(Enum):
    ETHEREUM = 'ETHEREUM'
    ETHEREUM_SEPOLIA = 'ETHEREUM_SEPOLIA'
    POLYGON = 'POLYGON'
    POLYGON_MUMBAI = 'POLYGON_MUMBAI'
    OPTIMISM = 'OPTIMISM'
    ARBITRUM = 'ARBITRUM'
    AVALANCHE = 'AVALANCHE'
    METIS = 'METIS'


class ChainAccount(NamedTuple):
    address: str
    chain: Chain
    aave_version: int

    def __str__(self) -> str:
        return f'{self.address} on {self.chain.value} x Aave V{self.aave_version}'


class ChainAccountWithHF(NamedTuple):
    account: ChainAccount
    health_factor_threshold: float
