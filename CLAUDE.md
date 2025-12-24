# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm start              # Start Metro dev server
npm run android        # Build and run on Android
npm run ios            # Build and run on iOS
npm run lint           # Run ESLint
npm test               # Run Jest tests
```

**iOS first-time setup:**
```bash
bundle install && bundle exec pod install
```

## Architecture Overview

This is a React Native 0.81.4 multi-module demonstration app. The home screen navigates to various feature modules and demo screens.

### Key Technologies
- React 19.1.0 + TypeScript
- Zustand for state management with MMKV persistence
- React Navigation (Native Stack + Bottom Tabs)
- Reanimated 3.19.1 for animations
- Custom Kotlin native modules for Android

### Project Structure

```
src/
├── navigation/AppNavigator.tsx    # Root navigator with all routes
├── screens/                       # ~31 demo screens (animations, media, UI)
├── notes/                         # Offline notes module
│   ├── lib/store.tsx              # Zustand + MMKV persistence
│   └── pages/, screens/, components/
├── xtracker/                      # Fitness challenge tracker
│   └── screens/, components/, theme.ts
├── motionx/                       # Full fitness training app
│   ├── MotionXFlow.tsx            # Entry with tabs
│   ├── store/workoutStore.ts      # Zustand workout state
│   └── screens/, lib/, data/
└── lib/MediaEngine.ts             # Wrapper for native Media3 module
```

### Native Modules (Android/Kotlin)

Located in `android/app/src/main/java/com/projectsbin/`:

**NativeMedia3Module** - Video editing using androidx.media3:
- Methods: `processVideo()`, `trim()`, `rotate()`, `crop()`, `flip()`, `cut()`, `merge()`, `changeSpeed()`, `imageToVideo()`, `transcode()`

**PipModule** - Picture-in-Picture mode:
- Methods: `enterPip()`, `isPipSupported()`, `isInPipMode()`
- MainActivity handles PiP state events

### Patterns & Conventions

- Screen props use `NativeStackScreenProps` with typed route params
- State: Zustand stores exposed via hooks (`useNotesStore`, `useWorkoutStore`)
- Storage: MMKV wrapper (`mmkv.set()`, `mmkv.getString()`)
- Navigation: Type-safe with `useNavigation<NavigationProp<RootStackParamList>>()`
- Themes: Module-specific `theme.ts` files with color constants
- Styles: `StyleSheet.create()` for static styles

### Android Permissions

Camera, audio recording, media access permissions are configured in AndroidManifest.xml. MainActivity has `supportsPictureInPicture: true`.
