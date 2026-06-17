---
name: Expo web useNativeDriver overlay block
description: useNativeDriver:true .start() callbacks don't fire reliably on Expo web, causing absoluteFillObject overlays to get stuck and block all pointer events.
---

## The rule
Never use `useNativeDriver: true` on any `Animated.timing` (or parallel/sequence) whose `.start(callback)` controls the visibility or dismissal of a fullscreen/absoluteFillObject overlay on Expo web. Always use `useNativeDriver: false` for these.

## Why
On Expo web (React Native Web), `useNativeDriver: true` triggers a console warning ("useNativeDriver is not supported") and falls back to JS-driven animation. In this fallback mode, the `.start(onFinish)` callback is NOT reliably called. If an overlay fades in via such an animation and its `.start()` callback is supposed to trigger the next step / fade-out / `setShowOverlay(false)`, that code never runs. The overlay stays rendered at full opacity with `zIndex: 1000` and `pointer-events` captures all mouse/touch events — making everything behind it (e.g. swipe cards) completely unresponsive.

## How to apply
- Any animation that controls overlay show/hide state via `.start(callback)`: use `useNativeDriver: false`.
- Pure visual animations (scale, translate of cards that don't gate state changes) can use either, but `false` is safer on web.
- The tutorial overlay in PantrySwipe's Discover tab was the concrete example: all six tutorial animations (`tutOverlayOpacity`, `tutCardX`, `tutCardY`, `tutStampOpacity`, `tutLabelOpacity`) were changed to `useNativeDriver: false`.
