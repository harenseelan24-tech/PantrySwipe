import React, { useState, useRef } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "What can I make tonight?",
  "I have 10 minutes",
  "High protein dinner",
  "Use expiring ingredients",
  "Something impressive",
];

const INITIAL_MESSAGE: Message = {
  id: "0",
  role: "assistant",
  content: "Hi! I'm your AI Chef. I know what's in your pantry and can suggest personalized recipes, modify dishes for your diet, or help you plan your next meal. What can I help you cook?",
  timestamp: new Date(),
};

export default function AIChefScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, pantryItems } = useApp();
  const conversationRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const API_BASE = Platform.OS !== "web"
    ? `https://${process.env.EXPO_PUBLIC_API_DOMAIN ?? "zip-repl-cactusussy24.replit.app"}/api`
    : "/api";
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = async (text: string = input.trim()) => {
    if (!text || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    // Keep last 10 messages as conversation history for context
    const history = conversationRef.current.slice(-10);

    try {
      const res = await fetch(`${API_BASE}/recipes/ai-chef`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_history: history,
          pantry_items: pantryItems.map((i) => i.name),
          user_profile: {
            dietType: userProfile.dietType,
            allergies: userProfile.allergies,
            skillLevel: userProfile.skillLevel,
            cuisinePreferences: userProfile.cuisinePreferences,
            goal: userProfile.goal,
            name: userProfile.name,
          },
        }),
      });
      // (timeout handled by AbortController below if needed)

      const data = await res.json().catch(() => ({ response: null }));
      const aiText = data.response as string | null;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiText ?? "I'm having a moment — please try again!",
        timestamp: new Date(),
      };

      setMessages((prev) => [aiMsg, ...prev]);

      // Update conversation history ref
      conversationRef.current = [
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: aiMsg.content },
      ];
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Looks like I lost my connection. Check your network and try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [errMsg, ...prev]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={[styles.container, { backgroundColor: "#141210" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color="#F0EDE8" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.chefAvatar, { backgroundColor: colors.saffron }]}>
            <Text style={styles.chefAvatarEmoji}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Chef</Text>
            <Text style={styles.headerSub}>Knows your pantry · Always ready</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Pantry context banner */}
      <View style={[styles.contextBanner, { backgroundColor: colors.saffron + "15" }]}>
        <Feather name="box" size={14} color={colors.saffron} />
        <Text style={[styles.contextText, { color: colors.saffron }]}>
          {pantryItems.length} pantry items loaded · {userProfile.dietType[0]} diet
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.typingIndicator, { backgroundColor: "#1E1B18" }]}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user"
                  ? [styles.userBubble, { backgroundColor: colors.saffron }]
                  : [styles.aiBubble, { backgroundColor: "#1E1B18" }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: item.role === "user" ? "#fff" : "#F0EDE8" },
                ]}
              >
                {item.content}
              </Text>
              <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
            </View>
          )}
        />

        {/* Quick prompts - only show when no user messages */}
        {messages.length === 1 && (
          <View style={styles.quickPrompts}>
            <ScrollRowChips
              prompts={QUICK_PROMPTS}
              onSelect={sendMessage}
              colors={colors}
            />
          </View>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: bottomPadding + 8, backgroundColor: "#141210" }]}>
          <View style={[styles.inputRow, { backgroundColor: "#1E1B18" }]}>
            <TextInput
              style={[styles.textInput, { color: "#F0EDE8" }]}
              placeholder="Ask about recipes, ingredients..."
              placeholderTextColor="#9E9E9E"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() ? colors.saffron : "#2A2724" },
              ]}
              onPress={() => sendMessage()}
              disabled={!input.trim()}
            >
              <Feather name="send" size={18} color={input.trim() ? "#fff" : "#666"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ScrollRowChips({
  prompts,
  onSelect,
  colors,
}: {
  prompts: string[];
  onSelect: (p: string) => void;
  colors: any;
}) {
  return (
    <View style={chipStyles.container}>
      {prompts.map((p) => (
        <TouchableOpacity
          key={p}
          style={[chipStyles.chip, { backgroundColor: "#1E1B18", borderColor: "#2A2724" }]}
          onPress={() => onSelect(p)}
        >
          <Text style={chipStyles.chipText}>{p}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: { color: "#F0EDE8", fontSize: 13, fontWeight: "500" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 12 },
  chefAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chefAvatarEmoji: { fontSize: 22 },
  headerTitle: { color: "#F0EDE8", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#9E9E9E", fontSize: 12 },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  contextText: { fontSize: 13, fontWeight: "500" },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  messageBubble: {
    maxWidth: "82%",
    padding: 14,
    borderRadius: 18,
    gap: 6,
  },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 11, color: "rgba(255,255,255,0.4)", alignSelf: "flex-end" },
  typingIndicator: {
    alignSelf: "flex-start",
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginBottom: 8,
  },
  typingDots: { color: "#9E9E9E", fontSize: 18, letterSpacing: 4 },
  quickPrompts: { paddingTop: 4 },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2724",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 8, lineHeight: 22 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
