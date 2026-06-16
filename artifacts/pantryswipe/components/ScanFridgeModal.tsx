import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Platform, ScrollView, Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useCameraStream } from "@/hooks/useCameraStream";
import type { DetectedItem } from "@/types/scanning";
import { CATEGORY_EMOJIS } from "@/types/scanning";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDone: (items: DetectedItem[]) => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export default function ScanFridgeModal({ visible, onClose, onDone }: Props) {
  const colors = useColors();
  const { videoRef, isLoading, error, startStream, captureFrame, stopStream } = useCameraStream("environment");

  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [noItemsCount, setNoItemsCount] = useState(0);
  const [slowWarning, setSlowWarning] = useState(false);
  const [offlineError, setOfflineError] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pillAnims = useRef<Record<string, Animated.Value>>({});

  const stopScanning = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const handleClose = useCallback(() => {
    stopScanning();
    stopStream();
    setDetectedItems([]);
    setPermDenied(false);
    setOfflineError(false);
    setSlowWarning(false);
    onClose();
  }, [stopScanning, stopStream, onClose]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;
    (async () => {
      const ok = await startStream();
      if (!ok) setPermDenied(true);
    })();
    return () => { stopScanning(); stopStream(); };
  }, [visible]);

  useEffect(() => {
    if (!visible || !scanning || Platform.OS !== "web") return;

    intervalRef.current = setInterval(async () => {
      if (!navigator.onLine) { setOfflineError(true); stopScanning(); return; }

      const frame = captureFrame();
      if (!frame) return;

      const slowTimer = setTimeout(() => setSlowWarning(true), 10000);

      try {
        const res = await fetch(`${API_BASE}/vision/scan-pantry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: frame }),
          signal: AbortSignal.timeout(12000),
        });
        clearTimeout(slowTimer);
        setSlowWarning(false);

        if (!res.ok) return;
        const data = (await res.json()) as { items?: DetectedItem[] };
        const newItems = data.items ?? [];

        if (newItems.length === 0) {
          setNoItemsCount((c) => c + 1);
        } else {
          setNoItemsCount(0);
          setDetectedItems((prev) => {
            let updated = [...prev];
            for (const ni of newItems) {
              const existing = updated.find((e) => e.name.toLowerCase() === ni.name.toLowerCase());
              if (existing) {
                updated = updated.map((e) =>
                  e.name.toLowerCase() === ni.name.toLowerCase()
                    ? { ...e, quantity: e.quantity + ni.quantity }
                    : e
                );
              } else {
                const id = generateId();
                pillAnims.current[id] = new Animated.Value(30);
                Animated.spring(pillAnims.current[id], { toValue: 0, useNativeDriver: true, tension: 80 }).start();
                updated.push({ ...ni, id, emoji: CATEGORY_EMOJIS[ni.category?.toLowerCase()] ?? "🍽️" });
              }
            }
            return updated;
          });
        }
      } catch {
        clearTimeout(slowTimer);
      }
    }, 2500);

    return () => stopScanning();
  }, [visible, scanning]);

  const handleDone = useCallback(() => {
    stopScanning();
    stopStream();
    onDone(detectedItems);
  }, [detectedItems, stopScanning, stopStream, onDone]);

  const s = styles(colors);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <View style={s.root}>
        {Platform.OS === "web" ? (
          <>
            {/* Live video */}
            <video
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } as React.CSSProperties}
              autoPlay
              playsInline
              muted
            />

            {/* Scan frame guide */}
            <View style={s.frameGuide} pointerEvents="none">
              <Animated.View style={s.scanLine} />
            </View>

            {/* Overlay instruction */}
            <Text style={s.instruction}>Point at food items — hold steady</Text>

            {/* State overlays */}
            {permDenied && (
              <View style={s.stateCard}>
                <Text style={s.stateTitle}>📷 Camera access denied</Text>
                <Text style={s.stateBody}>
                  Go to your browser settings → Site Settings → Camera → Allow for this site.
                </Text>
                <TouchableOpacity style={[s.stateBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={s.stateBtnTxt}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {offlineError && (
              <View style={s.stateCard}>
                <Text style={s.stateTitle}>📡 You're offline</Text>
                <Text style={s.stateBody}>Camera scanning needs an internet connection. Try manual entry instead.</Text>
                <TouchableOpacity style={[s.stateBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={s.stateBtnTxt}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoading && !permDenied && (
              <View style={s.stateCard}>
                <Text style={s.stateTitle}>📷 Starting camera...</Text>
              </View>
            )}

            {/* Bottom tray */}
            {!permDenied && !offlineError && !isLoading && (
              <View style={s.bottomTray}>
                {slowWarning && (
                  <Text style={s.slowTxt}>⏳ Taking longer than usual...</Text>
                )}
                {noItemsCount >= 3 && detectedItems.length === 0 && (
                  <Text style={s.slowTxt}>🔍 Nothing detected yet — move closer and ensure good lighting</Text>
                )}
                <ScrollView style={s.pillScroll} showsVerticalScrollIndicator={false}>
                  {detectedItems.map((item) => (
                    <Animated.View
                      key={item.id}
                      style={[s.pill, { transform: [{ translateY: pillAnims.current[item.id] ?? new Animated.Value(0) }] }]}
                    >
                      <Text style={s.pillTxt}>{item.emoji} {item.name} · {item.quantity} {item.unit}</Text>
                    </Animated.View>
                  ))}
                </ScrollView>

                {!scanning ? (
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary }]} onPress={() => setScanning(true)}>
                    <Text style={s.actionBtnTxt}>▶ Start Scanning</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: detectedItems.length > 0 ? colors.primary : colors.border }]}
                    onPress={handleDone}
                    disabled={detectedItems.length === 0}
                  >
                    <Text style={s.actionBtnTxt}>Done → {detectedItems.length} item{detectedItems.length !== 1 ? "s" : ""}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          /* Native fallback — tells user to use web or use existing expo-camera flow */
          <View style={s.nativeFallback}>
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={s.stateTitle}>Real-time AI scanning is available on the web version.</Text>
            <Text style={s.stateBody}>On a physical device, use the app's built-in camera scan instead.</Text>
            <TouchableOpacity style={[s.stateBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
              <Text style={s.stateBtnTxt}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function styles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: "#000" },
    frameGuide: {
      position: "absolute", top: "15%", left: "10%", right: "10%", height: "55%",
      borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", borderRadius: 16, overflow: "hidden",
    },
    scanLine: { width: "100%", height: 3, backgroundColor: "rgba(91,142,245,0.6)", marginTop: 0 },
    instruction: {
      position: "absolute", top: "11%", left: 0, right: 0,
      color: "#fff", textAlign: "center", fontSize: 14, fontWeight: "600",
      textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    },
    bottomTray: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      backgroundColor: "rgba(0,0,0,0.75)", padding: 20, paddingBottom: 48, gap: 10, maxHeight: "45%",
    },
    pillScroll: { maxHeight: 140 },
    pill: {
      backgroundColor: "rgba(91,142,245,0.85)", borderRadius: 20,
      paddingHorizontal: 14, paddingVertical: 6, alignSelf: "flex-start", marginBottom: 6,
    },
    pillTxt: { color: "#fff", fontSize: 13, fontWeight: "600" },
    actionBtn: { paddingVertical: 15, borderRadius: 14, alignItems: "center" },
    actionBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
    slowTxt: { color: "#FFD580", fontSize: 12, textAlign: "center" },
    stateCard: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      alignItems: "center", justifyContent: "center",
      padding: 40, backgroundColor: "rgba(0,0,0,0.85)", gap: 12,
    },
    stateTitle: { color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },
    stateBody: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center", lineHeight: 20 },
    stateBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
    stateBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
    closeBtn: {
      position: "absolute", top: 52, left: 20,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
    },
    nativeFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  });
}
