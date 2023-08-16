import { Text, View, SafeAreaView, ScrollView } from "react-native";
import { ChainAccount, ChainAccountData } from "./types";
import { queryAccountData } from "./network";
import { useEffect, useState } from "react";
import { formatNumber, humanizeChainName } from "./utils";
import { SvgUri } from "react-native-svg";

function AcccountLabel(props: { text: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#373B51",
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color: "#FFF",
          fontSize: 16,
          textAlign: "center",
          textAlignVertical: "center",
          lineHeight: 48,
        }}
      >
        {props.text}
      </Text>
    </View>
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
  isHeader?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: "#30364B",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopLeftRadius: props.isHeader ? 12 : 0,
        borderTopRightRadius: props.isHeader ? 12 : 0,
        borderBottomLeftRadius: props.isHeader ? 0 : 12,
        borderBottomRightRadius: props.isHeader ? 0 : 12,
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
  let iconName = props.assetName.toLowerCase();
  if (iconName.endsWith(".e") || iconName.endsWith(".b")) {
    iconName = iconName.slice(0, -2);
  } else if (iconName.startsWith("m.")) {
    iconName = iconName.slice(2);
  }
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", flex: 1.7 }}>
        <SvgUri
          width={32}
          height={32}
          style={{ marginRight: 12 }}
          uri={`https://app.aave.com/icons/tokens/${iconName}.svg`}
        />
        <Text
          style={{
            color: "#FFF",
            fontSize: 14,
            flex: 1,
            textAlignVertical: "center",
            lineHeight: 32,
          }}
        >
          {props.assetName}
        </Text>
      </View>
      <Text
        style={{
          color: "#ACACAC",
          fontSize: 14,
          flex: 1,
          paddingLeft: 32,
          textAlignVertical: "center",
          lineHeight: 32,
        }}
      >
        {formatNumber(props.supplied)}
      </Text>
      <Text
        style={{
          color: "#ACACAC",
          fontSize: 14,
          flex: 1,
          textAlign: "right",
          textAlignVertical: "center",
          lineHeight: 32,
        }}
      >
        {formatNumber(props.borrowed)}
      </Text>
    </View>
  );
}

export default function Account(props: {
  route: any; // eslint-disable-line
}) {
  const { account }: { account: ChainAccount } = props.route.params;
  const [accountData, setAccountData] = useState<
    ChainAccountData | undefined
  >();
  useEffect(() => {
    // load account data
    queryAccountData(account).then((data) => {
      // Put used assets higher
      data.assets.sort((a, b) => {
        const aUsed =
          (a.supplied !== undefined && a.supplied > 0) ||
          (a.borrowed !== undefined && a.borrowed > 0);

        const bUsed =
          (b.supplied !== undefined && b.supplied > 0) ||
          (b.borrowed !== undefined && b.borrowed > 0);

        if (aUsed && !bUsed) {
          return -1;
        } else if (!aUsed && bUsed) {
          return 1;
        }
        return 0;
      });

      // Promote GHO
      const ghoIndex = data.assets.findIndex((asset) => asset.symbol === "GHO");
      if (ghoIndex !== -1) {
        const gho = data.assets[ghoIndex];
        data.assets.splice(ghoIndex, 1);
        data.assets.unshift(gho);
      }

      setAccountData(data);
    });
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 88,
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
                paddingHorizontal: 64,
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
              <AcccountLabel text={humanizeChainName(account.chain)} />
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
              isHeader={true}
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
              isHeader={false}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
