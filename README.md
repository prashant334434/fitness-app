# Fitness App — React Native UI & Animation

Bare React Native CLI app (RN 0.88, New Architecture, Hermes). Mock data only.

## Run

```sh
npm install
npx react-native start
npx react-native run-android
```

Release APK: `cd android && ./gradlew assembleRelease` → `android/app/build/outputs/apk/release/app-release.apk`

## What's in it

**Onboarding (10 steps, one screen)**: gender → age → weight → height → goal → target weight → timeline → activity → experience → training days → "Personalizing" → Home.
Steps slide in the direction you move (Next/Skip/Back and the Android back button). The blue corner arc grows as you progress, and list rows enter one after another.

**Weight dial** ([src/components/scales.tsx](src/components/scales.tsx)): 341 ticks, 1° each (0.5 kg or 1 lb per tick). Dragging maps the finger's *angle* around the dial centre to rotation, so the dial turns in a circle under a fixed pointer. On release, the angular velocity (`(r × v) / |r|²`) is projected a short time ahead. A spring that starts at the finger's velocity then carries it into the nearest detent, so momentum and snap happen in one continuous motion. Touching a dial that is still moving stops it, like a real one. A slower outer ring adds parallax.

**Height ruler**: the same physics engine (`useTickScale`) driven by vertical pan. It supports cm and ft/in, and labels brighten near the pointer.

**Both scales**: everything runs on the UI thread (Reanimated 4 + Gesture Handler 3). One haptic tick per detent crossed, and the number updates live. Switching Kg/Lbs or CM/Feet converts the value and glides the scale to it. Dragging past either end rubber-bands.

**Age wheel**: three native snapping ScrollViews. Rows fade by distance, each row change gives a haptic, invalid days are clamped (Feb 31 → Feb 28/29), and the age is computed live.

**Home**: greeting, today's plan with an animated ring, a bento of Gyms / Play / Events tiles, an events carousel and nearby gyms.

**Inner pages (designed in the same style)**: Gyms (search + filters), Play (courts by sport), Events (by category), Event Details (parallax hero, header that fades in on scroll, attendees, spots left), and Booking. Booking is one screen for gym passes, court slots + duration, and event tickets. It ends with an animated confirmation and receipt.

Every tappable element springs on press and gives a light haptic.

## Stack

`react-native-reanimated` 4 · `react-native-gesture-handler` 3 · `react-native-svg` · `@react-navigation/native-stack` · `react-native-haptic-feedback` · `lucide-react-native` · Lexend + Montserrat fonts.
