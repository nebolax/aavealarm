import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Image,
  ImageBackground,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

export function Header(props: { title: string }) {
  const navigation = useNavigation();
  const route = useRoute();
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        style={{ height: 96 }}
        resizeMode="stretch"
        source={require("./assets/header-background.png")}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            flexDirection: "row",
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    margin: 10,
                    tintColor: "#FFF",
                  }}
                  source={require("./assets/back.png")}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={{
              color: "#FFF",
              fontSize: 24,
              fontWeight: "bold",
              flex: 4,
              textAlign: "center",
            }}
          >
            {props.title}
          </Text>
          <View style={{ flex: 1 }}>
            {route.name === "Main" && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings" as never)} // some strange type error
              >
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    margin: 10,
                    tintColor: "#FFF",
                  }}
                  source={require("./assets/settings.png")}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
