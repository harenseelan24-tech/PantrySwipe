import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MOCK_SOCIAL_POSTS, SocialPost } from "@/data/mockData";
import { getRecipeImageSource, getSocialImageSource } from "@/constants/recipeImages";

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINE_EMOJIS: Record<string, string> = {
  Italian: "🍝", Japanese: "🍜", Korean: "🥘", Mexican: "🌮",
  Indian: "🍛", Chinese: "🥡", Thai: "🍲", American: "🍔",
  French: "🥐", Mediterranean: "🫒", Vegan: "🌱", Singaporean: "🦀",
  "Middle Eastern": "🥙", Other: "🍽️",
};

const CUISINE_DESCRIPTIONS: Record<string, string> = {
  Italian: "Rich pastas, fresh herbs, and timeless flavours from the heart of Europe.",
  Japanese: "Elegant umami-forward dishes balancing freshness, technique, and tradition.",
  Korean: "Bold, spicy, fermented — Korean cooking packs every bite with flavour.",
  Mexican: "Vibrant colours, smoky chillis, and centuries of culinary heritage.",
  Indian: "A universe of spices, aromatics, and deeply satisfying comfort food.",
  Chinese: "Wok-kissed depth, regional variety, and masterful balance.",
  Thai: "Sweet, sour, salty, spicy — Thai cuisine hits all four notes at once.",
  American: "Generous portions, comfort classics, and crowd-pleasing favourites.",
  French: "Refined techniques, buttery richness, and the gold standard of cooking.",
  Mediterranean: "Olive oil, fresh vegetables, and the healthy flavours of the sea.",
  Vegan: "Plant-powered dishes that prove you never have to sacrifice flavour.",
  Singaporean: "A melting pot of Malay, Chinese, and Indian flavours at its finest.",
  "Middle Eastern": "Warm spices, tahini, and the generous hospitality of the Levant.",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#4CAF76", Medium: "#F5A623", Hard: "#E84040",
};

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Post card (extracted so FlatList renderItem is fully typed) ───────────────

interface PostCardProps {
  post: SocialPost;
  index: number;
  colors: ReturnType<typeof useColors>;
  onRecipePress: (id: string) => void;
}

