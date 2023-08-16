import { Text, View, SafeAreaView, ScrollView } from "react-native";
import { ChainAccount, ChainAccountData, SingleAssetUsageInfo } from "./types";
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

function getAssetPriority(asset: SingleAssetUsageInfo): number {
  // Lower the number - greater the priority
  // Priority is the following:
  // 1. GHO if exists
  // 2. Assets that are both sipplied and borrowed (unlikely, but theoretically can happen)
  // 3. Only supplied assets
  // 4. Only borrowed assets
  // 5. Assets that can be both supplied & borrowed
  // 6. Only suppliable assets
  // 7. Only borrowable assets
  if (asset.symbol == "GHO") return 1;
  if (
    asset.supplied !== undefined &&
    asset.supplied > 0 &&
    asset.borrowed !== undefined &&
    asset.borrowed > 0
  )
    return 2;

  if (asset.supplied !== undefined && asset.supplied > 0) return 3;
  if (asset.borrowed !== undefined && asset.borrowed > 0) return 4;

  if (asset.supplied !== undefined && asset.borrowed !== undefined) return 5;
  if (asset.supplied !== undefined) return 6;
  if (asset.borrowed !== undefined) return 7;

  return 8;
}

export default function Account(props: {
  route: any; // eslint-disable-line
}) {
  const { account }: { account: ChainAccount } = props.route.params;
  const [accountData, setAccountData] = useState<
    ChainAccountData | undefined
  >();
  useEffect(() => {
    queryAccountData(account).then((data) => {
      data.assets.sort((a, b) => {
        return getAssetPriority(a) - getAssetPriority(b);
      });

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
