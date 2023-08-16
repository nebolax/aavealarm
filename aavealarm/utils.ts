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

// format number for user-facing display in the assets table
// the format is: 0.1k, 10.2m, etc.
export function formatNumber(num: number | undefined): string {
  if (num === undefined) {
    return "-";
  }
  if (num === 0) {
    return "0";
  }
  let result = "$";
  if (num < 1e3) {
    result += num.toFixed(1);
  } else if (num < 1e6) {
    result += (num / 1e3).toFixed(1) + "k";
  } else if (num < 1e9) {
    result += (num / 1e6).toFixed(1) + "m";
  } else if (num < 1e12) {
    result += (num / 1e9).toFixed(1) + "b";
  } else {
    result += (num / 1e12).toFixed(1) + "t";
  }
  return result;
}
