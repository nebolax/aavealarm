import Checkbox from "expo-checkbox";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
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

export default function Addition() {
  const radio_props = [
    { label: "V2", value: 2 },
    { label: "V3", value: 3 },
  ];
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
        />
        <Text style={{ color: "#FFF", fontSize: 20 }}>Aave version</Text>
        <RadioForm formHorizontal>
          {radio_props.map((obj, i) => (
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
                isSelected={i === 0}
                obj={obj}
                index={i}
                // isSelected={this.state.value3Index === i}
                onPress={() => {}}
                // borderWidth={1}
                buttonInnerColor="#00B8FF"
                buttonOuterColor={i === 0 ? "#60ABC8" : "#3F4865"}
                buttonSize={16}
                buttonOuterSize={32}
                // buttonStyle={{
                //   backgroundColor: "#00B8FF",
                //   borderColor: "#3F4865",
                //   borderWidth: 1,
                // }}
                // buttonWrapStyle={{
                //   marginLeft: 10,
                //   paddingTop: 16,
                //   backgroundColor: "pink",
                // }}
              />
              <RadioButtonLabel
                obj={obj}
                index={i}
                labelHorizontal={true}
                onPress={() => {}}
                labelStyle={{
                  fontSize: 24,
                  color: i === 0 ? "#FFF" : "#BCBCBC",
                  height: 40,
                  textAlignVertical: "center",
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
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Checkbox
            value
            color="#00B8FF"
            style={{ width: 24, height: 24, marginBottom: 16, marginRight: 16 }}
          />
          <Text style={{ color: "#FFF", fontSize: 24 }}>Ethereum</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Checkbox
            // value
            color="#00B8FF"
            style={{ width: 24, height: 24, marginBottom: 16, marginRight: 16 }}
          />
          <Text style={{ color: "#BCBCBC", fontSize: 24 }}>Avalanche</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Checkbox
            value
            color="#00B8FF"
            style={{ width: 24, height: 24, marginBottom: 16, marginRight: 16 }}
          />
          <Text style={{ color: "#BCBCBC", fontSize: 24 }}>Polygon</Text>
        </View>
      </KeyboardAvoidingView>
      <TouchableOpacity
        style={{
          backgroundColor: "#EAEBEF",
          padding: 12,
          borderRadius: 10,
          position: "absolute",
          bottom: 24,
          left: 16,
          right: 16,
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 22 }}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}
