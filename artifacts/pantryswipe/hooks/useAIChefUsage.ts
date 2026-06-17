import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FREE_DAILY_LIMIT = 5;

const getStorageKey = () => {
  const d = new Date();
  return `ai_chef_usage_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useAIChefUsage() {
  const [usageCount, setUsageCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(getStorageKey()).then((val) => {
      setUsageCount(val ? parseInt(val, 10) : 0);
      setLoaded(true);
    });
  }, []);

  const increment = useCallback(async () => {
    const next = usageCount + 1;
    setUsageCount(next);
    await AsyncStorage.setItem(getStorageKey(), String(next));
  }, [usageCount]);

  const remaining = Math.max(0, FREE_DAILY_LIMIT - usageCount);
  const isAtLimit = usageCount >= FREE_DAILY_LIMIT;

  return { usageCount, remaining, isAtLimit, increment, loaded };
}
