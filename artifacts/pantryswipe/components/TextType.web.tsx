import React, { useState, useEffect, useRef } from "react";
import { Text, TextStyle, View } from "react-native";

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
  const [cursorVisible, setCursorVisible] = useState(true);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    const id = setInterval(
      () => setCursorVisible((v) => !v),
      cursorBlinkDuration * 1000
    );
    return () => clearInterval(id);
  }, [cursorBlinkDuration]);

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
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else {
        if (!isCompleteRef.current) {
          isCompleteRef.current = true;
          setIsComplete(true);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [currentCharIndex, displayedText, isDeleting, currentTextIndex]);

  const showCursorNow = showCursor && !isComplete && cursorVisible;

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && !isComplete && (
        <Text style={[style, { opacity: showCursorNow ? 1 : 0 }]}>
          {cursorCharacter}
        </Text>
      )}
    </View>
  );
}
