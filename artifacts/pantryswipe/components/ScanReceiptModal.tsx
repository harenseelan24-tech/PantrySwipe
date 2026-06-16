import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Platform, ActivityIndicator,
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

type Phase = "preview" | "reading" | "error-unclear" | "error-offline" | "error-denied";

export default function ScanReceiptModal({ visible, onClose, onDone }: Props) {
  const colors = useColors();
  const { videoRef, isLoading, error, startStream, captureFrame, stopStream } = useCameraStream("environment");

  const [phase, setPhase] = useState<Phase>("preview");
  const [torchOn, setTorchOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = useCallback(() => {
    stopStream();
    setPhase("preview");
    setTorchOn(false);
    onClose();
  }, [stopStream, onClose]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;
    (async () => {
      const ok = await startStream();
      if (!ok) setPhase("error-denied");
    })();
    return () => stopStream();
  }, [visible]);

  const sendImage = useCallback(async (base64: string) => {
    setPhase("reading");

    if (!navigator.onLine) { setPhase("error-offline"); return; }

    const attemptScan = async (): Promise<DetectedItem[] | null> => {
      try {
        const res = await fetch(`${API_BASE}/vision/scan-receipt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { items?: DetectedItem[] };
        return data.items ?? [];
      } catch {
        return null;
      }
    };

    let items = await attemptScan();
    if (items === null) items = await attemptScan();
    if (items === null || items.length < 2) {
      setPhase("error-unclear");
      return;
    }

    stopStream();
    const enriched = items.map((item) => ({
      ...item,
      id: generateId(),
      emoji: CATEGORY_EMOJIS[item.category?.toLowerCase()] ?? "🍽️",
    }));
    onDone(enriched);
  }, [stopStream, onDone]);

  const handleShutter = useCallback(() => {
    const frame = captureFrame();
    if (!frame) return;
    sendImage(frame);
  }, [captureFrame, sendImage]);

  const handleGallery = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.replace(/^data:image\/[a-z]+;base64,/, "");
      sendImage(base64);
    };
    reader.readAsDataURL(file);
  }, [sendImage]);

  const toggleTorch = useCallback(async () => {
    try {
      const tracks = (videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null })
        ?.srcObject?.getVideoTracks?.();
      if (!tracks?.length) return;
      await tracks[0].applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn((v) => !v);
    } catch {
      // device doesn't support torch — ignore
    }
  }, [torchOn, videoRef]);

  const s = styles(colors);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <View style={s.root}>
        {Platform.OS === "web" ? (
          <>
            <video
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } as React.CSSProperties}
              autoPlay playsInline muted
            />

            {/* Receipt frame guide */}
            {phase === "preview" && (
              <>
                <View style={s.receiptFrame} pointerEvents="none">
                  {(["tl","tr","bl","br"] as const).map((c) => (
                    <View key={c} style={[s.corner, {
                      top: c[0] === "t" ? 0 : undefined, bottom: c[0] === "b" ? 0 : undefined,
                      left: c[1] === "l" ? 0 : undefined, right: c[1] === "r" ? 0 : undefined,
                      borderTopWidth: c[0] === "t" ? 3 : 0, borderBottomWidth: c[0] === "b" ? 3 : 0,
                      borderLeftWidth: c[1] === "l" ? 3 : 0, borderRightWidth: c[1] === "r" ? 3 : 0,
                    }]} />
                  ))}
                </View>
                <Text style={s.instruction}>Align receipt in the frame — tap shutter to capture</Text>
                <View style={s.bottomTray}>
                  <TouchableOpacity style={s.shutter} onPress={handleShutter}>
                    <View style={s.shutterInner} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleGallery}>
                    <Text style={s.galleryTxt}>Upload from gallery</Text>
                  </TouchableOpacity>
                </View>

                {/* Torch toggle */}
                <TouchableOpacity style={s.torchBtn} onPress={toggleTorch}>
                  <Feather name={torchOn ? "zap" : "zap-off"} size={22} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* Reading overlay */}
            {phase === "reading" && (
              <View style={s.overlay}>
                <Text style={{ fontSize: 48 }}>🧾</Text>
                <ActivityIndicator color="#fff" size="large" style={{ marginTop: 16 }} />
                <Text style={s.overlayTxt}>Reading your receipt...</Text>
              </View>
            )}

            {/* Error states */}
            {phase === "error-unclear" && (
              <View style={s.overlay}>
                <Text style={{ fontSize: 40 }}>📄</Text>
                <Text style={s.errorTitle}>Receipt unclear</Text>
                <Text style={s.errorBody}>
                  Try better lighting, flatten the receipt, or move closer.
                </Text>
                <TouchableOpacity style={[s.errorBtn, { backgroundColor: colors.primary }]} onPress={() => setPhase("preview")}>
                  <Text style={s.errorBtnTxt}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={s.galleryTxt}>Type manually instead</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === "error-offline" && (
              <View style={s.overlay}>
                <Text style={s.errorTitle}>📡 You're offline</Text>
                <Text style={s.errorBody}>Camera scanning needs an internet connection. Try manual entry instead.</Text>
                <TouchableOpacity style={[s.errorBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={s.errorBtnTxt}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === "error-denied" && (
              <View style={s.overlay}>
                <Text style={s.errorTitle}>📷 Camera access denied</Text>
                <Text style={s.errorBody}>
                  Go to your browser settings → Site Settings → Camera → Allow for this site.
                </Text>
                <TouchableOpacity style={[s.errorBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={s.errorBtnTxt}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoading && phase === "preview" && (
              <View style={s.overlay}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={s.overlayTxt}>Starting camera...</Text>
              </View>
            )}

            {/* Hidden file input for gallery */}
            {typeof document !== "undefined" && (
              <input
                ref={fileInputRef as React.RefObject<HTMLInputElement>}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            )}
          </>
        ) : (
          <View style={s.nativeFallback}>
            <Text style={{ fontSize: 48 }}>🧾</Text>
            <Text style={s.errorTitle}>Real-time receipt scanning is available on the web version.</Text>
            <Text style={s.errorBody}>On a physical device, use the app's built-in camera scan instead.</Text>
            <TouchableOpacity style={[s.errorBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
              <Text style={s.errorBtnTxt}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

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
    receiptFrame: {
      position: "absolute", top: "12%", left: "8%", right: "8%", height: "60%", borderRadius: 4,
    },
    corner: { position: "absolute", width: 28, height: 28, borderColor: "#fff" },
    instruction: {
      position: "absolute", top: "8%", left: 0, right: 0,
      color: "#fff", textAlign: "center", fontSize: 14, fontWeight: "600",
      textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    },
    bottomTray: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      backgroundColor: "rgba(0,0,0,0.7)", padding: 28, paddingBottom: 52,
      alignItems: "center", gap: 16,
    },
    shutter: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
      borderWidth: 4, borderColor: "rgba(255,255,255,0.5)",
    },
    shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E84040" },
    galleryTxt: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center" },
    torchBtn: {
      position: "absolute", top: 52, right: 20,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
    },
    overlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.88)",
      alignItems: "center", justifyContent: "center", gap: 12, padding: 40,
    },
    overlayTxt: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 8 },
    errorTitle: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center" },
    errorBody: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center", lineHeight: 20 },
    errorBtn: { marginTop: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    errorBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
    closeBtn: {
      position: "absolute", top: 52, left: 20,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
    },
    nativeFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  });
}
