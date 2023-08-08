import OneSignal from "react-native-onesignal";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "./MainScreen";
import { Header } from "./Header";
import { Button } from "react-native";
import Account from "./Account";
OneSignal.setAppId(Constants.expoConfig!!.extra!!.oneSignalAppId);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ statusBarColor: "#000000" }}
        initialRouteName="Main"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
