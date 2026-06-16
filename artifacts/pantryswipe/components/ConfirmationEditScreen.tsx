import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, TextInput, Animated, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { DetectedItem, ScanSource } from "@/types/scanning";
import { SCAN_UNITS, SCAN_CATEGORIES, SCAN_LOCATIONS, CATEGORY_EMOJIS } from "@/types/scanning";

interface Props {
  visible: boolean;
  items: DetectedItem[];
  source: ScanSource;
  onClose: () => void;
  onSuccess: () => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

const PANTRY_CATEGORY_MAP: Record<string, "Fridge" | "Freezer" | "Pantry" | "Spices" | "Sauces" | "Beverages" | "Produce"> = {
  dairy: "Fridge", produce: "Produce", meat: "Fridge", seafood: "Fridge",
  frozen: "Freezer", grains: "Pantry", condiments: "Pantry", sauces: "Sauces",
  spices: "Spices", drinks: "Beverages", snacks: "Pantry", baking: "Pantry", other: "Pantry",
};

export default function ConfirmationEditScreen({ visible, items, source, onClose, onSuccess }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToPantry } = useApp();
  const [editableItems, setEditableItems] = useState<DetectedItem[]>([]);
  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const nameInputRefs = useRef<Record<string, TextInput | null>>({});

