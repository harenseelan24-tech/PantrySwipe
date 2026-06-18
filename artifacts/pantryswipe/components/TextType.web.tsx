import React, { useState, useEffect, useRef } from "react";

let cursorStyleInjected = false;
function injectCursorStyle() {
  if (cursorStyleInjected || typeof document === "undefined") return;
  cursorStyleInjected = true;
  const el = document.createElement("style");
  el.textContent = `
    @keyframes textTypeCursorBlink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `;
  document.head.appendChild(el);
}

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
  style?: object;
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
  useEffect(() => {
    injectCursorStyle();
  }, []);

  const textArray = Array.isArray(text) ? text : [text];
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const isCompleteRef = useRef(false);

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

  const css = style as React.CSSProperties;
  const cursorVisible = showCursor && !isComplete;

  return (
    <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "baseline" }}>
      <span style={css}>{displayedText}</span>
      {cursorVisible && (
        <span
          style={{
            ...css,
            animation: `textTypeCursorBlink ${cursorBlinkDuration * 2}s ease-in-out infinite`,
          }}
        >
          {cursorCharacter}
        </span>
      )}
    </div>
  );
}
