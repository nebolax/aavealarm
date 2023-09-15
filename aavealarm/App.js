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
import { updateChainRpcs } from "./network";
import { useEffect } from 'react';
import { BalancesSettingsProvider } from "./Contexts/BalancesSettings";

OneSignal.setAppId(Constants.expoConfig.extra.oneSignalAppId);
const Stack = createNativeStackNavigator();

async function saveOneSignalId() {
  // Saves the generated onesignal id to supabase
  let onesignalId: string | undefined = undefined;
  while (!onesignalId) {
    onesignalId = (await OneSignal.getDeviceState()).userId;
    console.log("Onesignal ID:", onesignalId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const supabase = await getSupabase(); // getting supabase first to make sure that supabaseUserId is set
  const supabaseUserId = await SecureStore.getItemAsync("supabaseUserId");
  await supabase
    .from("user")
    .update({ onesignal_id: onesignalId })
    .eq("user_id", supabaseUserId);
  console.log("Saved Onesignal ID to supabase");
}


export default function App() {
  useEffect(() => {
    initializeSupabase();
    saveOneSignalId();
    updateChainRpcs();
  }, []);
  return (
    <BalancesSettingsProvider>
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
    </BalancesSettingsProvider>
  );
}
