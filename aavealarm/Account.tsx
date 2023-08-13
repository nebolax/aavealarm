import { Image, Text, View, SafeAreaView, ScrollView } from "react-native";
import { Chain, ChainAccount, ChainAccountData } from "./types";
import { queryAccountData } from "./network";
import { useEffect, useState } from "react";

const ASSET_ICONS = {
  uni: require("./assets/tokens/uni.png"),
  snx: require("./assets/tokens/snx.png"),
  mkr: require("./assets/tokens/mkr.png"),
  xsushi: require("./assets/tokens/xsushi.png"),
  busd: require("./assets/tokens/busd.png"),
  stmatic: require("./assets/tokens/stmatic.png"),
  renfil: require("./assets/tokens/renfil.png"),
  ftm: require("./assets/tokens/ftm.png"),
  zrx: require("./assets/tokens/zrx.png"),
  matic: require("./assets/tokens/matic.png"),
  bal: require("./assets/tokens/bal.png"),
  lusd: require("./assets/tokens/lusd.png"),
  ren: require("./assets/tokens/ren.png"),
  lend: require("./assets/tokens/lend.png"),
  tusd: require("./assets/tokens/tusd.png"),
  savax: require("./assets/tokens/savax.png"),
  dai: require("./assets/tokens/dai.png"),
  maticx: require("./assets/tokens/maticx.png"),
  wmatic: require("./assets/tokens/wmatic.png"),
  link: require("./assets/tokens/link.png"),
  wbtc: require("./assets/tokens/wbtc.png"),
  rpl: require("./assets/tokens/rpl.png"),
  stkaave: require("./assets/tokens/stkaave.png"),
  usdp: require("./assets/tokens/usdp.png"),
  steth: require("./assets/tokens/steth.png"),
  avax: require("./assets/tokens/avax.png"),
  wsteth: require("./assets/tokens/wsteth.png"),
  bpt: require("./assets/tokens/bpt.png"),
  ust: require("./assets/tokens/ust.png"),
  wone: require("./assets/tokens/wone.png"),
  reth: require("./assets/tokens/reth.png"),
  eth: require("./assets/tokens/eth.png"),
  metis: require("./assets/tokens/metis.png"),
  "1inch": require("./assets/tokens/1inch.png"),
  ldo: require("./assets/tokens/ldo.png"),
  ens: require("./assets/tokens/ens.png"),
  yfi: require("./assets/tokens/yfi.png"),
  usdt: require("./assets/tokens/usdt.png"),
  usdc: require("./assets/tokens/usdc.png"),
  tribe: require("./assets/tokens/tribe.png"),
  sd: require("./assets/tokens/sd.png"),
  cbeth: require("./assets/tokens/cbeth.png"),
  enj: require("./assets/tokens/enj.png"),
  weth: require("./assets/tokens/weth.png"),
  rai: require("./assets/tokens/rai.png"),
  guni: require("./assets/tokens/guni.png"),
  mai: require("./assets/tokens/mai.png"),
  aave: require("./assets/tokens/aave.png"),
  dpi: require("./assets/tokens/dpi.png"),
  cvx: require("./assets/tokens/cvx.png"),
  pax: require("./assets/tokens/pax.png"),
  one: require("./assets/tokens/one.png"),
  jeur: require("./assets/tokens/jeur.png"),
  fei: require("./assets/tokens/fei.png"),
  frax: require("./assets/tokens/frax.png"),
  knc: require("./assets/tokens/knc.png"),
  mana: require("./assets/tokens/mana.png"),
  sushi: require("./assets/tokens/sushi.png"),
  bat: require("./assets/tokens/bat.png"),
  btc: require("./assets/tokens/btc.png"),
  ampl: require("./assets/tokens/ampl.png"),
  crv: require("./assets/tokens/crv.png"),
  op: require("./assets/tokens/op.png"),
  ageur: require("./assets/tokens/ageur.png"),
  arb: require("./assets/tokens/arb.png"),
  stkbpt: require("./assets/tokens/stkbpt.png"),
  gusd: require("./assets/tokens/gusd.png"),
  default: require("./assets/tokens/default.png"),
  rep: require("./assets/tokens/rep.png"),
  eurs: require("./assets/tokens/eurs.png"),
  susd: require("./assets/tokens/susd.png"),
  ghst: require("./assets/tokens/ghst.png"),
  gho: require("./assets/tokens/gho.png"),
  wftm: require("./assets/tokens/wftm.png"),
  seth: require("./assets/tokens/seth.png"),
  wavax: require("./assets/tokens/wavax.png"),
};

