import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import SwipeCard from "@/components/SwipeCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MOCK_RECIPES, Recipe } from "@/data/mockData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 16;

const MOODS = [
  { label: "🍽️ Just Me", filter: (r: Recipe) => r.eventTypes?.includes("just-me") || r.prepTime + r.cookTime <= 25 },
  { label: "💑 Date Night", filter: (r: Recipe) => r.eventTypes?.includes("date-night") || (r.rating >= 4.8 && r.difficulty !== "Easy") },
  { label: "👨‍👩‍👧 Family", filter: (r: Recipe) => r.eventTypes?.includes("family-dinner") || r.servings >= 3 },
  { label: "👯 Friends", filter: (r: Recipe) => r.eventTypes?.includes("friends") || r.servings >= 4 },
  { label: "🎬 Movie Night", filter: (r: Recipe) => r.eventTypes?.includes("movie-night") || r.prepTime + r.cookTime <= 20 },
  { label: "🏈 Watch Party", filter: (r: Recipe) => r.eventTypes?.includes("watch-party") || r.tags.includes("party") },
  { label: "🎂 Birthday", filter: (r: Recipe) => r.eventTypes?.includes("birthday") || r.rating >= 4.9 },
  { label: "🥗 Meal Prep", filter: (r: Recipe) => r.eventTypes?.includes("meal-prep") || r.tags.includes("meal-prep") },
  { label: "🌅 Brunch", filter: (r: Recipe) => r.eventTypes?.includes("brunch") || r.tags.includes("breakfast") },
  { label: "💪 Gym Fuel", filter: (r: Recipe) => r.nutrition.protein >= 30 },
  { label: "⚡ Quick", filter: (r: Recipe) => r.prepTime + r.cookTime <= 20 },
  { label: "🎲 Surprise", filter: (_r: Recipe) => Math.random() > 0.4 },
];

const SEARCH_VARIANTS: { label: string; subtitle: string; recipeId: string }[] = [
  { label: "Spaghetti Carbonara", subtitle: "Classic Roman · 620 kcal", recipeId: "1" },
  { label: "Carbonara with Pancetta", subtitle: "Crispy pork · 640 kcal", recipeId: "1" },
  { label: "Garlic Butter Salmon", subtitle: "Mediterranean · 480 kcal", recipeId: "2" },
  { label: "Buddha Bowl", subtitle: "Vegan · 520 kcal", recipeId: "3" },
  { label: "Beef Bibimbap", subtitle: "Korean · 680 kcal", recipeId: "4" },
  { label: "Avocado Toast", subtitle: "Breakfast · 380 kcal", recipeId: "5" },
  { label: "Chicken Tikka Masala", subtitle: "Indian · 560 kcal", recipeId: "6" },
  { label: "Tacos al Pastor", subtitle: "Mexican · 450 kcal", recipeId: "7" },
  { label: "Beef Ramen", subtitle: "Japanese · 720 kcal", recipeId: "9" },
  { label: "Overnight Oats", subtitle: "Meal prep · 420 kcal", recipeId: "10" },
];

type Particle = { id: string; emoji: string; anim: Animated.ValueXY; opacity: Animated.Value };

