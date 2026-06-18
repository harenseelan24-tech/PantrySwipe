import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

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
  className?: string;
  encryptedClassName?: string;
  style?: object;
  encryptedStyle?: object;
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  characters = DEFAULT_CHARS,
  useOriginalCharsOnly = false,
  animateOn = "hover",
  className = "",
  encryptedClassName = "",
  style,
  encryptedStyle,
}: DecryptedTextProps) {
  const containerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

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

  const [displayText, setDisplayText] = useState(() =>
    animateOn === "hover" ? text : scramble(text, new Set())
  );
  const [revealedIndices, setRevealedIndices] = useState(new Set<number>());
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(animateOn === "hover");
  const hasAnimatedRef = useRef(false);

  const getNextIndex = useCallback(
    (revealed: Set<number>): number => {
      if (revealDirection === "start") return revealed.size;
      if (revealDirection === "end") return text.length - 1 - revealed.size;
      const middle = Math.floor(text.length / 2);
      const offset = Math.floor(revealed.size / 2);
      const idx =
        revealed.size % 2 === 0 ? middle + offset : middle - offset - 1;
      if (idx >= 0 && idx < text.length && !revealed.has(idx)) return idx;
      for (let i = 0; i < text.length; i++) if (!revealed.has(i)) return i;
      return 0;
    },
    [revealDirection, text.length]
  );

  const triggerDecrypt = useCallback(() => {
    clearInterval(intervalRef.current);
    setRevealedIndices(new Set());
    setDisplayText(scramble(text, new Set()));
    setIsDone(false);
    setIsAnimating(true);
  }, [text, scramble]);

  useEffect(() => {
    if (animateOn !== "view") return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            triggerDecrypt();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateOn, triggerDecrypt]);

  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prev) => {
        if (sequential) {
          if (prev.size < text.length) {
            const next = new Set(prev);
            next.add(getNextIndex(prev));
            setDisplayText(scramble(text, next));
            return next;
          } else {
            clearInterval(intervalRef.current);
            setIsAnimating(false);
            setIsDone(true);
            setDisplayText(text);
            return prev;
          }
        } else {
          setDisplayText(scramble(text, prev));
          currentIteration++;
          if (currentIteration >= maxIterations) {
            clearInterval(intervalRef.current);
            setIsAnimating(false);
            setIsDone(true);
            setDisplayText(text);
          }
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    scramble,
    getNextIndex,
  ]);

  const hoverProps =
    animateOn === "hover"
      ? { onMouseEnter: triggerDecrypt }
      : animateOn === "click"
      ? { onClick: triggerDecrypt }
      : {};

  const css = style as React.CSSProperties;
  const encCss = (encryptedStyle as React.CSSProperties) ?? {
    ...css,
    opacity: 0.45,
  };

  return (
    <span
      ref={containerRef}
      style={{ display: "inline-block", whiteSpace: "pre-wrap", textAlign: "center" }}
      {...hoverProps}
    >
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {text}
      </span>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const isRevealed = revealedIndices.has(index) || isDone;
          return (
            <span
              key={index}
              className={isRevealed ? className : encryptedClassName}
              style={isRevealed ? css : encCss}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
