import React, { useState } from "react";
import {
  FlatList,
  Image,
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
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MOCK_SOCIAL_POSTS, SocialPost } from "@/data/mockData";
import { getSocialImageSource } from "@/constants/recipeImages";

const DISCOVERY_TABS = ["For You", "Following", "Trending", "Near Me"];

const ALL_CUISINES = [
  { id: "Italian",     emoji: "🍝" },
  { id: "Japanese",    emoji: "🍣" },
  { id: "Korean",      emoji: "🥘" },
  { id: "Indian",      emoji: "🍛" },
  { id: "Mexican",     emoji: "🌮" },
  { id: "Thai",        emoji: "🍲" },
  { id: "Chinese",     emoji: "🥡" },
  { id: "American",    emoji: "🍔" },
  { id: "French",      emoji: "🥐" },
  { id: "Mediterranean", emoji: "🫒" },
  { id: "Vietnamese",  emoji: "🍜" },
  { id: "Vegan",       emoji: "🥗" },
];

type Comment = { id: string; user: string; text: string; avatar: string; timeAgo: string };

const SEED_COMMENTS: Record<string, Comment[]> = {
  s1: [
    { id: "c1", user: "pasta_lover", text: "This looks incredible! What brand of pancetta do you use?", avatar: "P", timeAgo: "1h ago" },
    { id: "c2", user: "homecook22", text: "Made this last night, absolute perfection 🍝", avatar: "H", timeAgo: "45m ago" },
  ],
  s2: [{ id: "c1", user: "seafood_fan", text: "The garlic butter sauce really makes it!", avatar: "S", timeAgo: "2h ago" }],
  s3: [],
  s4: [{ id: "c1", user: "kfoodie", text: "Stone pot is a MUST, you're 100% right!", avatar: "K", timeAgo: "3h ago" }],
  s5: [],
};