function PostCard({ post, index, colors, onRecipePress }: PostCardProps) {
  const imgSrc = getSocialImageSource(post.image, index, post.recipeId);
  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.postAvatarText}>{post.userAvatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postUsername, { color: colors.foreground }]}>{post.username}</Text>
          <Text style={[styles.postTime, { color: colors.textMuted }]}>{post.timeAgo}</Text>
        </View>
        <View style={[styles.trendingBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.trendingBadgeText, { color: colors.primary }]}>🔥 Trending</Text>
        </View>
      </View>

      {imgSrc != null && (
        <Image source={imgSrc} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postBody}>
        <Text style={[styles.postCaption, { color: colors.foreground }]} numberOfLines={3}>
          {post.caption}
        </Text>

        {post.recipeName != null && (
          <TouchableOpacity
            style={[styles.recipeLink, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
            onPress={() => post.recipeId != null && onRecipePress(post.recipeId)}
            activeOpacity={0.8}
          >
            <Feather name="book-open" size={12} color={colors.primary} />
            <Text style={[styles.recipeLinkText, { color: colors.primary }]} numberOfLines={1}>
              {post.recipeName}
            </Text>
            <Feather name="arrow-right" size={12} color={colors.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.postActions}>
          <View style={styles.postActionGroup}>
            <Feather name="heart" size={16} color={post.liked ? "#E84040" : colors.textMuted} />
            <Text style={[styles.postActionCount, { color: colors.textSecondary }]}>
              {formatCount(post.likes)}
            </Text>
          </View>
          <View style={styles.postActionGroup}>
            <Feather name="message-circle" size={16} color={colors.textMuted} />
            <Text style={[styles.postActionCount, { color: colors.textSecondary }]}>
              {String(post.comments)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CuisineDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { liveRecipes, getPantryMatchScore } = useApp();

  const cuisineName = Array.isArray(name) ? name[0] : (name ?? "");
  const emoji = CUISINE_EMOJIS[cuisineName] ?? "🍽️";
  const description =
    CUISINE_DESCRIPTIONS[cuisineName] ??
    `Explore the best ${cuisineName} recipes and posts from the community.`;

  const cuisineRecipes = useMemo(
    () => liveRecipes.filter((r) => r.cuisine === cuisineName),
    [liveRecipes, cuisineName],
  );

  const cuisinePosts = useMemo(
    () => MOCK_SOCIAL_POSTS.filter((p) => p.cuisine === cuisineName),
    [cuisineName],
  );

  const totalLikes = useMemo(
    () => cuisinePosts.reduce((sum, p) => sum + p.likes, 0),
    [cuisinePosts],
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleRecipePress = (id: string) => router.push(`/recipe/${id}`);

  // ── Recipes header component ──
  const ListHeader = (
    <View>
      {/* Hero */}
      <View style={[styles.heroBanner, { backgroundColor: colors.primary + "10", borderBottomColor: colors.border }]}>
        <Text style={styles.heroEmoji}>{emoji}</Text>
        <Text style={[styles.heroCuisineName, { color: colors.foreground }]}>{cuisineName}</Text>
        <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{cuisinePosts.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{cuisineRecipes.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Recipes</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{formatCount(totalLikes)}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Likes</Text>
        </View>
      </View>

      {/* Recipes horizontal scroll */}
      {cuisineRecipes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recipes</Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{cuisineRecipes.length} found</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipesRow}>
            {cuisineRecipes.map((recipe) => {
              const imgSrc = getRecipeImageSource(null, recipe.id);
              const matchPct = getPantryMatchScore(recipe);
              return (
                <TouchableOpacity
                  key={recipe.id}
                  style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  activeOpacity={0.85}
                >
                  {imgSrc != null ? (
                    <Image source={imgSrc} style={styles.recipeCardImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.recipeCardImage, { backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center" }]}>
                      <Text style={{ fontSize: 30 }}>{emoji}</Text>
                    </View>
                  )}
                  {matchPct >= 60 && (
                    <View style={[styles.matchBadge, { backgroundColor: "#4CAF76" }]}>
                      <Text style={styles.matchBadgeText}>{matchPct}% match</Text>
                    </View>
                  )}
                  <View style={styles.recipeCardBody}>
                    <Text style={[styles.recipeCardTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View style={styles.recipeCardMeta}>
                      <View style={[styles.difficultyDot, { backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] ?? colors.textMuted }]} />
                      <Text style={[styles.recipeCardMetaText, { color: colors.textSecondary }]}>
                        {recipe.difficulty} · {recipe.prepTime + recipe.cookTime}m
                      </Text>
                    </View>
                    <Text style={[styles.recipeCardCal, { color: colors.textMuted }]}>{recipe.calories} kcal</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Posts section label */}
      {cuisinePosts.length > 0 && (
        <View style={[styles.sectionHeader, { marginHorizontal: 16, marginTop: 18, marginBottom: 8 }]}>
          <View style={[styles.sectionAccent, { backgroundColor: colors.textMuted }]} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Community Posts</Text>
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{cuisinePosts.length} posts</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{emoji}</Text>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{cuisineName}</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Cuisine</Text>
          </View>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={cuisinePosts}
        keyExtractor={(item: SocialPost) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>{emoji}</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Be the first to share a {cuisineName} dish!
            </Text>
          </View>
        }
        renderItem={({ item, index }: { item: SocialPost; index: number }) => (
          <PostCard
            post={item}
            index={index}
            colors={colors}
            onRecipePress={handleRecipePress}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerEmoji: { fontSize: 26 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  heroBanner: {
    alignItems: "center", paddingVertical: 32, paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 6,
  },
  heroEmoji: { fontSize: 64, marginBottom: 4 },
  heroCuisineName: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, textAlign: "center" },
  heroDescription: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginTop: 4 },

  statsRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, marginVertical: 12 },

  section: { marginTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 12 },
  sectionAccent: { width: 3, height: 14, borderRadius: 2 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1 },
  sectionCount: { fontSize: 11, fontFamily: "Inter_400Regular" },

  recipesRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  recipeCard: { width: 160, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  recipeCardImage: { width: "100%", height: 110 },
  matchBadge: { position: "absolute", top: 8, right: 8, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  matchBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  recipeCardBody: { padding: 10, gap: 4 },
  recipeCardTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 17 },
  recipeCardMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  difficultyDot: { width: 6, height: 6, borderRadius: 3 },
  recipeCardMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  recipeCardCal: { fontSize: 10, fontFamily: "Inter_400Regular" },

  postCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  postAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  postUsername: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  postTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  trendingBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  trendingBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  postImage: { width: "100%", aspectRatio: 4 / 3 },
  postBody: { padding: 14, gap: 8 },
  postCaption: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  recipeLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  recipeLinkText: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
  postActions: { flexDirection: "row", gap: 16, marginTop: 2 },
  postActionGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  postActionCount: { fontSize: 12, fontFamily: "Inter_400Regular" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
