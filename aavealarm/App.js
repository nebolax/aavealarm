import "./shim";
import OneSignal from "react-native-onesignal";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "./MainScreen";
import { Header } from "./Header";
import Account from "./Account";
import Settings from "./Settings";
import Addition from "./Addition";
import { getSupabase, initializeSupabase } from "./supabase";
import * as SecureStore from "expo-secure-store";

OneSignal.setAppId(Constants.expoConfig.extra.oneSignalAppId);
const Stack = createNativeStackNavigator();

export default function App() {
  initializeSupabase();
  OneSignal.getDeviceState().then((state) => {
    getSupabase().then((supabase) => {
      SecureStore.getItemAsync("supabaseUserId").then((supabaseUserId) => {
        supabase
          .from("user")
          .update({ onesignal_id: state?.userId })
          .eq("user_id", supabaseUserId);
      });
    });
  });
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
