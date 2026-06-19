# PreLove Development Guidelines

## Project Structure
- `App.tsx` - Main app entry & navigation container.
- `src/constants/theme.ts` - Design system (colors, spacings, layout shadows).
- `src/lib/supabase.ts` - Supabase configurations.
- `src/stores/` - Zustand global state stores.
- `src/screens/` - UI pages organized by scope: `auth`, `main`, `seller`.
- `src/utils/` - Utilities & helper functions.

## Commands
### Install Dependencies
`npm install`

### Run locally (Metro Bundler)
`npx expo start`

### Run Android Emulator
`npx expo start --android`

### Run iOS Simulator
`npx expo start --ios`