  // Reset when opened
  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    prevVisible.current = true;
    setEditableItems(items.map((item) => ({ ...item, id: item.id || generateId() })));
    setInvalidIds(new Set());
    setShowSuccess(false);
  }
  if (!visible && prevVisible.current) {
    prevVisible.current = false;
  }

  const updateItem = useCallback((id: string, changes: Partial<DetectedItem>) => {
    setEditableItems((prev) => prev.map((item) => item.id === id ? { ...item, ...changes } : item));
    if (changes.name !== undefined) {
      setInvalidIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setEditableItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addBlankItem = useCallback(() => {
    const id = generateId();
    const blank: DetectedItem = { id, name: "", quantity: 1, unit: "pieces", category: "other", location: "pantry", emoji: "📦" };
    setEditableItems((prev) => [...prev, blank]);
    setTimeout(() => nameInputRefs.current[id]?.focus(), 100);
  }, []);

  const handleConfirm = useCallback(() => {
    const invalid = new Set<string>();
    editableItems.forEach((item) => { if (!item.name.trim()) invalid.add(item.id); });
    if (invalid.size > 0) { setInvalidIds(invalid); return; }

    editableItems.forEach((item) => {
      const pantryCategory = PANTRY_CATEGORY_MAP[item.category?.toLowerCase()] ?? "Pantry";
      addToPantry({
        id: generateId(),
        name: item.name.trim(),
        quantity: item.quantity,
        unit: item.unit,
        category: pantryCategory,
        status: "Fresh",
        emoji: item.emoji || CATEGORY_EMOJIS[item.category?.toLowerCase()] || "🍽️",
      });
    });

    setShowSuccess(true);
    successAnim.setValue(0);
    Animated.timing(successAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    setTimeout(() => {
      setShowSuccess(false);
      onSuccess();
    }, 1400);
  }, [editableItems, addToPantry, onSuccess, successAnim]);

  const s = styles(colors);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[s.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={s.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: colors.text }]}>Review Items</Text>
            <Text style={[s.subtitle, { color: colors.textMuted }]}>
              {editableItems.length} item{editableItems.length !== 1 ? "s" : ""} detected · Edit before adding
            </Text>
          </View>
        </View>

        {/* Item list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {editableItems.map((item) => (
            <View key={item.id} style={s.card}>
              {/* Row 1: emoji + name + delete */}
              <View style={s.cardRow1}>
                <View style={s.emojiBox}>
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                </View>
                <TextInput
                  ref={(r) => { nameInputRefs.current[item.id] = r; }}
                  style={[s.nameInput, { color: colors.text }, invalidIds.has(item.id) && s.nameInputError]}
                  value={item.name}
                  onChangeText={(t) => updateItem(item.id, { name: t })}
                  placeholder="Item name"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => removeItem(item.id)} style={s.trashBtn}>
                  <Feather name="trash-2" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Row 2: qty stepper + unit + category */}
              <View style={s.cardRow2}>
                {/* Qty stepper */}
                <View style={[s.stepper, { borderColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => updateItem(item.id, { quantity: Math.max(0.1, item.quantity - 1) })}
                    style={s.stepBtn}
                  >
                    <Text style={[s.stepBtnTxt, { color: colors.primary }]}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[s.qtyInput, { color: colors.text }]}
                    value={String(item.quantity)}
                    keyboardType="decimal-pad"
                    onChangeText={(t) => {
                      const n = parseFloat(t);
                      if (!isNaN(n) && n > 0) updateItem(item.id, { quantity: n });
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                    style={s.stepBtn}
                  >
                    <Text style={[s.stepBtnTxt, { color: colors.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Unit picker */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                  {SCAN_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[s.chip, { borderColor: item.unit === u ? colors.primary : colors.border, backgroundColor: item.unit === u ? colors.primary + "22" : "transparent" }]}
                      onPress={() => updateItem(item.id, { unit: u })}
                    >
                      <Text style={[s.chipTxt, { color: item.unit === u ? colors.primary : colors.textMuted }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Row 3: category */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {SCAN_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[s.chip, { borderColor: item.category === cat.key ? colors.primary : colors.border, backgroundColor: item.category === cat.key ? colors.primary + "22" : "transparent" }]}
                    onPress={() => updateItem(item.id, {
                      category: cat.key,
                      emoji: cat.emoji,
                    })}
                  >
                    <Text style={[s.chipTxt, { color: item.category === cat.key ? colors.primary : colors.textMuted }]}>
                      {cat.emoji} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Row 4: location pills */}
              <View style={[s.locationRow, { marginTop: 8 }]}>
                {SCAN_LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc.key}
                    style={[s.locPill, {
                      backgroundColor: item.location === loc.key ? colors.primary : "transparent",
                      borderColor: item.location === loc.key ? colors.primary : colors.border,
                    }]}
                    onPress={() => updateItem(item.id, { location: loc.key })}
                  >
                    <Text style={[s.locPillTxt, { color: item.location === loc.key ? "#fff" : colors.textMuted }]}>
                      {loc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Receipt price if available */}
              {source === "receipt-scan" && item.estimatedPrice != null && (
                <Text style={[s.priceHint, { color: colors.textMuted }]}>~${item.estimatedPrice.toFixed(2)}</Text>
              )}
            </View>
          ))}

          {/* Add missed item */}
          <TouchableOpacity style={[s.addMissedBtn, { borderColor: colors.border }]} onPress={addBlankItem}>
            <Text style={[s.addMissedTxt, { color: colors.primary }]}>＋ Add an item we missed</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={[s.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
          <Text style={[s.footerCount, { color: colors.textMuted }]}>{editableItems.length} item{editableItems.length !== 1 ? "s" : ""} ready to add</Text>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: editableItems.length === 0 ? colors.border : colors.primary }]}
            onPress={handleConfirm}
            disabled={editableItems.length === 0}
          >
            <Text style={s.addBtnTxt}>Add to Pantry →</Text>
          </TouchableOpacity>
        </View>

        {/* Success overlay */}
        {showSuccess && (
          <Animated.View style={[s.successOverlay, { opacity: successAnim }]}>
            <Animated.Text style={[s.successEmoji, {
              transform: [{ scale: successAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) }],
            }]}>✅</Animated.Text>
            <Text style={s.successTxt}>{editableItems.length} item{editableItems.length !== 1 ? "s" : ""} added to your pantry!</Text>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

function styles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row", alignItems: "flex-start",
      paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 8,
    },
    backBtn: { paddingTop: 2, paddingRight: 4 },
    title: { fontSize: 22, fontWeight: "700" },
    subtitle: { fontSize: 13, marginTop: 2 },
    card: {
      backgroundColor: "#F0F6FF", borderWidth: 1, borderColor: "#E2EAFF",
      borderRadius: 16, padding: 14, marginBottom: 10,
    },
    cardRow1: { flexDirection: "row", alignItems: "center", gap: 10 },
    emojiBox: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    },
    nameInput: { flex: 1, fontSize: 16, fontWeight: "600", paddingVertical: 4 },
    nameInputError: { borderBottomWidth: 2, borderBottomColor: "#E84040" },
    trashBtn: { padding: 4 },
    cardRow2: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
    stepper: {
      flexDirection: "row", alignItems: "center",
      borderWidth: 1, borderRadius: 10, overflow: "hidden",
    },
    stepBtn: { width: 32, height: 36, alignItems: "center", justifyContent: "center" },
    stepBtnTxt: { fontSize: 20, fontWeight: "600" },
    qtyInput: { width: 44, textAlign: "center", fontSize: 15, fontWeight: "600", paddingVertical: 4 },
    chipScroll: { flex: 1 },
    chip: {
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1,
      marginRight: 6, alignSelf: "flex-start",
    },
    chipTxt: { fontSize: 12, fontWeight: "500" },
    locationRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    locPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    locPillTxt: { fontSize: 12, fontWeight: "600" },
    priceHint: { fontSize: 12, marginTop: 6 },
    addMissedBtn: {
      borderWidth: 1.5, borderStyle: "dashed", borderRadius: 14,
      paddingVertical: 14, alignItems: "center", marginTop: 4,
    },
    addMissedTxt: { fontSize: 15, fontWeight: "600" },
    footer: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      backgroundColor: "#fff", borderTopWidth: 1, padding: 16,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    footerCount: { flex: 1, fontSize: 13 },
    addBtn: { height: 52, paddingHorizontal: 24, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    addBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
    successOverlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(255,255,255,0.97)",
      alignItems: "center", justifyContent: "center", gap: 16,
    },
    successEmoji: { fontSize: 72 },
    successTxt: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", textAlign: "center" },
  });
}
