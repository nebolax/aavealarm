import Web3 from "web3";
import {
  ChainAccountData,
  ChainAccount,
  Chain,
  AaveTokensPerChain,
  RpcsPerChain,
} from "./types";
import Constants from "expo-constants";

const CHAIN_TO_RPC: RpcsPerChain = {
  [Chain.ETHEREUM]: Constants.expoConfig!!.extra!!.ethereumHttpRpcUrl,
  [Chain.ETHEREUM_SEPOLIA]:
    Constants.expoConfig!!.extra!!.ethereumSepoliaHttpRpcUrl,
  [Chain.POLYGON]: Constants.expoConfig!!.extra!!.polygonHttpRpcUrl,
  [Chain.POLYGON_MUMBAI]:
    Constants.expoConfig!!.extra!!.polygonMumbaiHttpRpcUrl,
  [Chain.AVALANCHE]: Constants.expoConfig!!.extra!!.avalancheHttpRpcUrl,
};

const CHAIN_TO_TOKENS: AaveTokensPerChain = {
  [Chain.ETHEREUM]: [],
  [Chain.ETHEREUM_SEPOLIA]: [],
  [Chain.POLYGON]: [],
  [Chain.POLYGON_MUMBAI]: [],
  [Chain.AVALANCHE]: [],
};

export function queryAccountData(account: ChainAccount): ChainAccountData {
  const rpcUrl = CHAIN_TO_RPC[account.chain as keyof typeof CHAIN_TO_RPC];
  // const web3 = new Web3(rpcUrl);
  // web3.eth.call({ to: "" });
  return {
    healthFactor: 2.3,
    netAPY: 5.6,
    assets: [
      {
        symbol: "GHO",
        supplied: undefined,
        borrowed: 1234.56,
      },
    ],
  };
}

export function getAllTrackedAccounts(): ChainAccount[] {
  return [];
}
