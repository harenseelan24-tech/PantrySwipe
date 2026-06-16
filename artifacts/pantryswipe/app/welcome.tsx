import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile, completeSetup } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [googleSheetVisible, setGoogleSheetVisible] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleStep, setGoogleStep] = useState<"email" | "name">("email");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleGoogleEmailNext = () => {
    if (!googleEmail.trim() || !googleEmail.includes("@")) return;
    // Pre-fill name from email
    const namePart = googleEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setGoogleName(namePart);
    setGoogleStep("name");
  };

  const handleGoogleSignIn = () => {
    setSigningIn(true);
    const displayName = googleName.trim() || googleEmail.split("@")[0] || "User";
    setTimeout(() => {
      updateProfile({ name: displayName });
      completeSetup();
      setSigningIn(false);
      setGoogleSheetVisible(false);
      router.replace("/(tabs)");
    }, 900);
  };

  const resetGoogleSheet = () => {
    setGoogleSheetVisible(false);
    setGoogleStep("email");
    setGoogleEmail("");
    setGoogleName("");
    setSigningIn(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background image */}
      <View style={StyleSheet.absoluteFill}>
        {(() => {
          try {
            return (
              <Image
                source={require("@/assets/images/hero-food.png")}
                style={styles.bgImage}
                resizeMode="cover"
              />
            );
          } catch {
            return <View style={[styles.bgFallback, { backgroundColor: "#1a0d00" }]} />;
          }
        })()}
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: topPadding + 40,
            paddingBottom: bottomPadding + 24,
          },
        ]}
      >
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: colors.saffron }]}>
            <Text style={styles.logoEmoji}>🍳</Text>
          </View>
          <Text style={styles.appName}>PantrySwipe</Text>
          <Text style={styles.tagline}>Cook what you already have.</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.saffron }]}
            onPress={() => router.push("/onboarding")}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          {/* Google Sign-In button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => { setGoogleSheetVisible(true); setGoogleStep("email"); }}
            activeOpacity={0.88}
          >
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </Animated.View>

      {/* Google Sign-In Modal */}
      <Modal
        visible={googleSheetVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={resetGoogleSheet}
      >
        <View style={[styles.googleModal, { backgroundColor: "#fff" }]}>
          <View style={styles.modalHandle} />

          {/* Google branding */}
          <View style={styles.googleModalHeader}>
            <View style={styles.googleLogoRow}>
              <Text style={styles.googleLogo}>G</Text>
            </View>
            <Text style={styles.googleModalTitle}>Sign in with Google</Text>
            <Text style={styles.googleModalSub}>
              {googleStep === "email"
                ? "Enter your Google email to continue"
                : "Confirm your name to finish signing in"}
            </Text>
          </View>

          {googleStep === "email" ? (
            <View style={styles.googleInputSection}>
              <Text style={styles.googleInputLabel}>Email address</Text>
              <TextInput
                style={[styles.googleInput, { borderColor: "#DADCE0" }]}
                placeholder="you@gmail.com"
                placeholderTextColor="#9AA0A6"
                value={googleEmail}
                onChangeText={setGoogleEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.googleNextBtn, { backgroundColor: googleEmail.includes("@") ? "#1A73E8" : "#E8EAED" }]}
                onPress={handleGoogleEmailNext}
                disabled={!googleEmail.trim() || !googleEmail.includes("@")}
              >
                <Text style={[styles.googleNextBtnText, { color: googleEmail.includes("@") ? "#fff" : "#80868B" }]}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.googleInputSection}>
              <View style={[styles.googleEmailConfirm, { backgroundColor: "#F1F3F4", borderColor: "#DADCE0" }]}>
                <Feather name="mail" size={16} color="#5F6368" />
                <Text style={styles.googleEmailConfirmText}>{googleEmail}</Text>
              </View>
              <Text style={[styles.googleInputLabel, { marginTop: 16 }]}>Your name</Text>
              <TextInput
                style={[styles.googleInput, { borderColor: "#DADCE0" }]}
                placeholder="Your name"
                placeholderTextColor="#9AA0A6"
                value={googleName}
                onChangeText={setGoogleName}
                autoCapitalize="words"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.googleNextBtn, { backgroundColor: signingIn ? "#E8EAED" : "#1A73E8" }]}
                onPress={handleGoogleSignIn}
                disabled={signingIn || !googleName.trim()}
              >
                <Text style={[styles.googleNextBtnText, { color: signingIn ? "#80868B" : "#fff" }]}>
                  {signingIn ? "Signing in…" : "Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.googleCancelBtn} onPress={resetGoogleSheet}>
            <Text style={styles.googleCancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.googleDisclaimer}>
            PantrySwipe uses your name from Google to personalize your experience. Your email is not stored on our servers.
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141210",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bgFallback: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: "center",
    gap: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.80)",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 26,
  },
  ctaContainer: {
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  googleButton: {
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 17,
    fontWeight: "800",
    color: "#4285F4",
    lineHeight: 22,
  },
  googleButtonText: {
    color: "#3C4043",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  legalText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 16,
  },

  // Google Modal
  googleModal: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    marginBottom: 24,
  },
  googleModalHeader: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  googleLogoRow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  googleLogo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4285F4",
  },
  googleModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#202124",
    letterSpacing: -0.3,
  },
  googleModalSub: {
    fontSize: 14,
    color: "#5F6368",
    textAlign: "center",
    lineHeight: 20,
  },
  googleInputSection: {
    width: "100%",
    gap: 0,
  },
  googleInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3C4043",
    marginBottom: 8,
  },
  googleInput: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#202124",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  googleEmailConfirm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  googleEmailConfirmText: {
    fontSize: 14,
    color: "#5F6368",
    fontWeight: "500",
  },
  googleNextBtn: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  googleNextBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  googleCancelBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  googleCancelText: {
    fontSize: 15,
    color: "#5F6368",
    fontWeight: "500",
  },
  googleDisclaimer: {
    position: "absolute",
    bottom: 32,
    fontSize: 11,
    color: "#9AA0A6",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 24,
  },
});
