import { Chain } from "./types";

export function capitalizeChain(chain: Chain): string {
  return chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
}
