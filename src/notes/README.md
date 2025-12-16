# Offline Field Notes (Prototype)

## Run (React Native CLI)

1. Install deps: `yarn`
2. iOS: `yarn ios` Android: `yarn android`

## Run (Expo)

This module is Expo-ready. To run with Expo:

1. `npx create-expo-app offline-field-notes`
2. Copy `src/notes` into the new project and wire `NotesNavigator` to your app entry
3. `yarn && expo start`

## SEED_DATA

Seed notes are in `src/notes/assets/seed.json` and are loaded on first run via the notes store.
