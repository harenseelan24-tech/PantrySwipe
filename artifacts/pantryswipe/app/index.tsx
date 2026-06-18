import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { STORAGE_KEYS } from "@/constants/storageKeys";

export default function RootIndex() {
  const [ready, setReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE)
      .then((val) => {
        try {
          setSetupComplete(!!JSON.parse(val ?? "false"));
        } catch {
          setSetupComplete(false);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: "#141210" }} />;
  if (setupComplete) return <Redirect href="/(tabs)" />;
  return <Redirect href="/welcome" />;
}
