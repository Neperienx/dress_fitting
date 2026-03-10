# Bridal Studio Mobile (React Native + Expo)

This folder contains a **fresh mobile app implementation** of the existing Bridal Studio web experience, built from scratch with **React Native + Expo** and designed for a **single codebase targeting both iOS and Android**.

> Scope note: this mobile code lives entirely under `Mobile_version/` and does not modify the web app code.

---

## 1) Goals

- Keep iOS and Android in one shared codebase.
- Reuse the existing backend APIs exposed by `landing_server.py`.
- Start with a practical MVP covering:
  - Owner sign-in by email (prototype style)
  - Stores list + create store
  - Store details + dress photo upload
  - Default swipe session (like/dislike)
- Keep architecture ready for future enhancements (real auth, richer ranking, offline support).

---

## 2) Tech stack

- **Expo SDK 51**
- **React Native 0.74**
- **TypeScript**
- **React Navigation (native stack)**
- **AsyncStorage** for local session persistence
- **expo-image-picker** for photo selection/upload

Why this stack:
- Expo provides the smoothest cross-platform setup and build flow.
- React Navigation gives standard iOS/Android navigation behavior.
- TypeScript keeps contracts with backend payloads explicit.

---

## 3) Project structure

```text
Mobile_version/
├── app.json
├── babel.config.js
├── index.ts
├── package.json
├── tsconfig.json
├── README_Mobile.md
└── src/
    ├── App.tsx
    ├── config.ts
    ├── types.ts
    ├── api/
    │   ├── client.ts
    │   └── stores.ts
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── SessionScreen.tsx
    │   ├── StoreDetailsScreen.tsx
    │   └── StoresScreen.tsx
    └── storage/
        └── session.ts
```

---

## 4) Features implemented

## 4.1 Login screen

- Accepts owner email and stores it locally.
- Restores session on app startup from AsyncStorage.

## 4.2 Stores screen

- Calls `GET /api/stores?owner=<email>`
- Renders all linked stores
- Creates new store via `POST /api/stores`
- Navigates to:
  - Store details screen
  - Session screen

## 4.3 Store details screen

- Shows store metadata
- Uses device gallery picker to select a dress image
- Uploads selected image as `multipart/form-data` to:
  - `POST /api/stores/:id/dress-photo`

## 4.4 Session screen

- Loads default deck from backend:
  - `GET /api/default-dress-photos`
  - `GET /api/default-dress-metadata`
- Displays one card at a time
- Tracks like/dislike interactions locally
- Shows completion summary

---

## 5) Backend compatibility assumptions

This mobile app is wired to the API shape currently exposed by the existing Python server. In particular:

- Stores endpoint requires owner query param.
- Upload endpoint requires `owner_email` in multipart payload.
- Default session endpoints return lists of photo paths and optional tags.

If backend contracts change, update:
- `src/types.ts`
- `src/api/client.ts`
- `src/api/stores.ts`

---

## 6) Configuration

### API base URL

Set in `src/config.ts`:

```ts
export const API_BASE_URL = 'http://localhost:8000';
```

For real devices, `localhost` points to the phone itself. Use your machine LAN IP instead, for example:

```ts
export const API_BASE_URL = 'http://192.168.1.50:8000';
```

### iOS / Android package IDs

Defined in `app.json`:
- `ios.bundleIdentifier`
- `android.package`

Replace these placeholders before production build.

---

## 7) Run locally

From repo root:

```bash
cd Mobile_version
npm install
npm run start
```

Then:
- Press `i` for iOS simulator (macOS + Xcode required)
- Press `a` for Android emulator
- Or scan QR code with Expo Go on device

---

## 8) Build for both platforms

Recommended using EAS Build:

```bash
npm install -g eas-cli
cd Mobile_version
eas login
eas build:configure
eas build --platform ios
eas build --platform android
```

This maintains one source tree and produces native binaries for both OSes.

---

## 9) Cross-platform implementation notes

- Uses `Pressable`, `TextInput`, `FlatList`, `Image`, and `ScrollView` primitives (stable on iOS+Android).
- Uses `SafeAreaProvider` to avoid notch/gesture conflicts.
- Navigation relies on native stack for platform-consistent transitions.
- Avoids platform-specific code branches in this MVP.

---

## 10) Known gaps / next steps

1. **Production authentication**
   - Current flow mirrors web prototype behavior (email identity only).
   - Add token-based auth (JWT/session cookie strategy).

2. **Richer session ranking parity**
   - Current mobile session is simplified and can be expanded to mirror full browser logic.

3. **Error handling & retries**
   - Add robust network handling, exponential retry, and user-friendly states.

4. **Offline support**
   - Cache stores/decks for low-connectivity stores.

5. **Design system**
   - Introduce shared theme and reusable components (buttons/cards/forms).

6. **Testing**
   - Add unit tests for API adapters and domain logic.
   - Add E2E tests (Detox / Maestro).

---

## 11) Suggested roadmap

### Phase 1 (completed in this folder)
- App shell, navigation, API connectivity, key screens.

### Phase 2
- Real auth + secure token storage
- Session algorithm parity with web
- Better validation and API error states

### Phase 3
- UI polish and accessibility pass
- Store profile editing and metadata flows
- CI/CD for iOS and Android releases

### Phase 4
- Analytics, crash reporting, and observability
- Offline mode + conflict handling

---

## 12) Troubleshooting

### Cannot reach backend from device
- Ensure backend binds to `0.0.0.0`.
- Use machine LAN IP in `API_BASE_URL`, not `localhost`.
- Confirm both phone and machine are on same network.

### Image upload fails
- Verify iOS/Android photo permissions are granted.
- Confirm backend accepts selected mime type.
- Check backend logs for multipart parsing issues.

### iOS simulator not opening
- Install Xcode and simulator runtimes.
- Run `xcode-select --install` and retry.

### Android emulator issues
- Ensure Android Studio + SDK + virtual device is configured.
- Start emulator first, then run `npm run android`.

---

## 13) Why this approach satisfies the requirement

- One React Native codebase for both iOS and Android ✅
- Fresh implementation isolated in `Mobile_version/` ✅
- No web app file modifications ✅
- Clear migration base aligned with existing backend endpoints ✅

