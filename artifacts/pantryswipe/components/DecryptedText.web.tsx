import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Text, TextStyle } from "react-native";

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  characters?: string;
  useOriginalCharsOnly?: boolean;
  animateOn?: "view" | "hover" | "click";
  style?: TextStyle;
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  characters = DEFAULT_CHARS,
  useOriginalCharsOnly = false,
  style,
}: DecryptedTextProps) {
  const availableChars = useMemo(
    () =>
      useOriginalCharsOnly
        ? Array.from(new Set(text.split(""))).filter((c) => c !== " ")
        : characters.split(""),
    [useOriginalCharsOnly, text, characters]
  );

  const scramble = useCallback(
    (original: string, revealed: Set<number>) =>
      original
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (revealed.has(i)) return original[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join(""),
    [availableChars]
  );

  const [displayText, setDisplayText] = useState(() => scramble(text, new Set()));
  const [revealedIndices, setRevealedIndices] = useState(new Set<number>());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setRevealedIndices(new Set());
    setDisplayText(scramble(text, new Set()));
    setIsAnimating(true);
  }, [text]);

  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    const getNextIndex = (revealed: Set<number>): number => {
      if (revealDirection === "start") return revealed.size;
      if (revealDirection === "end") return text.length - 1 - revealed.size;
      const middle = Math.floor(text.length / 2);
      const offset = Math.floor(revealed.size / 2);
      const idx =
        revealed.size % 2 === 0 ? middle + offset : middle - offset - 1;
      if (idx >= 0 && idx < text.length && !revealed.has(idx)) return idx;
      for (let i = 0; i < text.length; i++) if (!revealed.has(i)) return i;
      return 0;
    };

    const interval = setInterval(() => {
      setRevealedIndices((prev) => {
        if (sequential) {
          if (prev.size < text.length) {
            const next = new Set(prev);
            next.add(getNextIndex(prev));
            setDisplayText(scramble(text, next));
            return next;
          } else {
            clearInterval(interval);
            setIsAnimating(false);
            setDisplayText(text);
            return prev;
          }
        } else {
          setDisplayText(scramble(text, prev));
          currentIteration++;
          if (currentIteration >= maxIterations) {
            clearInterval(interval);
            setIsAnimating(false);
            setDisplayText(text);
          }
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, text, speed, maxIterations, sequential, scramble, revealDirection]);

  return <Text style={style}>{displayText}</Text>;
}
