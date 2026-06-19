---
name: Expo Android iOS-only module crash
description: iOS-only Expo packages imported at module level crash Android before any Platform.OS check runs; use platform-split files instead.
---

## Rule
Never import iOS-only packages at the top level of a file that also runs on Android. Metro bundles all static imports regardless of runtime Platform.OS checks — the module initializer runs on Android and crashes before any conditional can guard it.

## Affected packages (iOS-only)
- `expo-glass-effect` (isLiquidGlassAvailable, iOS 26+ Liquid Glass)
- `expo-router/unstable-native-tabs` (NativeTabs, Icon, Label)
- `expo-symbols` (SymbolView — SF Symbols)

## Fix
Split into platform files:
- `_layout.ios.tsx` — contains all iOS-only imports and NativeTabLayout + ClassicTabLayout (BlurView, SymbolView)
- `_layout.tsx` — clean Android/web version with only Feather icons and standard Tabs; no iOS imports

Metro automatically picks `.ios.tsx` on iOS and `.tsx` on Android/web.

**Why:** The tab layout is the very first screen loaded after onboarding navigation. A crash here shows a blank white screen on Android — identical to the user's reported bug.

## Also removed
`experiments.reactCompiler: true` from `app.json` — the beta React Compiler plugin caused unpredictable Android behavior. Removing it stabilized the build.

## Package version note
`expo-image-manipulator@56.x` and `expo-notifications@56.x` show `expo doctor` warnings ("expected ~14.x / ~0.32.x") but ARE the correct working versions for this project. Downgrading to 14.x/0.32.x breaks Metro resolution. Leave them at 56.x.
