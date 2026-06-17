import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/hooks/useNotifications";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(hoursBack: number): string {
  if (hoursBack < 1) return "Just now";
  if (hoursBack < 2) return "1 hour ago";
  if (hoursBack < 24) return `${Math.floor(hoursBack)}h ago`;
  const days = Math.floor(hoursBack / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function mealSlotLabel(hour: number) {
  if (hour < 10) return "Breakfast";
  if (hour < 14) return "Lunch";
  if (hour < 17) return "Snack";
  return "Dinner";
}

// ── Notification data ─────────────────────────────────────────────────────────

function buildNotifications() {
  const now = new Date();
  const h = now.getHours();

  const meal_notifs = [
    // Only show meals that have already fired today (hour has passed)
    h >= 7  ? { id: "m1", type: "meal" as const, icon: "☀️", color: "#F5A623", title: "Good morning! 🍳", body: "Shall we see what we can make for breakfast today?", hoursBack: h - 7.5, route: "/(tabs)/", meal: "Breakfast" } : null,
    h >= 12 ? { id: "m2", type: "meal" as const, icon: "🥗", color: "#4CAF76", title: "Lunchtime! 🥗", body: "Shall we see what we can have for lunch? Your pantry has ideas.", hoursBack: h - 12, route: "/(tabs)/", meal: "Lunch" } : null,
    h >= 15 ? { id: "m3", type: "meal" as const, icon: "🍿", color: "#9B6DFF", title: "Snack time! 🍿", body: "Feeling peckish? Let's find something quick and tasty.", hoursBack: h - 15, route: "/(tabs)/", meal: "Snack" } : null,
    h >= 18 ? { id: "m4", type: "meal" as const, icon: "🍽️", color: "#5B8EF5", title: "Dinner time! 🍽️", body: "Shall we see what we can cook for dinner tonight?", hoursBack: h - 18.5, route: "/(tabs)/", meal: "Dinner" } : null,
  ].filter(Boolean).reverse() as Array<{
    id: string; type: "meal"; icon: string; color: string;
    title: string; body: string; hoursBack: number; route: string; meal: string;
  }>;

  // If no meal notifications have fired yet today (very early morning), show yesterday's dinner
  if (meal_notifs.length === 0) {
    meal_notifs.push({
      id: "m_prev",
      type: "meal",
      icon: "🍽️",
      color: "#5B8EF5",
      title: "Dinner time! 🍽️",
      body: "Shall we see what we can cook for dinner tonight?",
      hoursBack: h + 5.5,
      route: "/(tabs)/",
      meal: "Dinner",
    });
  }

  const activity_notifs = [
    {
      id: "a1",
      type: "expiry" as const,
      featherIcon: "alert-triangle",
      color: "#E84040",
      title: "Spinach expires tomorrow",
      body: "Use it up! We've got 6 recipes that need fresh spinach.",
      hoursBack: 1.5,
      route: "/(tabs)/pantry",
    },
    {
      id: "a2",
      type: "ready" as const,
      featherIcon: "check-circle",
      color: "#4CAF76",
      title: "Carbonara is ready to cook!",
      body: "You now have all the ingredients. Ready to start?",
      hoursBack: 3,
      route: "/(tabs)/",
    },
    {
      id: "a3",
      type: "social" as const,
      featherIcon: "heart",
      color: "#E84040",
      title: "Chef Marco liked your post",
      body: "Your Spaghetti photo got a reaction! 😍",
      hoursBack: 6,
      route: "/(tabs)/social",
    },
    {
      id: "a4",
      type: "streak" as const,
      featherIcon: "zap",
      color: "#F5A623",
      title: "7-day cooking streak! 🔥",
      body: "You're on fire! Cook tonight to keep your streak alive.",
      hoursBack: 8,
      route: "/(tabs)/profile",
    },
    {
      id: "a5",
      type: "plan" as const,
      featherIcon: "calendar",
      color: "#5B8EF5",
      title: "Your weekly meal plan is ready",
      body: "AI-generated meals based on what's in your pantry.",
      hoursBack: 24,
      route: "/(tabs)/planner",
    },
    {
      id: "a6",
      type: "social" as const,
      featherIcon: "user",
      color: "#9B6DFF",
      title: "Chef Marco cooked Teriyaki Salmon",
      body: "See how their dish turned out — tap to view.",
      hoursBack: 26,
      route: "/(tabs)/social",
    },
    {
      id: "a7",
      type: "expiry" as const,
      featherIcon: "alert-triangle",
      color: "#E84040",
      title: "Chicken expires in 2 days",
      body: "3 quick dinners you can make right now.",
      hoursBack: 48,
      route: "/(tabs)/pantry",
    },
  ];

  return { meal_notifs, activity_notifs };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { markAllRead } = useNotifications();

  useEffect(() => {
    markAllRead();
  }, []);

  const { meal_notifs, activity_notifs } = buildNotifications();

  const handleTap = (route: string) => {
    if (route.startsWith("/(tabs)/")) {
      const path = route.replace("/(tabs)/", "") || "index";
      router.back();
      setTimeout(() => router.push(route as any), 100);
    } else {
      router.push(route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
          Notifications
        </Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.clearAll, { color: colors.saffron, fontFamily: "Inter_600SemiBold" }]}>
            Mark read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Meal time notifications ── */}
        {meal_notifs.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              TODAY
            </Text>
            {meal_notifs.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.saffron + "40" }]}
                onPress={() => handleTap(n.route)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBg, { backgroundColor: colors.saffron + "20" }]}>
                  <Text style={{ fontSize: 22 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.notifTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {n.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {n.body}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {timeAgo(n.hoursBack)}
                    </Text>
                    <View style={[styles.mealTag, { backgroundColor: colors.saffron + "20" }]}>
                      <Text style={[styles.mealTagText, { color: colors.saffron, fontFamily: "Inter_600SemiBold" }]}>
                        {n.meal}
                      </Text>
                    </View>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Activity notifications ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", marginTop: 8 }]}>
          ACTIVITY
        </Text>
        {activity_notifs.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleTap(n.route)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBg, { backgroundColor: n.color + "20" }]}>
              <Feather name={n.featherIcon as any} size={20} color={n.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.notifTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {n.title}
              </Text>
              <Text style={[styles.notifBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {n.body}
              </Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {timeAgo(n.hoursBack)}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20 },
  clearAll: { fontSize: 14 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, marginBottom: 10, marginTop: 4, paddingHorizontal: 4 },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconBg: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifTitle: { fontSize: 14 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11 },
  mealTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  mealTagText: { fontSize: 11 },
});
