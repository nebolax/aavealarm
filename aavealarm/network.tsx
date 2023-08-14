import { BigNumber, Contract, ethers } from "ethers";
import {
  ChainAccountData,
  ChainAccount,
  Chain,
  RpcsPerChain,
  SingleAssetUsageInfo,
  AaveLendingPoolsPerChain,
  SingleChainAaveTokenInfo,
  ReservesMapping,
} from "./types";
// import { Eth } from "ethjs-query";
// import { HttpProvider } from "ethjs-provider-http";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  V2_POOL_ABI,
  V2_POOL_PROVIDER_ABI,
  V3_POOL_PROVIDER_ABI,
  V3_POOl_ABI,
} from "./abis";
import { ChainId, UiPoolDataProvider } from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";

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
  [Chain.ARBITRUM]: "https://arb1.arbitrum.io/rpc",
  [Chain.OPTIMISM]: "https://mainnet.optimism.io",
  [Chain.METIS]: "https://andromeda.metis.io/?owner=1088",
};

const LENDING_POOL_ADDRESSES: AaveLendingPoolsPerChain = {
  [Chain.ETHEREUM]: {
    v2: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    v3: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  },
  [Chain.ETHEREUM_SEPOLIA]: {
    v3: "0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08",
  },
  [Chain.POLYGON]: {
    v2: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    v3: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  },
  [Chain.POLYGON_MUMBAI]: {
    v2: "0x9198F13B08E299d85E096929fA9781A1E3d5d827",
    v3: "0x0b913A76beFF3887d35073b8e5530755D60F78C7",
  },
  [Chain.AVALANCHE]: {
    v2: "0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C",
    v3: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  },
  [Chain.ARBITRUM]: {
    v3: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  },
  [Chain.OPTIMISM]: {
    v3: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  },
  [Chain.METIS]: {
    v3: "0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57",
  },
};

function getAaveMarket(
  chain: Chain,
  aaveVersion: number
): [string, string, ChainId] {
  let market, chainId;
  switch (true) {
    case chain == Chain.ETHEREUM && aaveVersion == 2:
      market = markets.AaveV2Ethereum;
      chainId = ChainId.mainnet;
      break;
    case chain == Chain.ETHEREUM && aaveVersion == 3:
      market = markets.AaveV3Ethereum;
      chainId = ChainId.mainnet;
      break;
    case chain == Chain.ETHEREUM_SEPOLIA && aaveVersion == 3:
      market = markets.AaveV3Sepolia;
      chainId = ChainId.sepolia;
      break;
    case chain == Chain.POLYGON && aaveVersion == 2:
      market = markets.AaveV2Polygon;
      chainId = ChainId.polygon;
      break;
    case chain == Chain.POLYGON && aaveVersion == 3:
      market = markets.AaveV3Polygon;
      chainId = ChainId.polygon;
      break;
    case chain == Chain.POLYGON_MUMBAI && aaveVersion == 2:
      market = markets.AaveV2Mumbai;
      chainId = ChainId.mumbai;
      break;
    case chain == Chain.POLYGON_MUMBAI && aaveVersion == 3:
      market = markets.AaveV3Mumbai;
      chainId = ChainId.mumbai;
      break;
    case chain == Chain.AVALANCHE && aaveVersion == 2:
      market = markets.AaveV2Avalanche;
      chainId = ChainId.avalanche;
      break;
    case chain == Chain.AVALANCHE && aaveVersion == 3:
      market = markets.AaveV3Avalanche;
      chainId = ChainId.avalanche;
      break;
    case chain == Chain.ARBITRUM && aaveVersion == 3:
      market = markets.AaveV3Arbitrum;
      chainId = ChainId.arbitrum_one;
      break;
    case chain == Chain.OPTIMISM && aaveVersion == 3:
      market = markets.AaveV3Optimism;
      chainId = ChainId.optimism;
      break;
    case chain == Chain.METIS && aaveVersion == 3:
      market = markets.AaveV3Metis;
      chainId = ChainId.metis_andromeda;
      break;
  }
  return [
    market!!.UI_POOL_DATA_PROVIDER,
    market!!.POOL_ADDRESSES_PROVIDER,
    chainId!!,
  ];
}

