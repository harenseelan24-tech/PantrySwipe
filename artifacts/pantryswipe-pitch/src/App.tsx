/**
 * Platform contract file — do not restructure.
 *
 * This file is part of the contract between the slides artifact and
 * the surrounding workspace tooling (preview, thumbnails, exports).
 * Reorganizing it, swapping the router, or changing the structure
 * of `AllSlides` can quietly break that tooling even when the page
 * still looks correct in the preview.
 *
 * Agents: see the slides skill `<workspace_contract>` for the full
 * rules, and `references/visual_qa.md` → "Platform contract sanity
 * check" if this file has been hand-edited and needs repair.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import { slides } from "@/slideLoader";

const SWIPE_DURATION = 420;

function getSlideIndex(pathname: string): number {
  const match = pathname.match(/^\/slide(\d+)$/);
  if (!match) return -1;
  const position = parseInt(match[1], 10);
  return slides.findIndex((s) => s.position === position);
}

type SwipeTransition = { dir: 1 | -1; from: number; to: number };

function SlideEditor() {
  const [location, navigate] = useLocation();
  const currentIndex = getSlideIndex(location);

  // Swipe transition state
  const prevIndexRef = useRef(currentIndex);
  const [transition, setTransition] = useState<SwipeTransition | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentIndex === -1) return;
    const prev = prevIndexRef.current;
    if (prev !== currentIndex && prev !== -1) {
      const dir: 1 | -1 = currentIndex > prev ? 1 : -1;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      setTransition({ dir, from: prev, to: currentIndex });
      transitionTimerRef.current = setTimeout(() => setTransition(null), SWIPE_DURATION + 30);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  // In the workspace, the slide iframe is nested inside another iframe,
  // so window.parent !== window.parent.parent. In the deployed SlideViewer,
  // the parent is the top-level window, so they're equal. Disable local
  // navigation only in the workspace — the parent owns it there.
  const navigationDisabledRef = useRef(window.parent !== window.parent.parent);
  const touchHandledRefStable = useRef(false);

  useEffect(() => {
    if (currentIndex === -1) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (navigationDisabledRef.current) return;
      if (event.key === " ") {
        event.preventDefault();
      }
      if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      }
      if (
        (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") &&
        currentIndex < slides.length - 1
      ) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    const INTERACTIVE =
      "a,button,video,audio,input,select,textarea,details,summary,iframe,svg,canvas," +
      '[role="button"],[contenteditable="true"]';

    const isInteractive = (target: EventTarget | null) =>
      (target as HTMLElement | null)?.closest?.(INTERACTIVE);

    const touchHandledRef = touchHandledRefStable;

    const onClick = (event: MouseEvent) => {
      if (touchHandledRef.current) {
        touchHandledRef.current = false;
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (isInteractive(event.target)) return;

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      if (currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchTarget: EventTarget | null = null;

    const onTouchStart = (event: TouchEvent) => {
      touchHandledRef.current = false;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchTarget = event.target;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= 10 || Math.abs(dy) >= 10) return;
      if (isInteractive(touchTarget)) return;
      touchHandledRef.current = true;

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      const fraction = touchStartX / window.innerWidth;
      if (fraction < 0.4 && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      } else if (fraction >= 0.4 && currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentIndex, navigate]);

  const dur = `${SWIPE_DURATION}ms`;
  const ease = "cubic-bezier(0.32, 0.72, 0, 1)";

  return (
    <div
      className="select-none"
      style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}
    >
      <style>{`
        @keyframes ps-swipe-out-left {
          from { transform: translateX(0) rotate(0deg); opacity: 1; }
          to   { transform: translateX(-115%) rotate(-6deg); opacity: 0; }
        }
        @keyframes ps-swipe-out-right {
          from { transform: translateX(0) rotate(0deg); opacity: 1; }
          to   { transform: translateX(115%) rotate(6deg); opacity: 0; }
        }
        @keyframes ps-swipe-in-right {
          from { transform: translateX(60%) scale(0.88); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes ps-swipe-in-left {
          from { transform: translateX(-60%) scale(0.88); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes ps-color-flash {
          0%   { opacity: 0; }
          25%  { opacity: 0.22; }
          100% { opacity: 0; }
        }
      `}</style>

      {slides.map((slide, index) => {
        const isFrom = transition !== null && index === transition.from;
        const isTo   = transition !== null && index === transition.to;
        const isIdle = transition === null && index === currentIndex;

        if (!isFrom && !isTo && !isIdle) return null;

        let extraStyle: React.CSSProperties = {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        };

        if (isFrom && transition) {
          extraStyle = {
            ...extraStyle,
            zIndex: 1,
            animation: `${transition.dir === 1 ? "ps-swipe-out-left" : "ps-swipe-out-right"} ${dur} ${ease} forwards`,
          };
        } else if (isTo && transition) {
          extraStyle = {
            ...extraStyle,
            zIndex: 2,
            animation: `${transition.dir === 1 ? "ps-swipe-in-right" : "ps-swipe-in-left"} ${dur} ${ease} forwards`,
          };
        } else {
          extraStyle = { ...extraStyle, zIndex: 0 };
        }

        return (
          <div key={slide.id} style={extraStyle}>
            <slide.Component />
          </div>
        );
      })}

      {/* Directional colour hue overlay */}
      {transition && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
            backgroundColor: transition.dir === 1 ? "#4CAF76" : "#E84040",
            animation: `ps-color-flash ${dur} ease-out forwards`,
          }}
        />
      )}
    </div>
  );
}

