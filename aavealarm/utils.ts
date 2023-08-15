import { Chain } from "./types";

export function humanizeChainName(chain: Chain): string {
  if (chain === Chain.ETHEREUM_SEPOLIA) {
    return "Sepolia";
  }
  if (chain === Chain.POLYGON_MUMBAI) {
    return "Mumbai";
  }
  return chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
}