export async function queryAccountData(
  account: ChainAccount
): Promise<ChainAccountData> {
  const rpcUrl = CHAIN_TO_RPC[account.chain as keyof typeof CHAIN_TO_RPC];
  const provider = new JsonRpcProvider(rpcUrl);

  const [uiPoolDataProvider, poolAddressProvider, chainId] = getAaveMarket(
    account.chain,
    account.aaveVersion
  );

  let lendingPoolContract;
  if (account.aaveVersion == 2) {
    const addressProviderContract = new Contract(
      poolAddressProvider,
      V2_POOL_PROVIDER_ABI,
      provider
    );
    const lendingPoolAddress = await addressProviderContract.getLendingPool();
    lendingPoolContract = new Contract(
      lendingPoolAddress,
      V2_POOL_ABI,
      provider
    );
  } else {
    const addressProviderContract = new Contract(
      poolAddressProvider,
      V3_POOL_PROVIDER_ABI,
      provider
    );
    const lendingPoolAddress = await addressProviderContract.getPool();
    lendingPoolContract = new Contract(
      lendingPoolAddress,
      V3_POOl_ABI,
      provider
    );
  }
  const userAccountData = await lendingPoolContract.getUserAccountData(
    account.address
  );
  const healthFactorRaw: BigNumber =
    userAccountData[userAccountData.length - 1];

  let healthFactor: number;
  if (healthFactorRaw.eq(ethers.constants.MaxUint256)) {
    healthFactor = -1;
  } else {
    healthFactor = healthFactorRaw.toNumber() / 1e18;
  }

  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: uiPoolDataProvider,
    provider,
    chainId: chainId,
  });
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: poolAddressProvider,
    user: account.address,
  });

  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: poolAddressProvider,
  });

  const marketCurrencyMultiplier =
    parseInt(reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd) /
    10 ** reserves.baseCurrencyData.marketReferenceCurrencyDecimals;

  const reservesMapping: ReservesMapping = {};
  for (const reserve of reserves.reservesData) {
    reservesMapping[reserve.underlyingAsset] = reserve;
  }

  const userAssets: SingleAssetUsageInfo[] = [];
  for (const userReserve of userReserves.userReserves) {
    const reserveData = reservesMapping[userReserve.underlyingAsset];
    userAssets.push({
      symbol: reserveData.symbol,
      supplied:
        (((parseInt(userReserve.scaledATokenBalance) /
          10 ** reserveData.decimals) *
          parseInt(reserveData.priceInMarketReferenceCurrency)) /
          10 ** reserves.baseCurrencyData.marketReferenceCurrencyDecimals) *
        marketCurrencyMultiplier,
      borrowed:
        ((((parseInt(userReserve.scaledVariableDebt) ||
          parseInt(userReserve.principalStableDebt)) /
          10 ** reserveData.decimals) *
          parseInt(reserveData.priceInMarketReferenceCurrency)) /
          10 ** reserves.baseCurrencyData.marketReferenceCurrencyDecimals) *
        marketCurrencyMultiplier,
    });
  }
  return {
    healthFactor: healthFactor,
    netAPY: 5.6,
    totalSupplied: userAssets.reduce(
      (acc, asset) => acc + (asset.supplied === undefined ? 0 : asset.supplied),
      0
    ),
    totalBorrowed: userAssets.reduce(
      (acc, asset) => acc + (asset.borrowed === undefined ? 0 : asset.borrowed),
      0
    ),
    assets: userAssets,
  };
}

export function getAllTrackedAccounts(): ChainAccount[] {
  return [];
}
