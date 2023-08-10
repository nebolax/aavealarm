import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";

const SliderThumb = (props: { value: number }) => (
  <View style={{ backgroundColor: "#3CB8CF", width: 64 }}></View>
);

export default function Settings() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 96,
        padding: 16,
      }}
    >
      <View
        style={{
          padding: 4,
          backgroundColor: "#35394E",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "#FFF",
            paddingVertical: 24,
            textAlign: "center",
          }}
        >
          Health factor threshold
        </Text>
        <View style={{ backgroundColor: "#3B3F57", padding: 32, margin: 8 }}>
          <Slider
            minimumTrackTintColor="#BB3DB8"
            maximumTrackTintColor="#3CB8CF"
          />
        </View>
      </View>
    </View>
  );
}
