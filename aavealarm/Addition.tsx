import Checkbox from "expo-checkbox";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import { AAVE_V2_CHAINS, Chain } from "./types";
import { ethers } from "ethers";
import { getSupabase } from "./supabase";
import { NavigationProp } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { humanizeChainName } from "./utils";

function ChainCheckbox(props: {
  chain: Chain;
  selectedChains: Set<Chain>;
  chainChangeCallback: (chain: Chain) => void;
}): JSX.Element {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Checkbox
        value={props.selectedChains.has(props.chain)}
        onValueChange={() => {
          props.chainChangeCallback(props.chain);
        }}
        color="#00B8FF"
        style={{ width: 24, height: 24, marginBottom: 16, marginRight: 16 }}
      />
      <Text style={{ color: "#FFF", fontSize: 24 }}>
        {humanizeChainName(props.chain)}
      </Text>
    </View>
  );
}

export default function Addition(props: {
  navigation: NavigationProp<any>; // eslint-disable-line
}) {
  const [aaveVersion, setAaveVersion] = useState<2 | 3>(2);
  const [selectedChains, setSelectedChains] = useState<Set<Chain>>(new Set());
  const [enteredAddress, setEnteredAddress] = useState("");
  const [adding, setAdding] = useState(false);

  const changeAaveVersion = () => {
    setSelectedChains(new Set());
    if (aaveVersion === 2) {
      setAaveVersion(3);
    } else {
      setAaveVersion(2);
    }
  };

  const chainChangeCallback = (chain: Chain) => {
    if (selectedChains.has(chain)) {
      selectedChains.delete(chain);
    } else {
      selectedChains.add(chain);
    }
    setSelectedChains(new Set(selectedChains));
  };

  const addClicked = () => {
    let validatedAddress: string;
    try {
      validatedAddress = ethers.utils.getAddress(enteredAddress);
    } catch (e) {
      Alert.alert(
        "Invalid address",
        `${enteredAddress} is not a valid EVM address`
      );
      return;
    }

    if (selectedChains.size === 0) {
      Alert.alert("No chains selected", "Please select at least one chain");
      return;
    }

    SecureStore.getItemAsync("supabaseUserId").then((supabaseUserId) => {
      const toBeInserted = Array.from(selectedChains).map((chain) => {
        return {
          user_id: supabaseUserId,
          address: validatedAddress,
          chain: chain.toString(),
          aave_version: aaveVersion,
        };
      });
      console.log("aaaa to be inserted:", toBeInserted);

      setAdding(true);
      getSupabase().then((supabase) => {
        supabase
          .from("account")
          .upsert(toBeInserted, { ignoreDuplicates: true })
          .then((result) => {
            console.log(result);
            setAdding(false);
            props.navigation.goBack();
          });
      });
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 96,
        padding: 24,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, marginBottom: 96 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ color: "#FFF", fontSize: 20, marginVertical: 16 }}>
              Address
            </Text>
            <TextInput
              style={{
                color: "#BCBCBC",
                backgroundColor: "#000",
                padding: 16,
                borderWidth: 1,
                borderColor: "#3F4865",
                borderRadius: 10,
                marginBottom: 48,
              }}
              value={enteredAddress}
              onChangeText={(text) => setEnteredAddress(text)}
            />
            <Text style={{ color: "#FFF", fontSize: 20 }}>Aave version</Text>
            <RadioForm formHorizontal>
              {[
                { label: "V2", value: 2 },
                { label: "V3", value: 3 },
              ].map((obj, i) => (
                <RadioButton
                  labelHorizontal={true}
                  key={i}
                  style={{
                    marginTop: 24,
                    marginRight: 64,
                    marginBottom: 24,
                  }}
                >
                  <RadioButtonInput
                    isSelected={aaveVersion === obj.value}
                    obj={obj}
                    index={i}
                    onPress={changeAaveVersion}
                    buttonInnerColor="#00B8FF"
                    buttonOuterColor={i === 0 ? "#60ABC8" : "#3F4865"}
                    buttonSize={16}
                    buttonOuterSize={32}
                  />
                  <RadioButtonLabel
                    obj={obj}
                    index={i}
                    labelHorizontal={true}
                    onPress={changeAaveVersion}
                    labelStyle={{
                      fontSize: 24,
                      color: i === 0 ? "#FFF" : "#BCBCBC",
                      height: 40,
                      paddingTop: 8,
                    }}
                    labelWrapStyle={{}}
                  />
                </RadioButton>
              ))}
            </RadioForm>
            <View
              style={{
                borderColor: "#4A4F6C",
                borderWidth: 1,
                marginBottom: 24,
              }}
            />
            <Text style={{ color: "#FFF", fontSize: 20, marginBottom: 24 }}>
              Chains
            </Text>
            {Object.values(aaveVersion === 2 ? AAVE_V2_CHAINS : Chain).map(
              (chain, index) => (
                <ChainCheckbox
                  key={index}
                  chain={chain}
                  selectedChains={selectedChains}
                  chainChangeCallback={chainChangeCallback}
                />
              )
            )}
            {/* <View style={{ height: 96 }} /> */}
          </ScrollView>
        </SafeAreaView>
        <TouchableOpacity
          onPress={addClicked}
          disabled={adding}
          style={{
            backgroundColor: "#EAEBEF",
            padding: 12,
            borderRadius: 10,
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 22 }}>
            {adding ? "Adding..." : "Add"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
