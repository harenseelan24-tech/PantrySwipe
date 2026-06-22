import { useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const UNREAD_KEY  = "@pantryswipe:notif_unread";
const CLEARED_KEY = "@pantryswipe:notif_cleared";

const MEAL_SCHEDULE = [
  { id: "notif_breakfast", hour: 7,  minute: 30, title: "Good morning! 🍳", body: "Shall we see what we can make for breakfast today?" },
  { id: "notif_lunch",     hour: 12, minute: 0,  title: "Lunchtime! 🥗",   body: "Shall we see what we can have for lunch? Your pantry has ideas." },
  { id: "notif_snack",     hour: 15, minute: 0,  title: "Snack time! 🍿",  body: "Feeling peckish? Let's find something quick and tasty." },
  { id: "notif_dinner",    hour: 18, minute: 30, title: "Dinner time! 🍽️", body: "Shall we see what we can cook for dinner tonight?" },
];

const EXPECTED_IDS = new Set(MEAL_SCHEDULE.map((m) => m.id));

// ─── Module-level singleton ────────────────────────────────────────────────────
// Ensures scheduling/dedup runs exactly once per app session no matter how many
// components mount the hook simultaneously.
let _schedulePromise: Promise<void> | null = null;

async function _doSchedule(): Promise<void> {
  try {
    if (Platform.OS === "web") return;

    // Request permission first.
    const existing = await Notifications.getPermissionsAsync();
    let granted = !!(existing as { granted?: boolean }).granted;
    if (!granted) {
      const result = await Notifications.requestPermissionsAsync();
      granted = !!(result as { granted?: boolean }).granted;
    }
    if (!granted) return;

    // ── Dedup check ──────────────────────────────────────────────────────────
    // Inspect what's actually scheduled in the OS right now.
    // If there are ANY duplicates (same id appearing more than once) or any
    // unexpected ids, cancel everything and start clean.
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    const idCounts: Record<string, number> = {};
    for (const n of scheduled) {
      const id = n.identifier;
      idCounts[id] = (idCounts[id] ?? 0) + 1;
    }

    const hasDuplicates = Object.values(idCounts).some((count) => count > 1);
    const hasWrongIds   = scheduled.some((n) => !EXPECTED_IDS.has(n.identifier));
    const hasMissing    = MEAL_SCHEDULE.some((m) => !idCounts[m.id]);

    if (hasDuplicates || hasWrongIds || hasMissing) {
      // Something is off — wipe everything and rebuild exactly 4 notifications.
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const meal of MEAL_SCHEDULE) {
        await Notifications.scheduleNotificationAsync({
          identifier: meal.id,
          content: { title: meal.title, body: meal.body, sound: true, data: { mealType: meal.id } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: meal.hour,
            minute: meal.minute,
          },
        });
      }
    }
    // If already exactly correct (4 unique, correct ids) — do nothing.
  } catch (e) {
    console.warn("[PantrySwipe] Notification scheduling error:", e);
  }
}

function ensureScheduled(): Promise<void> {
  if (!_schedulePromise) {
    _schedulePromise = _doSchedule();
  }
  return _schedulePromise;
}
// ──────────────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadState();

    if (Platform.OS === "web") return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      bumpCount();
    });

    ensureScheduled()
      .then(() => setPermissionGranted(true))
      .catch(() => {});

    return () => receivedSub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadState = async () => {
    try {
      const [countVal, clearedVal] = await Promise.all([
        AsyncStorage.getItem(UNREAD_KEY),
        AsyncStorage.getItem(CLEARED_KEY),
      ]);
      setUnreadCount(countVal ? Math.max(0, parseInt(countVal, 10)) : 0);
      setCleared(clearedVal === "1");
    } catch {}
  };

  const bumpCount = async () => {
    try {
      const v = await AsyncStorage.getItem(UNREAD_KEY);
      const next = (v ? parseInt(v, 10) : 0) + 1;
      await Promise.all([
        AsyncStorage.setItem(UNREAD_KEY, String(next)),
        AsyncStorage.removeItem(CLEARED_KEY),
      ]);
      setUnreadCount(next);
      setCleared(false);
    } catch {}
  };

  const markAllRead = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(UNREAD_KEY, "0"),
        AsyncStorage.removeItem(CLEARED_KEY),
      ]);
      setUnreadCount(0);
      setCleared(false);
    } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CLEARED_KEY, "1"),
        AsyncStorage.setItem(UNREAD_KEY, "0"),
      ]);
      setCleared(true);
      setUnreadCount(0);
    } catch {}
  }, []);

  return { unreadCount, cleared, markAllRead, clearAll, permissionGranted };
}
