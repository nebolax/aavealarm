import { Slider } from "@miblanchard/react-native-slider";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { getSupabase } from "./supabase";
import * as SecureStore from "expo-secure-store";
import { BalancesSettings, BalancesSettingsContextType, useBalancesSettings } from "./Contexts/BalancesSettings";

const MAX_HEALTH_FACTOR = 10;

export default function Settings() {
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const { balancesSettings, setBalancesSettings } = useBalancesSettings();

  useEffect(() => {
    SecureStore.getItemAsync("supabaseUserId").then((supabaseUserId) => {
      getSupabase().then((supabase) => {
        supabase
          .from("user")
          .select("health_factor_threshold")
          .eq("user_id", supabaseUserId)
          .then(({ data, error }) => {
            if (error) {
              return;
            }
            setSliderValue(data[0].health_factor_threshold / MAX_HEALTH_FACTOR);
          });
      });
    });
  }, []);

  const slidingComplete = () => {
    const valueToSet = parseFloat(
      (sliderValue! * MAX_HEALTH_FACTOR).toFixed(2)
    );
    SecureStore.getItemAsync("supabaseUserId").then((supabaseUserId) => {
      getSupabase().then((supabase) => {
        supabase
          .from("user")
          .update({
            health_factor_threshold: valueToSet,
          })
          .eq("user_id", supabaseUserId)
          .then(); // just to await the execution of the query
      });
    });
  };

  const toogleShowZeroBalances = () => {
    setBalancesSettings((balancesSettings : BalancesSettings) => ({
      ...balancesSettings,
      showZeroBalances: !balancesSettings.showZeroBalances,
    }));
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B2030",
        marginTop: 88,
        padding: 16,
      }}
    >
      <View
        style={{
          padding: 4,
          backgroundColor: "#35394E",
          borderRadius: 16,
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
        <View
          style={{
            backgroundColor: "#3B3F57",
            padding: 32,
            margin: 8,
            paddingTop: 0,
            borderRadius: 16,
          }}
        >
          {sliderValue !== null && (
            <View>
              <Text style={{ color: "#FFF", marginVertical: 16 }}>
                {(sliderValue! * MAX_HEALTH_FACTOR).toFixed(2)}
              </Text>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={["#BB3DB8", "#7D3D87", "#534CA4", "#7F84A9", "#3CB8CF"]}
                style={{
                  borderRadius: 20,
                  height: 15,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#1B2030",
                    width: `${(1 - sliderValue!) * 100}%`,
                    height: 15,
                    position: "absolute",
                    top: 0,
                    right: 0,
                    borderRadius: 1000,
                  }}
                />
                <Slider
                  value={[sliderValue!]}
                  onValueChange={(value) => setSliderValue(value[0])}
                  onSlidingComplete={slidingComplete}
                  minimumTrackTintColor={"transparent"}
                  maximumTrackTintColor={"transparent"}
                  thumbStyle={{
                    backgroundColor: "#FFF",
                    borderColor: "#ACACAC",
                    borderRadius: 10,
                    borderWidth: 5,
                    height: 20,
                    width: 20,
                  }}
                />
              </LinearGradient>
            </View>
          )}
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 24,
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#FFF",
            }}
          >
            Show zero balances
          </Text>
          <Switch
            value={balancesSettings.showZeroBalances}
            onValueChange={toogleShowZeroBalances}
            trackColor={{ false: "#3B3F57", true: "#BB3DB8" }}
          />
        </View>
      </View>
    </View>
  );
}
