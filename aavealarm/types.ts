export enum Chain {
  ETHEREUM = "ETHEREUM",
  ETHEREUM_SEPOLIA = "ETHEREUM_SEPOLIA",
  POLYGON = "POLYGON",
  POLYGON_MUMBAI = "POLYGON_MUMBAI",
  AVALANCHE = "AVALANCHE",
}

export interface ChainAccount {
  chain: Chain;
  address: string;
  aaveVersion: number;
}

export interface SingleAssetUsageInfo {
  symbol: string;
  supplied?: number; // undefined means not supported
  borrowed?: number; // undefined means not supported
}

export interface ChainAccountData {
  healthFactor: number;
  netAPY: number;
  assets: SingleAssetUsageInfo[];
}

export interface SingleChainAaveTokenInfo {
  symbol: string;
  aToken?: string;
  stableDebtToken?: string;
  variableDebtToken?: string;
}

export type AaveTokensPerChain = {
  [key in Chain]: SingleChainAaveTokenInfo[];
};

export type RpcsPerChain = {
  [key in Chain]: string;
};
