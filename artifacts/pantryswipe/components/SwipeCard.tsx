import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Recipe } from "@/data/mockData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_UP_THRESHOLD = -80;
const MAX_ROTATION = 15;
const CARD_BASE_WIDTH = SCREEN_WIDTH - 16;

const RECIPE_IMAGES: Record<string, ReturnType<typeof require>> = {
  "recipe-pasta": require("@/assets/images/recipe-pasta.png"),
  "recipe-salmon": require("@/assets/images/recipe-salmon.png"),
  "recipe-bowl": require("@/assets/images/recipe-bowl.png"),
  "recipe-bibimbap": require("@/assets/images/recipe-bibimbap.png"),
};

const CUISINE_FLAGS: Record<string, string> = {
  Italian: "🇮🇹",
  Japanese: "🇯🇵",
  Korean: "🇰🇷",
  Mexican: "🇲🇽",
  Indian: "🇮🇳",
  Chinese: "🇨🇳",
  Thai: "🇹🇭",
  American: "🇺🇸",
  French: "🇫🇷",
  Mediterranean: "🌊",
  "Middle Eastern": "🌙",
  Vietnamese: "🇻🇳",
  Singaporean: "🇸🇬",
};

const CUISINE_EMOJIS: Record<string, string> = {
  Italian: "🍝",
  Japanese: "🍜",
  Korean: "🥘",
  Mexican: "🌮",
  Indian: "🍛",
  Chinese: "🥡",
  Thai: "🍲",
  American: "🍔",
  French: "🥐",
  Mediterranean: "🫒",
  "Middle Eastern": "🧆",
  Vietnamese: "🍜",
  Singaporean: "🦀",
};

interface SwipeCardProps {
  recipe: Recipe;
  pantryMatchScore: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isTop: boolean;
  index: number;
  containerHeight: number;
}

