import {
  ChainAccountData,
  ChainAccount,
  Chain,
  AaveTokensPerChain,
  RpcsPerChain,
  SingleAssetUsageInfo,
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
      decimals: 18,
      aToken: "0xD3B304653E6dFb264212f7dd427F9E926B2EaA05",
    },
    {
      symbol: "DAI",
      decimals: 18,
      aToken: "0x67550Df3290415611F6C140c81Cd770Ff1742cb9",
      variableDebtToken: "0x1badcb245082a0E90c41770d47C7B58CBA59af74",
      stableDebtToken: "0x988Ccf511EB27EcE918133Ae5c0C43A953fc0cd2",
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
  const userAssets: SingleAssetUsageInfo[] = [];
  for (const singleTokenInfo of tokensInfo) {
    // Check balances of the user in these tokens
    let suppliedAmount, borrowedAmount: number | undefined;
    if (singleTokenInfo.aToken) {
      const result = await provider.call({
        to: singleTokenInfo.aToken,
        data: "0x70a08231" + account.address.slice(2).padStart(64, "0"),
      });
      suppliedAmount = parseInt(result, 16) / 10 ** singleTokenInfo.decimals;
    }
    if (singleTokenInfo.stableDebtToken) {
      const result = await provider.call({
        to: singleTokenInfo.stableDebtToken,
        data: "0x70a08231" + account.address.slice(2).padStart(64, "0"),
      });
      borrowedAmount = parseInt(result, 16) / 10 ** singleTokenInfo.decimals;
    }
    if (singleTokenInfo.variableDebtToken && !borrowedAmount) {
      const result = await provider.call({
        to: singleTokenInfo.variableDebtToken,
        data: "0x70a08231" + account.address.slice(2).padStart(64, "0"),
      });
      borrowedAmount = parseInt(result, 16) / 10 ** singleTokenInfo.decimals;
    }
    userAssets.push({
      symbol: singleTokenInfo.symbol,
      supplied: suppliedAmount,
      borrowed: borrowedAmount,
    });
  }
  return {
    healthFactor: 2.3,
    netAPY: 5.6,
    assets: userAssets,
  };
}

export function getAllTrackedAccounts(): ChainAccount[] {
  return [];
}