// Do not rewrite this component. Each slide must remain wrapped in
// `<div className="slide">` sized 1920×1080 — the class name and
// dimensions are part of the platform contract. See the file-level
// banner above for context.
function AllSlides() {
  return (
    <div className="bg-black">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className="slide relative aspect-video overflow-hidden"
          style={{ width: "1920px", height: "1080px" }}
        >
          <div className="h-full w-full [&_.h-screen]:!h-full [&_.w-screen]:!w-full">
            <slide.Component />
          </div>
        </div>
      ))}
    </div>
  );
}

// This component is used for the deployed view at `/`
function SlideViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [dims, setDims] = useState(() => ({
    width: Math.min(window.innerWidth, window.innerHeight * (16 / 9)),
    height: Math.min(window.innerHeight, window.innerWidth * (9 / 16)),
  }));

  useEffect(() => {
    const update = () => {
      setDims({
        width: Math.min(window.innerWidth, window.innerHeight * (16 / 9)),
        height: Math.min(window.innerHeight, window.innerWidth * (9 / 16)),
      });
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== " ") return;
      if (event.key === " ") event.preventDefault();
      iframeRef.current?.contentWindow?.dispatchEvent(
        new KeyboardEvent("keydown", { key: event.key, code: event.code, bubbles: true }),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const firstPosition = slides.length > 0 ? slides[0].position : 1;

  return (
    <div
      className="slide-viewer h-screen w-screen overflow-hidden bg-black flex items-center justify-center"
      onClick={() => iframeRef.current?.focus()}
    >
      <iframe
        ref={iframeRef}
        src={`${base}/slide${firstPosition}`}
        style={{ width: dims.width, height: dims.height, border: "none" }}
        onLoad={() => iframeRef.current?.focus()}
        title="Slide viewer"
      />
    </div>
  );
}

export default function App() {
  const [location, navigate] = useLocation();

  // DO NOT edit this useEffect - redirects unknown routes to the first slide.
  // The "/" and "/allslides" routes are handled separately below.
  useEffect(() => {
    if (
      location !== "/" &&
      location !== "/allslides" &&
      getSlideIndex(location) === -1
    ) {
      if (slides.length > 0) {
        navigate(`/slide${slides[0].position}`, { replace: true });
      }
    }
  }, [location, navigate]);

  // DO NOT edit this useEffect - allows the parent frame to navigate
  // between slides via postMessage so it can avoid changing the iframe
  // src (which causes a white flash).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "navigateToSlide" &&
        typeof event.data.position === "number" &&
        slides.some((s) => s.position === event.data.position)
      ) {
        navigate(`/slide${event.data.position}`);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  if (location === "/") return <SlideViewer />;
  if (location === "/allslides") return <AllSlides />;
  return <SlideEditor />;
}