export default function SwipeCard({
  recipe,
  pantryMatchScore,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTop,
  index,
  containerHeight,
}: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const cardHeight = containerHeight > 0 ? containerHeight - 8 : SCREEN_HEIGHT * 0.62;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
    outputRange: [`-${MAX_ROTATION}deg`, "0deg", `${MAX_ROTATION}deg`],
    extrapolate: "clamp",
  });

  const rightTintOpacity = pan.x.interpolate({ inputRange: [0, 30, 80], outputRange: [0, 0, 0.32], extrapolate: "clamp" });
  const rightStampOpacity = pan.x.interpolate({ inputRange: [30, 80], outputRange: [0, 1], extrapolate: "clamp" });
  const leftTintOpacity = pan.x.interpolate({ inputRange: [-80, -30, 0], outputRange: [0.32, 0, 0], extrapolate: "clamp" });
  const leftStampOpacity = pan.x.interpolate({ inputRange: [-80, -30], outputRange: [1, 0], extrapolate: "clamp" });
  const upTintOpacity = pan.y.interpolate({ inputRange: [-100, -30, 0], outputRange: [0.32, 0, 0], extrapolate: "clamp" });
  const upStampOpacity = pan.y.interpolate({ inputRange: [-100, -30], outputRange: [1, 0], extrapolate: "clamp" });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => isTop && (Math.abs(gs.dx) > 6 || Math.abs(gs.dy) > 6),
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > SWIPE_THRESHOLD) {
        Animated.timing(pan, { toValue: { x: SCREEN_WIDTH * 1.6, y: gs.dy * 1.5 }, duration: 280, useNativeDriver: false }).start(onSwipeRight);
      } else if (gs.dx < -SWIPE_THRESHOLD) {
        Animated.timing(pan, { toValue: { x: -SCREEN_WIDTH * 1.6, y: gs.dy * 1.5 }, duration: 280, useNativeDriver: false }).start(onSwipeLeft);
      } else if (gs.dy < SWIPE_UP_THRESHOLD) {
        Animated.timing(pan, { toValue: { x: gs.dx, y: -SCREEN_HEIGHT }, duration: 300, useNativeDriver: false }).start(onSwipeUp);
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, tension: 42, useNativeDriver: false }).start();
      }
    },
  });

  const stackScale = index === 0 ? 1 : index === 1 ? 0.94 : 0.88;
  const stackOffsetY = index === 0 ? 0 : index === 1 ? 10 : 22;
  const cardOpacity = index === 0 ? 1 : index === 1 ? 0.78 : 0.48;
  const stackWidthReduction = index === 0 ? 0 : index === 1 ? 20 : 36;
  const cardWidth = CARD_BASE_WIDTH - stackWidthReduction;

  const matchedCount = recipe.ingredients.filter((i) => i.inPantry).length;
  const missingCount = recipe.ingredients.filter((i) => !i.inPantry).length;

  const difficultyColor =
    recipe.difficulty === "Easy" ? "#10B981"
    : recipe.difficulty === "Medium" ? "#2B7FFF"
    : "#EF4444";

  const cuisineFlag = CUISINE_FLAGS[recipe.cuisine] ?? "🌍";
  const cuisineEmoji = CUISINE_EMOJIS[recipe.cuisine] ?? "🍽";
  const imageSource = recipe.image ? RECIPE_IMAGES[recipe.image] : null;

  const gradientH1 = cardHeight * 0.28;
  const gradientH2 = cardHeight * 0.56;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          opacity: cardOpacity,
          shadowColor: "#2B7FFF",
          transform: isTop
            ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
            : [{ scale: stackScale }, { translateY: stackOffsetY }],
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Full-bleed image or emoji placeholder */}
      {imageSource ? (
        <Image source={imageSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.emojiPlaceholder]}>
          <Text style={styles.placeholderEmoji}>{cuisineEmoji}</Text>
        </View>
      )}

      {/* Gradient overlay — 3 layers simulate top-to-dark gradient */}
      <View style={[StyleSheet.absoluteFill, { top: cardHeight - gradientH2, backgroundColor: "rgba(6, 12, 28, 0.78)" }]} />
      <View style={[StyleSheet.absoluteFill, { top: cardHeight - gradientH1 - gradientH2, height: gradientH2 - gradientH1, backgroundColor: "rgba(6, 12, 28, 0.28)" }]} />

      {/* Top badges row */}
      <View style={styles.topRow}>
        <View style={styles.cuisineBadge}>
          <Text style={styles.cuisineBadgeText}>{cuisineFlag} {recipe.cuisine}</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: difficultyColor }]}>
          <Text style={styles.diffBadgeText}>{recipe.difficulty}</Text>
        </View>
      </View>

      {/* Bottom info panel — overlaid on gradient */}
      <View style={styles.bottomPanel}>
        <View style={styles.matchPill}>
          <View style={styles.matchDot} />
          <Text style={styles.matchPillText}>{pantryMatchScore}% pantry match</Text>
        </View>

        <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>

        <Text style={styles.metaRow} numberOfLines={1}>
          {recipe.cuisine} · ⏱ {recipe.prepTime + recipe.cookTime}m · 🔥 {recipe.calories} kcal · ⭐ {recipe.rating}
        </Text>

        <View style={styles.tagsRow}>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>✓ {matchedCount}/{recipe.ingredients.length} in pantry</Text>
          </View>
          {missingCount > 0 && (
            <View style={styles.tagPillAmber}>
              <Text style={styles.tagText}>+{missingCount} to buy</Text>
            </View>
          )}
        </View>
      </View>

      {/* Swipe stamp overlays */}
      {isTop && (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, styles.tintOverlay, { backgroundColor: "rgba(16,185,129,0.28)", opacity: rightTintOpacity }]}>
            <Animated.View style={[styles.stampWrap, styles.stampTopLeft, { opacity: rightStampOpacity }]}>
              <Text style={[styles.stamp, { color: "#10B981", borderColor: "#10B981" }]}>COOK ✓</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, styles.tintOverlay, { backgroundColor: "rgba(239,68,68,0.25)", opacity: leftTintOpacity }]}>
            <Animated.View style={[styles.stampWrap, styles.stampTopRight, { opacity: leftStampOpacity }]}>
              <Text style={[styles.stamp, { color: "#EF4444", borderColor: "#EF4444" }]}>NOPE ✗</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, styles.tintOverlay, { backgroundColor: "rgba(43,127,255,0.25)", opacity: upTintOpacity }]}>
            <Animated.View style={[styles.stampWrap, styles.stampCenter, { opacity: upStampOpacity }]}>
              <Text style={[styles.stamp, { color: "#5A9FFF", borderColor: "#5A9FFF" }]}>SAVED 🔖</Text>
            </Animated.View>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  emojiPlaceholder: {
    backgroundColor: "#0D1A30",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 100 },
  topRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cuisineBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cuisineBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  diffBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  diffBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 22,
    gap: 8,
  },
  matchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(16,185,129,0.22)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.45)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  matchPillText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  recipeTitle: {
    fontSize: 26,
    color: "#fff",
    lineHeight: 32,
    letterSpacing: -0.3,
    fontFamily: "Fraunces_700Bold",
  },
  metaRow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagPillAmber: {
    backgroundColor: "rgba(245,158,11,0.22)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.38)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  tintOverlay: {
    borderRadius: 28,
    zIndex: 10,
  },
  stampWrap: {
    ...StyleSheet.absoluteFillObject,
    padding: 22,
  },
  stampTopLeft: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    transform: [{ rotate: "-16deg" }],
  },
  stampTopRight: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    transform: [{ rotate: "16deg" }],
  },
  stampCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  stamp: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    letterSpacing: 2,
    overflow: "hidden",
  },
});
