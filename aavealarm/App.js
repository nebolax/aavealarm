import "@ethersproject/shims";
import toLocaleStringPolyfill from "./toLocaleStringPolyfill";
import "fast-text-encoding";

if (typeof BigInt === "undefined") global.BigInt = require("big-integer");

if (typeof btoa === "undefined") {
  global.btoa = function (str) {
    return new Buffer(str, "binary").toString("base64");
  };
}

if (typeof atob === "undefined") {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, "base64").toString("binary");
  };
}

toLocaleStringPolyfill();

if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer;

import OneSignal from "react-native-onesignal";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "./MainScreen";
import { Header } from "./Header";
import Account from "./Account";
import Settings from "./Settings";
import Addition from "./Addition";

OneSignal.setAppId(Constants.expoConfig.extra.oneSignalAppId);
const Stack = createNativeStackNavigator();

export default function App() {
  OneSignal.getDeviceState().then((state) => {
    console.log("aaaa onesignal user id:", state?.userId);
  });
  OneSignal.promptForPushNotificationsWithUserResponse();
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ statusBarColor: "#000000" }}
        initialRouteName="MainScreen"
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{
            header: () => <Header title="Aave alarm" />,
          }}
        />
        <Stack.Screen
          name="Account"
          component={Account}
          options={{ header: () => <Header title="Account" /> }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ header: () => <Header title="Settings" /> }}
        />
        <Stack.Screen
          name="Addition"
          component={Addition}
          options={{ header: () => <Header title="New account" /> }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
