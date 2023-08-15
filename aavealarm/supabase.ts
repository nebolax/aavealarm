import "react-native-url-polyfill/auto"; // required to create supabase client
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import uuid from "react-native-uuid";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = "https://bectdkadeegvxebkqzmh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY3Rka2FkZWVndnhlYmtxem1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA1Nzc5NjcsImV4cCI6MjAwNjE1Mzk2N30.GuhQ56q0NVc_Ur3kSL7ApxQY-WMmVBAqxet7t2ZgqFM";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

let supabaseInitialized = false;

export async function initializeSupabase() {
  console.log("Initializing supabase");
  const currentSession = (await supabase.auth.getUser()).data.user;
  console.log("Supabase user id", currentSession?.id);
  if (currentSession) {
    supabaseInitialized = true;
    return;
  }
  let appUserId = await SecureStore.getItemAsync("appUserId");
  if (appUserId) {
    const authResponse = await supabase.auth.signInWithPassword({
      email: `${appUserId}@aavealarm.com`,
      password: "aavealarm",
    });
    if (authResponse.error) {
      console.error("Error signing in:", authResponse.error);
    } else {
      console.log("Signed in successfully:", authResponse.data);
    }
  } else {
    console.log("Creating new appUserId..");
    appUserId = uuid.v4().toString();

    const authResponse = await supabase.auth.signUp({
      email: `${appUserId}@aavealarm.com`,
      password: "aavealarm",
    });
    if (authResponse.error) {
      console.error("Error signing up:", authResponse.error);
    } else {
      console.log("Signed up successfully:", authResponse.data);
      console.log("aaaa appUserId", appUserId);
      await SecureStore.setItemAsync("appUserId", appUserId);
      console.log("aaaa returned id", authResponse.data.user!.id);
      await SecureStore.setItemAsync(
        "supabaseUserId",
        authResponse.data.user!.id
      );
    }
  }
  supabaseInitialized = true;
}

export async function getSupabase() {
  console.log("aaa supabaseInitialized", supabaseInitialized);
  while (!supabaseInitialized) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return supabase;
}