function formatNumber(num: number | undefined): string {
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

function AcccountLabel(props: { text: string }) {
  return (
    <Text
      style={{
        flex: 1,
        color: "#FFF",
        fontSize: 16,
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "#373B51",
      }}
    >
      {props.text}
    </Text>
  );
}

function AccountIndicator(props: {
  name: string;
  value: string;
  withBorder?: boolean;
}) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomColor: "#4A4F6C",
        borderBottomWidth: props.withBorder ? 2 : undefined,
        paddingBottom: props.withBorder ? 16 : 0,
      }}
    >
      <Text style={{ color: "#00B8FF", fontSize: 18, fontWeight: "500" }}>
        {props.name}
      </Text>
      <Text style={{ color: "#FFF", fontSize: 18 }}>{props.value}</Text>
    </View>
  );
}

function AssetsTableHeaderFooter(props: {
  value1: string;
  value2: string;
  value3: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "#30364B",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <Text style={{ color: "#FFF", fontSize: 14 }}>{props.value1}</Text>
      <Text style={{ color: "#FFF", fontSize: 14 }}>{props.value2}</Text>
      <Text style={{ color: "#FFF", fontSize: 14 }}>{props.value3}</Text>
    </View>
  );
}

function AssetsTableRow(props: {
  assetName: string;
  supplied?: number;
  borrowed?: number;
}) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", flex: 1 }}>
        <Image
          style={{ width: 24, height: 24, marginRight: 8 }}
          source={
            ASSET_ICONS[
              props.assetName.toLowerCase() as keyof typeof ASSET_ICONS
            ]
          }
        />
        <Text style={{ color: "#FFF", fontSize: 14, flex: 1 }}>
          {props.assetName}
        </Text>
      </View>
      <Text
        style={{
          color: "#ACACAC",
          fontSize: 14,
          flex: 1,
          paddingLeft: 32,
        }}
      >
        {formatNumber(props.supplied)}
      </Text>
      <Text
        style={{ color: "#ACACAC", fontSize: 14, flex: 1, textAlign: "right" }}
      >
        {formatNumber(props.borrowed)}
      </Text>
    </View>
  );
}

export default function Account(props: { route: any }) {
  const { account }: { account: ChainAccount } = props.route.params;
  const [accountData, setAccountData] = useState<
    ChainAccountData | undefined
  >();
  useEffect(() => {
    queryAccountData(account).then((data) => setAccountData(data));
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 96,
      }}
    >
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              backgroundColor: "#2B2E40",
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 20,
                textAlign: "center",
                padding: 16,
                paddingTop: 0,
              }}
              ellipsizeMode="middle"
              numberOfLines={1}
            >
              {/* Adding an extra space because otherwise the last letter is half-shown */}
              {account.address + " "}
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
                height: 48,
              }}
            >
              <AcccountLabel text={account.chain} />
              <AcccountLabel text="Aave V3" />
            </View>
            <AccountIndicator
              name="Health factor"
              value={
                accountData
                  ? accountData.healthFactor !== -1
                    ? accountData.healthFactor.toFixed(2)
                    : "-"
                  : "loading"
              }
            />
          </View>
          <View style={{ margin: 16 }}>
            <AssetsTableHeaderFooter
              value1="Asset"
              value2="Supplied"
              value3="Borrowed"
            />
            <View style={{ backgroundColor: "#2B2E40" }}>
              {accountData?.assets.map((assetData, index) => (
                <AssetsTableRow
                  key={index}
                  assetName={assetData.symbol}
                  supplied={assetData.supplied}
                  borrowed={assetData.borrowed}
                />
              ))}
            </View>
            <AssetsTableHeaderFooter
              value1="Total"
              value2={formatNumber(accountData?.totalSupplied)}
              value3={formatNumber(accountData?.totalBorrowed)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
