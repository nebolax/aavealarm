import {
  ChainAccountData,
  ChainAccount,
  Chain,
  AaveTokensPerChain,
  RpcsPerChain,
} from "./types";
// import { Eth } from "ethjs-query";
// import { HttpProvider } from "ethjs-provider-http";
import { JsonRpcProvider } from "@ethersproject/providers";

const CHAIN_TO_RPC: RpcsPerChain = {
  [Chain.ETHEREUM]:
    "https://eth-mainnet.g.alchemy.com/v2/8dkR-PhYDMve3Fgcr4plaGT3kR9-TqcH",
  [Chain.ETHEREUM_SEPOLIA]:
    "https://eth-sepolia.g.alchemy.com/v2/RnThVWRXy3tMf5kXEXSXUXOaGSAonKbS",
  [Chain.POLYGON]:
    "https://polygon-mainnet.g.alchemy.com/v2/eFl5LMFfG5ocvZwgiAgwwrrHngWnZztM",
  [Chain.POLYGON_MUMBAI]:
    "https://polygon-mumbai.g.alchemy.com/v2/T6BEeVSoZHkas0HErYvmRcJA4QtfrhXQ",
  [Chain.AVALANCHE]: "https://avalancherpc.com",
};

const CHAIN_TO_TOKENS: AaveTokensPerChain = {
  [Chain.ETHEREUM]: [],
  [Chain.ETHEREUM_SEPOLIA]: [
    {
      symbol: "AAVE",
      aToken: "0xD3B304653E6dFb264212f7dd427F9E926B2EaA05",
    },
  ],
  [Chain.POLYGON]: [],
  [Chain.POLYGON_MUMBAI]: [],
  [Chain.AVALANCHE]: [],
};

export async function queryAccountData(
  account: ChainAccount
): Promise<ChainAccountData> {
  const rpcUrl = CHAIN_TO_RPC[account.chain as keyof typeof CHAIN_TO_RPC];
  console.log("aaaa rpcUrl", rpcUrl);
  const provider = new JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(account.address);
  console.log("aaaa balance", parseInt(balance._hex, 16) / 1e18);
  const tokensInfo =
    CHAIN_TO_TOKENS[account.chain as keyof typeof CHAIN_TO_TOKENS];
  for (const singleTokenInfo of tokensInfo) {
    // Check balances of the user in these tokens
    if (singleTokenInfo.aToken) {
      // // const result = await web3.eth.call({
      //   to: singleTokenInfo.aToken,
      //   data: "0x70a08231" + account.address.slice(2),
      // });
      // console.log("aaaa result", result);
    }
  }
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
