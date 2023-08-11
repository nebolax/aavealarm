import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Chain, ChainAccount, IconsPerChain } from "./types";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const TrashbinIcon = (
  <Image
    style={{ width: 16, height: 16 }}
    source={require("./assets/trash-bin.png")}
  ></Image>
);

const IconButton = (props: { onPress: any; icon: JSX.Element }) => (
  <TouchableOpacity
    style={{
      backgroundColor: "#3B3F57",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 8,
    }}
    onPress={props.onPress}
  >
    {props.icon}
  </TouchableOpacity>
);

const FloatingButton = () => (
  <TouchableOpacity
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
      }}
      source={require("./assets/plus.png")}
    />
  </TouchableOpacity>
);

type BlockchainIconKeyType = "ethereum" | "avalanche" | "polygon";

const CHAIN_ICONS: IconsPerChain = {
  [Chain.ETHEREUM]: require("./assets/ethereum.png"),
  [Chain.AVALANCHE]: require("./assets/avalanche.png"),
  [Chain.POLYGON]: require("./assets/polygon.png"),
  [Chain.ETHEREUM_SEPOLIA]: require("./assets/ethereum.png"),
  [Chain.POLYGON_MUMBAI]: require("./assets/polygon.png"),
};

function SingleAccount(props: {
  account: ChainAccount;
  onClick: (account: ChainAccount) => void;
}) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#2B2E40",
        padding: 16,
        display: "flex",
        flexDirection: "row",
      }}
      onPress={() => {
        props.onClick(props.account);
      }}
    >
      <View style={{ flex: 1, flexBasis: 48, flexGrow: 0, flexShrink: 0 }}>
        <Image
          style={{ width: 32, height: 32 }}
          source={CHAIN_ICONS[props.account.chain]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#FFF" }}>0x4bB...C26</Text>
        <Text style={{ color: "#ACACAC" }}>
          {props.account.chain} x Aave V{props.account.aaveVersion}
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
        <IconButton onPress={null} icon={TrashbinIcon} />
      </View>
    </TouchableOpacity>
  );
}

export default function MainScreen(props: { navigation: NavigationProp<any> }) {
  const accounts: ChainAccount[] = [
    {
      address: "0x4bBa290826C253BD854121346c370a9886d1bC26",
      chain: Chain.ETHEREUM,
      aaveVersion: 3,
    },
    {
      address: "0x4bBa290826C253BD854121346c370a9886d1bC26",
      chain: Chain.AVALANCHE,
      aaveVersion: 3,
    },
    {
      address: "0x4bBa290826C253BD854121346c370a9886d1bC26",
      chain: Chain.POLYGON,
      aaveVersion: 2,
    },
    {
      address: "0x4bBa290826C253BD854121346c370a9886d1bC26",
      chain: Chain.ETHEREUM_SEPOLIA,
      aaveVersion: 3,
    },
  ];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 96,
      }}
    >
      <FloatingButton />
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
            {accounts.map((account, index) => (
              <SingleAccount
                key={index}
                account={account}
                onClick={(account) => {
                  props.navigation.navigate("Account", { account: account });
                }}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