const HEADER_CONTENT_H = 58;
const SEARCH_H = 54;
const MOOD_H = 48;
const BANNER_H = 50;
const HINTS_H = 42;
const TAB_BAR_H = Platform.OS === "web" ? 68 : 60;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, getPantryMatchScore, saveRecipe, pantryItems } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const hasBanner = pantryItems.length > 0;

  const HEADER_TOTAL = topPadding + 14 + HEADER_CONTENT_H;
  const deckHeight = Math.max(
    300,
    SCREEN_HEIGHT - HEADER_TOTAL - SEARCH_H - MOOD_H - (hasBanner ? BANNER_H : 0) - HINTS_H - TAB_BAR_H
  );

  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [saveToast, setSaveToast] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const saveToastAnim = useRef(new Animated.Value(0)).current;
  const matchCountAnim = useRef(new Animated.Value(0)).current;
  const [displayMatchCount, setDisplayMatchCount] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  const visibleRecipes = filteredRecipes.slice(currentIndex, currentIndex + 3);
  const matchCount = filteredRecipes.filter((r) => getPantryMatchScore(r) >= 60).length;
  const expiringItems = pantryItems.filter((i) => i.status === "Expiring" || i.status === "Expired");
  const noMoreCards = currentIndex >= filteredRecipes.length;

  useEffect(() => {
    if (matchCount === 0) return;
    matchCountAnim.setValue(0);
    const listener = matchCountAnim.addListener(({ value }) => setDisplayMatchCount(Math.round(value)));
    Animated.timing(matchCountAnim, { toValue: matchCount, duration: 900, useNativeDriver: false }).start();
    return () => matchCountAnim.removeListener(listener);
  }, [matchCount]);

  const applyMood = useCallback((mood: string) => {
    const moodObj = MOODS.find((m) => m.label === mood);
    if (!moodObj) return;
    const filtered = mood === "Surprise Me"
      ? [...MOCK_RECIPES].sort(() => Math.random() - 0.5)
      : MOCK_RECIPES.filter(moodObj.filter);
    setFilteredRecipes(filtered.length > 0 ? filtered : MOCK_RECIPES);
    setCurrentIndex(0);
  }, []);

  const triggerParticles = useCallback((type: "right" | "left" | "up") => {
    const emojis =
      type === "right" ? ["🧄", "🫙", "🥚", "🧅", "🧀", "🍋", "🌿", "🧂"]
        : type === "up" ? ["✦", "✦", "✦", "✦", "✦", "✦"]
        : ["●", "●", "●"];
    const newParticles: Particle[] = emojis.map((emoji, i) => {
      const angle = (i / emojis.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const distance = 90 + Math.random() * 70;
      const anim = new Animated.ValueXY({ x: 0, y: 0 });
      const opacity = new Animated.Value(1);
      Animated.parallel([
        Animated.timing(anim, { toValue: { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }, duration: 620, useNativeDriver: false }),
        Animated.sequence([Animated.delay(200), Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: false })]),
      ]).start();
      return { id: `${Date.now()}-${i}`, emoji, anim, opacity };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 720);
  }, []);

  const showSaveToast = useCallback(() => {
    setSaveToast(true);
    saveToastAnim.setValue(0);
    Animated.sequence([
      Animated.spring(saveToastAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.delay(1200),
      Animated.timing(saveToastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setSaveToast(false));
  }, [saveToastAnim]);

  const handleSwipeLeft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerParticles("left");
    setCurrentIndex((prev) => Math.min(prev + 1, filteredRecipes.length));
  }, [filteredRecipes.length, triggerParticles]);

  const handleSwipeRight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    triggerParticles("right");
    const recipe = filteredRecipes[currentIndex];
    setTimeout(() => { if (recipe) router.push(`/recipe/${recipe.id}`); }, 350);
    setCurrentIndex((prev) => Math.min(prev + 1, filteredRecipes.length));
  }, [filteredRecipes, currentIndex, router, triggerParticles]);

  const handleSwipeUp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const recipe = filteredRecipes[currentIndex];
    if (recipe) saveRecipe(recipe.id);
    triggerParticles("up");
    showSaveToast();
    setCurrentIndex((prev) => Math.min(prev + 1, filteredRecipes.length));
  }, [filteredRecipes, currentIndex, saveRecipe, triggerParticles, showSaveToast]);

  const resetCards = useCallback(() => {
    setFilteredRecipes(MOCK_RECIPES);
    setCurrentIndex(0);
    setActiveMood(null);
  }, []);

  const searchResults = SEARCH_VARIANTS.filter((v) =>
    v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPadding + 6, paddingBottom: 10 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
            {greeting}, {userProfile.name} 👋
          </Text>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
            What are we cooking?
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* AI Chef button */}
          <TouchableOpacity
            style={styles.aiChefBtn}
            onPress={() => router.push("/ai-chef")}
          >
            <Text style={{ fontSize: 19 }}>👨‍🍳</Text>
          </TouchableOpacity>
          {/* Notification bell */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={18} color={colors.primary} />
            <View style={[styles.notifDot, { backgroundColor: "#EF4444" }]} />
          </TouchableOpacity>
          {/* Avatar */}
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
              {userProfile.name[0]?.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => { setSearchQuery(""); setSearchVisible(true); }}
        activeOpacity={0.8}
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <Text style={[styles.searchPlaceholder, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Search recipes, ingredients, cuisine…
        </Text>
        <Feather name="sliders" size={16} color={colors.primary} />
      </TouchableOpacity>

      {/* ── OCCASION CHIPS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moodScrollView}
        contentContainerStyle={styles.moodStrip}
      >
        {MOODS.map((mood) => {
          const isActive = activeMood === mood.label;
          return (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodChip,
                isActive
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                if (isActive) { resetCards(); }
                else { setActiveMood(mood.label); applyMood(mood.label); }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.moodChipText,
                  { color: isActive ? "#fff" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── SMART BANNER ── */}
      {expiringItems.length > 0 ? (
        <View style={styles.expiryBannerWrap}>
          <View style={styles.expiryBannerAccent} />
          <View style={styles.expiryBannerBody}>
            <Text style={{ fontSize: 15 }}>⚠️</Text>
            <Text
              style={[styles.expiryBannerText, { fontFamily: "Inter_400Regular" }]}
              numberOfLines={1}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#0F1C2E" }}>
                {expiringItems[0].name}
              </Text>
              {expiringItems.length > 1 ? ` +${expiringItems.length - 1} more` : ""}
              {" "}expiring soon — cook it up!
            </Text>
          </View>
        </View>
      ) : hasBanner ? (
        <View style={[styles.matchBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.matchDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.matchBannerText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            <Text style={{ color: colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }}>
              {displayMatchCount}
            </Text>{" "}
            recipes match your pantry right now
          </Text>
        </View>
      ) : null}

      {/* ── SWIPE DECK ── */}
      <View style={styles.deckWrapper}>
        {noMoreCards ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 48 }}>🍽</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {activeMood ? "Try a different mood filter" : "Add more ingredients to unlock recipes"}
            </Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={resetCards}>
              <Text style={[styles.emptyBtnText, { fontFamily: "Inter_700Bold" }]}>See All Recipes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.cardStack, { width: CARD_WIDTH, height: deckHeight }]}>
            {visibleRecipes.map((recipe, i) => (
              <SwipeCard
                key={recipe.id}
                recipe={recipe}
                pantryMatchScore={getPantryMatchScore(recipe)}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                isTop={i === 0}
                index={i}
                containerHeight={deckHeight + 8}
              />
            )).reverse()}
          </View>
        )}

        {/* Particle burst */}
        {particles.map((p) => (
          <Animated.Text
            key={p.id}
            style={[
              styles.particle,
              { transform: [{ translateX: p.anim.x }, { translateY: p.anim.y }], opacity: p.opacity },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        ))}
      </View>

      {/* ── SWIPE DIRECTION HINTS (replaces X/Heart/Save buttons) ── */}
      {!noMoreCards && (
        <View style={styles.hintsRow}>
          <View style={styles.hintItem}>
            <Feather name="arrow-left" size={13} color="#EF4444" />
            <Text style={[styles.hintText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>Skip</Text>
          </View>
          <View style={styles.hintSep} />
          <View style={styles.hintItem}>
            <Feather name="arrow-up" size={13} color={colors.primary} />
            <Text style={[styles.hintText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>Save</Text>
          </View>
          <View style={styles.hintSep} />
          <View style={styles.hintItem}>
            <Feather name="arrow-right" size={13} color="#10B981" />
            <Text style={[styles.hintText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>Cook this</Text>
          </View>
        </View>
      )}

      {/* ── SAVE TOAST ── */}
      {saveToast && (
        <Animated.View
          style={[
            styles.saveToast,
            {
              backgroundColor: colors.primary,
              opacity: saveToastAnim,
              transform: [{ translateY: saveToastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <Text style={[styles.saveToastText, { fontFamily: "Inter_600SemiBold" }]}>Saved for later 🔖</Text>
        </Animated.View>
      )}

      {/* ── SEARCH MODAL ── */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.searchModalOverlay}>
          <View style={[styles.searchModalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.searchModalBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={18} color={colors.primary} />
              <TextInput
                style={[styles.searchModalInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Search recipes…"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Text style={[styles.searchCancelText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            {searchQuery.length === 0 ? (
              <View style={styles.searchSuggestions}>
                <Text style={[styles.searchHintText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Try "carbonara", "salmon", "quick" or any ingredient
                </Text>
                <View style={styles.searchTags}>
                  {["🍝 Pasta", "🐟 Seafood", "🥗 Vegan", "⚡ Quick", "💪 High Protein"].map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.searchTag, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => setSearchQuery(tag.split(" ")[1])}
                    >
                      <Text style={[styles.searchTagText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                  <View style={styles.noResults}>
                    <Text style={[styles.noResultsText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                      No recipes found for "{searchQuery}"
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.searchResultRow, { borderBottomColor: colors.border }]}
                    onPress={() => { setSearchVisible(false); router.push(`/recipe/${item.recipeId}`); }}
                  >
                    <View style={[styles.searchResultIcon, { backgroundColor: colors.card }]}>
                      <Feather name="book-open" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.searchResultTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.searchResultSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <Feather name="arrow-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  greeting: { fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 22, letterSpacing: -0.4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiChefBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2B7FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B7FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 14 },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchPlaceholder: { fontSize: 13, flex: 1 },

  // ── Mood chips ──
  moodScrollView: { height: 48, flexGrow: 0, flexShrink: 0 },
  moodStrip: { paddingHorizontal: 16, gap: 8, alignItems: "center", height: 48 },
  moodChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodChipText: { fontSize: 13 },

  // ── Expiry banner ──
  expiryBannerWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFF8EB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  expiryBannerAccent: {
    width: 4,
    backgroundColor: "#F59E0B",
  },
  expiryBannerBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  expiryBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#78480C",
  },

  // ── Pantry match banner ──
  matchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  matchDot: { width: 7, height: 7, borderRadius: 3.5 },
  matchBannerText: { flex: 1, fontSize: 13 },

  // ── Deck ──
  deckWrapper: { alignItems: "center", position: "relative" },
  cardStack: { position: "relative" },
  emptyState: {
    width: SCREEN_WIDTH - 64,
    paddingVertical: 48,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
    marginTop: 32,
  },
  emptyTitle: { fontSize: 20 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, marginTop: 6 },
  emptyBtnText: { color: "#fff", fontSize: 15 },
  particle: { position: "absolute", fontSize: 22, zIndex: 999 },

  // ── Swipe hints row ──
  hintsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    height: HINTS_H,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  hintText: { fontSize: 12 },
  hintSep: {
    width: 1,
    height: 14,
    backgroundColor: "#E2EAFF",
  },

  // ── Save toast ──
  saveToast: {
    position: "absolute",
    top: Platform.OS === "web" ? 80 : 90,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    zIndex: 9999,
  },
  saveToastText: { color: "#fff", fontSize: 14 },

  // ── Search Modal ──
  searchModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  searchModalContainer: {
    flex: 1,
    marginTop: Platform.OS === "web" ? 60 : 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  searchModalBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchModalInput: { flex: 1, fontSize: 16 },
  searchCancelText: { fontSize: 15 },
  searchSuggestions: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  searchHintText: { fontSize: 14 },
  searchTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  searchTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  searchTagText: { fontSize: 13 },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultTitle: { fontSize: 15, marginBottom: 2 },
  searchResultSub: { fontSize: 13 },
  noResults: { paddingTop: 40, alignItems: "center" },
  noResultsText: { fontSize: 15 },
});
