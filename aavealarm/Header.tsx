import { useNavigation, useRoute } from "@react-navigation/native";
import { Image, ImageBackground, Text, View } from "react-native";

export function Header(props: { title: string }) {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        style={{ height: 96 }}
        resizeMode="stretch"
        source={require("./assets/header-background.png")}
      >
        <View
          style={{
            // backgroundColor: "yellow",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {props.title}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}
