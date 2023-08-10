import { Image, Text, View, SafeAreaView, ScrollView } from "react-native";
import { Chain, ChainAccount } from "./types";

type AssetIconKeyType = "gho" | "eth" | "dai";

const ASSET_ICONS = {
  gho: require("./assets/gho.png"),
  eth: require("./assets/eth.png"),
  dai: require("./assets/dai.png"),
};

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
  supplied: string;
  borrowed: string;
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
            ASSET_ICONS[props.assetName.toLowerCase() as AssetIconKeyType]
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
        {props.supplied}
      </Text>
      <Text
        style={{ color: "#ACACAC", fontSize: 14, flex: 1, textAlign: "right" }}
      >
        {props.borrowed}
      </Text>
    </View>
  );
}

export default function Account(props: { route: any }) {
  const { account }: { account: ChainAccount } = props.route.params;
  console.log("aaaa account", account);
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
              {/* Adding an extra space because otherwise the last letter is own half-shown */}
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
              value="1.3"
              withBorder={true}
            />
            <AccountIndicator name="Net APY" value="3.4%" />
          </View>
          <View style={{ margin: 16 }}>
            <AssetsTableHeaderFooter
              value1="Asset"
              value2="Supplied"
              value3="Borrowed"
            />
            <View style={{ backgroundColor: "#2B2E40" }}>
              <AssetsTableRow assetName="GHO" supplied="0" borrowed="$10.4k" />
              <AssetsTableRow assetName="ETH" supplied="$5k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
              <AssetsTableRow assetName="DAI" supplied="$20k" borrowed="0" />
            </View>
            <AssetsTableHeaderFooter
              value1="Total"
              value2="$25k"
              value3="10.4k"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
