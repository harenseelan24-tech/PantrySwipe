import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. " +
      "Add them to artifacts/pantryswipe/.env to enable auth features."
  );
}

// Provide a crypto adapter so Supabase can generate secure random values
// without hitting the missing native ExpoCryptoAES error on Expo Go.
const cryptoAdapter =
  Platform.OS !== "web"
    ? {
        getRandomValues: (array: Uint8Array) => {
          const bytes = Crypto.getRandomBytes(array.length);
          array.set(bytes);
          return array;
        },
      }
    : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    ...(cryptoAdapter ? { crypto: cryptoAdapter } : {}),
  },
});
