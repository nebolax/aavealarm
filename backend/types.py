from enum import Enum
from typing import NamedTuple


class Chain(Enum):
    ETHEREUM = 'ETHEREUM'
    ETHEREUM_SEPOLIA = 'ETHEREUM_SEPOLIA'
    POLYGON = 'POLYGON'
    POLYGON_MUMBAI = 'POLYGON_MUMBAI'
    OPTIMISM = 'OPTIMISM'
    ARBITRUM = 'ARBITRUM'
    AVALANCHE = 'AVALANCHE'
    METIS = 'METIS'
    BASE = 'BASE'

    def __str__(self) -> str:
        if self == Chain.ETHEREUM_SEPOLIA:
            return 'Sepolia'
        elif self == Chain.POLYGON_MUMBAI:
            return 'Mumbai'
        else:
            return self.value.capitalize()


class ChainAccount(NamedTuple):
    address: str
    chain: Chain
    aave_version: int

    def __str__(self) -> str:
        return f'{self.address} on {str(self.chain)} x Aave V{self.aave_version}'


class ChainAccountWithAllData(NamedTuple):
    account: ChainAccount
    health_factor_threshold: float
    user_id: str
    onesignal_id: str | None