export default function SocialScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { liveRecipes } = useApp();

  const [activeTab, setActiveTab] = useState("For You");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [tempCuisines, setTempCuisines] = useState<string[]>([]);
  const [cuisineModalOpen, setCuisineModalOpen] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(SEED_COMMENTS);
  const [commentModalPost, setCommentModalPost] = useState<SocialPost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [shareToast, setShareToast] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleSave = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  const handleShare = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !commentModalPost) return;
    const c: Comment = { id: Date.now().toString(), user: "you", text: newComment.trim(), avatar: "Y", timeAgo: "just now" };
    setComments((prev) => ({ ...prev, [commentModalPost.id]: [...(prev[commentModalPost.id] || []), c] }));
    setPosts((prev) => prev.map((p) => p.id === commentModalPost.id ? { ...p, comments: p.comments + 1 } : p));
    setNewComment("");
  };

  const openCuisineModal = () => {
    setTempCuisines([...selectedCuisines]);
    setCuisineModalOpen(true);
  };

  const applyFilter = () => {
    setSelectedCuisines([...tempCuisines]);
    setCuisineModalOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTempCuisine = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempCuisines((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  const cuisineLabel = selectedCuisines.length === 0
    ? "All Cuisines"
    : selectedCuisines.length === 1
      ? selectedCuisines[0]
      : `${selectedCuisines.length} cuisines`;

  const renderPost = ({ item, index }: { item: SocialPost; index: number }) => {
    const linkedRecipe = item.recipeId
      ? liveRecipes.find((r) => r.id === item.recipeId || r.id === `api_${item.recipeId}`)
      : undefined;
    const imageSource = getSocialImageSource(item.image, index, linkedRecipe?.id);
    const postComments = comments[item.id] || [];

    return (
      <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* ── Post Header ── */}
        <View style={styles.postHeader}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.userAvatarText, { fontFamily: "Inter_700Bold" }]}>{item.userAvatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.username, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>@{item.username}</Text>
            <Text style={[styles.timeAgo, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>{item.timeAgo}</Text>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}
            accessibilityLabel={`Follow ${item.username}`}
          >
            <Text style={[styles.followBtnText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* ── Image ── */}
        <View style={[styles.postImageWrap, { backgroundColor: colors.muted }]}>
          {imageSource ? (
            <Image source={imageSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text style={{ fontSize: 48 }}>🍽</Text>
            </View>
          )}
        </View>

        {/* ── Actions ── */}
        <View style={[styles.actionsBar, { borderTopColor: colors.border }]}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleLike(item.id)}
              accessibilityLabel={`Like post, ${formatCount(item.likes)} likes`}
            >
              <Feather name="heart" size={22} color={item.liked ? "#E84040" : colors.foreground} />
              <Text style={[styles.actionLabel, { color: item.liked ? "#E84040" : colors.textSecondary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                {formatCount(item.likes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setCommentModalPost(item)}
              accessibilityLabel={`Comment, ${postComments.length || item.comments} comments`}
            >
              <Feather name="message-circle" size={22} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.textSecondary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                {postComments.length || item.comments}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare} accessibilityLabel="Share post">
              <Feather name="share-2" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleSave(item.id)}
            accessibilityLabel={item.saved ? "Unsave post" : "Save post"}
          >
            <Feather name="bookmark" size={22} color={item.saved ? colors.saveBlue : colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* ── Caption + recipe chip ── */}
        <View style={styles.captionContainer}>
          <Text style={[styles.caption, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            <Text style={[{ fontFamily: "Inter_700Bold", color: colors.foreground }]}>@{item.username} </Text>
            {item.caption}
          </Text>
          {item.recipeName && (
            <TouchableOpacity
              style={[styles.recipeChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
              onPress={() => item.recipeId && router.push(`/recipe/${item.recipeId}`)}
              accessibilityLabel={`View recipe: ${item.recipeName}`}
            >
              <Feather name="book-open" size={12} color={colors.primary} />
              <Text style={[styles.recipeChipText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{item.recipeName}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ══ Header ══ */}
      <View style={[styles.header, { paddingTop: topPadding + 4, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Social</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessibilityLabel="Open camera"
          >
            <Feather name="camera" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ══ Discovery segment tabs (full-width, no cutoff) ══ */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {DISCOVERY_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary, fontFamily: isActive ? "Inter_700Bold" : "Inter_500Medium" },
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ══ Cuisine filter bar ══ */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.cuisineFilterBtn,
            {
              backgroundColor: selectedCuisines.length > 0 ? colors.primary : colors.card,
              borderColor: selectedCuisines.length > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={openCuisineModal}
          accessibilityLabel={`Filter by cuisine: ${cuisineLabel}`}
        >
          <Feather name="sliders" size={14} color={selectedCuisines.length > 0 ? colors.primaryForeground : colors.foreground} />
          <Text style={[
            styles.cuisineFilterBtnText,
            {
              color: selectedCuisines.length > 0 ? colors.primaryForeground : colors.foreground,
              fontFamily: "Inter_600SemiBold",
            },
          ]}>
            {cuisineLabel}
          </Text>
          <Feather name="chevron-down" size={14} color={selectedCuisines.length > 0 ? colors.primaryForeground : colors.textSecondary} />
        </TouchableOpacity>

        {/* Active cuisine chips (scrollable) */}
        {selectedCuisines.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeCuisineChips}>
            {selectedCuisines.map((c) => {
              const meta = ALL_CUISINES.find((x) => x.id === c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.activeChip, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "50" }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCuisines((prev) => prev.filter((x) => x !== c));
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{meta?.emoji ?? "🍽"}</Text>
                  <Text style={[styles.activeChipText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{c}</Text>
                  <Feather name="x" size={11} color={colors.primary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ══ Feed ══ */}
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />

      {/* ══ Share toast ══ */}
      {shareToast && (
        <View style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.toastText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Copied to clipboard!</Text>
        </View>
      )}

      {/* ══ Cuisine picker modal ══ */}
      <Modal
        visible={cuisineModalOpen}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setCuisineModalOpen(false)}
      >
        <View style={[styles.cuisineModal, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          {/* Title row */}
          <View style={styles.cuisineModalHeader}>
            <Text style={[styles.cuisineModalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Filter by Cuisine
            </Text>
            <TouchableOpacity onPress={() => setCuisineModalOpen(false)} accessibilityLabel="Close">
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.cuisineModalSubtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Pick the cuisines you want to see in your feed
          </Text>

          {/* All option */}
          <TouchableOpacity
            style={[
              styles.cuisineAllRow,
              { backgroundColor: tempCuisines.length === 0 ? colors.primary + "18" : colors.card, borderColor: tempCuisines.length === 0 ? colors.primary : colors.border },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTempCuisines([]);
            }}
          >
            <Text style={{ fontSize: 20 }}>🌍</Text>
            <Text style={[styles.cuisineAllText, { color: tempCuisines.length === 0 ? colors.primary : colors.foreground, fontFamily: tempCuisines.length === 0 ? "Inter_700Bold" : "Inter_500Medium" }]}>
              All Cuisines
            </Text>
            {tempCuisines.length === 0 && (
              <View style={[styles.cuisineCheckmark, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Cuisine grid */}
          <ScrollView contentContainerStyle={styles.cuisineGrid} showsVerticalScrollIndicator={false}>
            {ALL_CUISINES.map((cuisine) => {
              const isSelected = tempCuisines.includes(cuisine.id);
              return (
                <TouchableOpacity
                  key={cuisine.id}
                  style={[
                    styles.cuisineGridItem,
                    {
                      backgroundColor: isSelected ? colors.primary + "18" : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleTempCuisine(cuisine.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={cuisine.id}
                >
                  <Text style={styles.cuisineGridEmoji}>{cuisine.emoji}</Text>
                  <Text style={[styles.cuisineGridLabel, { color: isSelected ? colors.primary : colors.foreground, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" }]}>
                    {cuisine.id}
                  </Text>
                  {isSelected && (
                    <View style={[styles.cuisineCheckmark, { backgroundColor: colors.primary, position: "absolute", top: 8, right: 8 }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Apply button */}
          <View style={[styles.cuisineModalFooter, { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
            {tempCuisines.length > 0 && (
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTempCuisines([]);
                }}
              >
                <Text style={[styles.clearBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={applyFilter}
            >
              <Text style={[styles.applyBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
                {tempCuisines.length === 0 ? "Show All" : `Show ${tempCuisines.length} Cuisine${tempCuisines.length > 1 ? "s" : ""}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ Comment modal ══ */}
      <Modal visible={!!commentModalPost} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setCommentModalPost(null)}>
        <View style={[styles.commentModal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <View style={styles.commentModalHeaderRow}>
            <Text style={[styles.commentModalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Comments</Text>
            <TouchableOpacity onPress={() => setCommentModalPost(null)} accessibilityLabel="Close comments">
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments[commentModalPost?.id || ""] || []}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.noComments}>
                <Text style={{ fontSize: 36 }}>💬</Text>
                <Text style={[styles.noCommentsText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>No comments yet. Be first!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.commentAvatarText, { fontFamily: "Inter_700Bold" }]}>{item.avatar}</Text>
                </View>
                <View style={[styles.commentBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.commentUser, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>@{item.user}</Text>
                  <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.text}</Text>
                  <Text style={[styles.commentTime, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>{item.timeAgo}</Text>
                </View>
              </View>
            )}
          />

          <View style={[styles.commentInputRow, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: insets.bottom + 8 }]}>
            <TextInput
              style={[styles.commentInputText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: newComment.trim() ? colors.primary : colors.muted }]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
              accessibilityLabel="Send comment"
            >
              <Feather name="send" size={16} color={newComment.trim() ? colors.primaryForeground : colors.textMuted} />
            </TouchableOpacity>
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
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  // ── Discovery tabs (full-width segment control) ──
  tabBar: {
    flexDirection: "row", height: 48, borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  tabText: { fontSize: 13 },

  // ── Cuisine filter bar ──
  filterBar: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 10, gap: 10, borderBottomWidth: 1, minHeight: 54,
    flexWrap: "wrap",
  },
  cuisineFilterBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1,
  },
  cuisineFilterBtnText: { fontSize: 13 },
  activeCuisineChips: { gap: 6, alignItems: "center" },
  activeChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1,
  },
  activeChipText: { fontSize: 12 },

  // ── Feed ──
  feedContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110, gap: 16 },

  // ── Post card ──
  postCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  postHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  userAvatarText: { color: "#fff", fontSize: 16 },
  username: { fontSize: 14 },
  timeAgo: { fontSize: 12, marginTop: 1 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5,
    minWidth: 72, alignItems: "center",
  },
  followBtnText: { fontSize: 13 },
  postImageWrap: { width: "100%", aspectRatio: 4 / 3 },

  // ── Actions below image ──
  actionsBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 4, borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionsLeft: { flexDirection: "row", alignItems: "center" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    minWidth: 44, minHeight: 44, paddingHorizontal: 8, justifyContent: "center",
  },
  actionLabel: { fontSize: 14 },

  // ── Caption ──
  captionContainer: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2, gap: 8 },
  caption: { fontSize: 14, lineHeight: 21 },
  recipeChip: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1,
  },
  recipeChipText: { fontSize: 12 },

  // ── Toast ──
  toast: {
    position: "absolute", bottom: 100, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: 100, borderWidth: 1,
  },
  toastText: { fontSize: 14 },

  // ── Cuisine modal ──
  cuisineModal: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  cuisineModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cuisineModalTitle: { fontSize: 22 },
  cuisineModalSubtitle: { fontSize: 14, marginBottom: 16 },
  cuisineAllRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16,
  },
  cuisineAllText: { flex: 1, fontSize: 16 },
  cuisineCheckmark: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  cuisineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 20 },
  cuisineGridItem: {
    width: "30%", aspectRatio: 1, borderRadius: 16, borderWidth: 1,
    alignItems: "center", justifyContent: "center", gap: 6, padding: 8,
  },
  cuisineGridEmoji: { fontSize: 30 },
  cuisineGridLabel: { fontSize: 11, textAlign: "center" },
  cuisineModalFooter: {
    flexDirection: "row", gap: 10, paddingTop: 14,
    borderTopWidth: 1, marginTop: 8,
  },
  clearBtn: {
    paddingHorizontal: 20, paddingVertical: 15, borderRadius: 14, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  clearBtnText: { fontSize: 15 },
  applyBtn: { paddingVertical: 15, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  applyBtnText: { fontSize: 15 },

  // ── Comment modal ──
  commentModal: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  commentModalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  commentModalTitle: { fontSize: 20 },
  commentRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  commentAvatarText: { color: "#fff", fontSize: 13 },
  commentBubble: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  commentUser: { fontSize: 13 },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentTime: { fontSize: 11 },
  noComments: { alignItems: "center", paddingVertical: 40, gap: 10 },
  noCommentsText: { fontSize: 15 },
  commentInputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    padding: 12, borderRadius: 16, borderWidth: 1, marginTop: 8,
  },
  commentInputText: { flex: 1, fontSize: 15, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
