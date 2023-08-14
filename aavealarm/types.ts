import { ReserveDataHumanized } from "@aave/contract-helpers";

export enum Chain {
  ETHEREUM = "ETHEREUM",
  ETHEREUM_SEPOLIA = "ETHEREUM_SEPOLIA",
  POLYGON = "POLYGON",
  POLYGON_MUMBAI = "POLYGON_MUMBAI",
  AVALANCHE = "AVALANCHE",
  ARBITRUM = "ARBITRUM",
  METIS = "METIS",
  OPTIMISM = "OPTIMISM",
}

export const AAVE_V2_CHAINS = [
  Chain.ETHEREUM,
  Chain.POLYGON,
  Chain.POLYGON_MUMBAI,
  Chain.AVALANCHE,
];

export interface ChainAccount {
  chain: Chain;
  address: string;
  aaveVersion: 2 | 3;
}

export interface SingleAssetUsageInfo {
  symbol: string;
  supplied?: number; // undefined means not supported
  borrowed?: number; // undefined means not supported
}

export interface ChainAccountData {
  healthFactor: number;
  netAPY: number;
  totalSupplied: number;
  totalBorrowed: number;
  assets: SingleAssetUsageInfo[];
}

export interface SingleChainAaveTokenInfo {
  symbol: string;
  decimals: number;
  aToken?: string;
  stableDebtToken?: string;
  variableDebtToken?: string;
}

export interface X {
  v2: string;
  // v3: string;
}

export type AaveLendingPoolsPerChain = {
  [key in Chain]: { v2?: string; v3?: string };
};

export type RpcsPerChain = {
  [key in Chain]: string;
};

export type IconsPerChain = {
  [key in Chain]: any;
};

export type ReservesMapping = {
  [key: string]: ReserveDataHumanized;
};
