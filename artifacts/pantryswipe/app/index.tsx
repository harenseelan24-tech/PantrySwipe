import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { STORAGE_KEYS } from "@/constants/storageKeys";

export default function RootIndex() {
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE)
      .then((val) => {
        let setupComplete = false;
        try {
          setupComplete = !!JSON.parse(val ?? "false");
        } catch {
          setupComplete = false;
        }
        // Defer by one frame so the navigator is fully mounted on Android
        requestAnimationFrame(() => {
          if (setupComplete) {
            router.replace("/(tabs)");
          } else {
            router.replace("/welcome");
          }
        });
      })
      .catch(() => {
        requestAnimationFrame(() => {
          router.replace("/welcome");
        });
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#141210" }}>
      <ActivityIndicator size="large" color="#F5A623" />
    </View>
  );
}
