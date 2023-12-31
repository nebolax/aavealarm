import {
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { Chain, ChainAccount } from "./types";
import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import { humanizeChainName } from "./utils";
import { SvgUri } from "react-native-svg";

function getChainIconName(chain: Chain) {
  switch (chain) {
    case Chain.ETHEREUM_SEPOLIA:
      return "ethereum";
    case Chain.POLYGON_MUMBAI:
      return "polygon";
    default:
      return chain.toLowerCase();
  }
}

const TrashbinIcon = (
  <Image
    style={{ width: 16, height: 16, tintColor: "#A5A9BD" }}
    source={require("./assets/trash-bin.png")}
  ></Image>
);

const IconButton = (props: { onPress: () => void; icon: JSX.Element }) => (
  <TouchableOpacity
    style={{
      backgroundColor: "#3B3F57",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 8,
      borderRadius: 6,
    }}
    onPress={props.onPress}
  >
    {props.icon}
  </TouchableOpacity>
);

const FloatingButton = (
  props: { navigation: NavigationProp<any> } // eslint-disable-line
) => (
  <TouchableOpacity
    onPress={() => props.navigation.navigate("Addition")}
    style={{
      backgroundColor: "#EAEBEF",
      borderRadius: 1000,
      padding: 20,
      position: "absolute",
      zIndex: 100,
      bottom: 32,
      right: 24,
    }}
  >
    <Image
      style={{
        width: 24,
        height: 24,
        tintColor: "#1B2030",
      }}
      source={require("./assets/plus.png")}
    />
  </TouchableOpacity>
);

function SingleAccount(props: {
  account: ChainAccount;
  onClick: (account: ChainAccount) => void;
  onDelete: (account: ChainAccount) => void;
}) {
  const deleteClickedCallback = () => {
    Alert.alert(
      "Delete account",
      `- Address: ${props.account.address}\n- Chain: ${humanizeChainName(
        props.account.chain
      )}\n- Aave V${props.account.aaveVersion}`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "default",
          onPress: () => {
            props.onDelete(props.account);
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#2B2E40",
        padding: 16,
        display: "flex",
        flexDirection: "row",
        borderRadius: 12,
      }}
      onPress={() => {
        props.onClick(props.account);
      }}
    >
      <View style={{ flex: 1, flexBasis: 48, flexGrow: 0, flexShrink: 0 }}>
        <SvgUri
          width={32}
          height={32}
          viewBox="0 0 24 24"
          uri={`https://app.aave.com/icons/networks/${getChainIconName(
            props.account.chain
          )}.svg`}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: "#FFF", maxWidth: 100 }}
          ellipsizeMode="middle"
          numberOfLines={1}
        >
          {props.account.address}
        </Text>
        <Text style={{ color: "#ACACAC" }}>
          {humanizeChainName(props.account.chain)} x Aave V
          {props.account.aaveVersion}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexBasis: 48,
          flexGrow: 0,
          flexShrink: 0,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconButton onPress={deleteClickedCallback} icon={TrashbinIcon} />
      </View>
    </TouchableOpacity>
  );
}

export default function MainScreen(
  props: { navigation: NavigationProp<any> } // eslint-disable-line
) {
  const [accounts, setAccounts] = useState<ChainAccount[] | null>(null);
  const updateTrackedAccounts = () => {
    getSupabase().then((supabase) => {
      supabase
        .from("account")
        .select("address, chain, aave_version")
        .then((res) => {
          setAccounts(
            res.data?.map((row) => {
              return {
                address: row.address,
                chain: row.chain,
                aaveVersion: row.aave_version,
              };
            }) || []
          );
        });
    });
  };
  useEffect(() => {
    // Using a listener in order to refresh accounts after using goBack()
    // from the Addition screen.
    props.navigation.addListener("focus", updateTrackedAccounts);
  }, []);

  const onAccountDeletion = (account: ChainAccount) => {
    getSupabase().then((supabase) => {
      supabase
        .from("account")
        .delete()
        .eq("address", account.address)
        .eq("chain", account.chain)
        .eq("aave_version", account.aaveVersion)
        .then(() => {
          updateTrackedAccounts();
        });
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 88,
        zIndex: 100,
      }}
    >
      {accounts === null && (
        <ActivityIndicator size="large" style={{ flex: 1 }} color="#7D3D87" />
      )}
      <FloatingButton navigation={props.navigation} />
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              margin: 16,
            }}
          >
            {accounts !== null &&
              accounts.map((account, index) => (
                <SingleAccount
                  key={index}
                  account={account}
                  onClick={(account) => {
                    props.navigation.navigate("Account", { account: account });
                  }}
                  onDelete={onAccountDeletion}
                />
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
