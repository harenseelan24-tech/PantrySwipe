import React, { useState, useEffect, useRef } from "react";
import { Animated, Text, TextStyle, View } from "react-native";

interface TextTypeProps {
  text: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkDuration?: number;
  initialDelay?: number;
  style?: TextStyle;
}

export function TextType({
  text,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  loop = true,
  showCursor = true,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.5,
  initialDelay = 0,
  style,
}: TextTypeProps) {
  const textArray = Array.isArray(text) ? text : [text];
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const isCompleteRef = useRef(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const blinkRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: cursorBlinkDuration * 1000,
          useNativeDriver: false,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: cursorBlinkDuration * 1000,
          useNativeDriver: false,
        }),
      ])
    );
    blinkRef.current = blink;
    blink.start();
    return () => blink.stop();
  }, []);

  useEffect(() => {
    if (isComplete) {
      blinkRef.current?.stop();
      cursorOpacity.setValue(0);
    }
  }, [isComplete]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const currentText = textArray[currentTextIndex];

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        if (currentTextIndex === textArray.length - 1 && !loop) return;
        setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
        setCurrentCharIndex(0);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (currentCharIndex < currentText.length) {
        const delay =
          currentCharIndex === 0 && displayedText === "" ? initialDelay : typingSpeed;
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + currentText[currentCharIndex]);
          setCurrentCharIndex((prev) => prev + 1);
        }, delay);
      } else if (
        (textArray.length > 1 || loop) &&
        !(currentTextIndex === textArray.length - 1 && !loop)
      ) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        // Typing finished — hide cursor
        if (!isCompleteRef.current) {
          isCompleteRef.current = true;
          setIsComplete(true);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [currentCharIndex, displayedText, isDeleting, currentTextIndex]);

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && (
        <Animated.Text style={[style, { opacity: cursorOpacity }]}>
          {cursorCharacter}
        </Animated.Text>
      )}
    </View>
  );
}
