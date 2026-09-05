# Fitness Tracker

A multi-user fitness tracking web app — gym workout logging with progress
charts, food/weight/protein tracking with trend charts, and a drag-and-drop
session-based workout planner. Built mobile-first (React + TypeScript + Vite +
Tailwind + shadcn/ui), backed by Firebase (Firestore + Google Sign-In).
Anyone with a Google account can sign in; the exercise library is shared
across all users, and everything else (logs, targets, sessions, notification
settings) is private per account.

## First-time setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Firestore** in **production mode** (not test mode).
   - Under **Authentication → Sign-in method**, enable the **Google**
     provider (pick a support email when prompted). This is required —
     without it, sign-in will fail in production even though it works
     against the local emulator.
   - Under **Project settings → General → Your apps**, register a **Web app** to get its config values.

2. **Configure the app:**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the `VITE_FIREBASE_*` values from step 1.

3. **Install dependencies and run:**
   ```bash
   npm install
   npm run dev
   ```

4. **Deploy Firestore rules** (do this before first real use, so your data
   is never exposed under the default test-mode-style open rules, and
   again any time `firestore.rules` changes):
   ```bash
   firebase use --add   # pick your project, first time only
   firebase deploy --only firestore:rules
   ```

5. **Clean up the legacy-migration rules once your data has moved.** If you
   used an earlier single-user version of this app, `firestore.rules`
   contains a temporary block (clearly commented) that lets the one-time
   migration in `src/lib/migrateLegacyData.ts` copy your old top-level
   `dailyLogs`/`workoutLogs`/`workoutPlanItems`/`sessions`/`targets`/
   `notificationSettings` documents into `users/{uid}/...` on your first
   real sign-in. Once you've signed in and confirmed (via the Firebase
   console) that those top-level collections are empty and your data
   shows up under `users/<your-uid>/...`, delete that temporary block from
   `firestore.rules` and redeploy. A brand-new install has nothing to
   migrate and can delete that block immediately.

## Deploying the app itself

Either works off the same build — pick one:

### Option A: GitHub Pages (free, auto-deploys on push to `main`)

1. In the GitHub repo, add these as **Settings → Secrets and variables →
   Actions → Repository secrets** (same values as your `.env.local`):
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually
   from the Actions tab) — `.github/workflows/deploy-pages.yml` builds and
   deploys automatically. The site lands at
   `https://<your-username>.github.io/<repo-name>/`.
4. In the Firebase console, under **Authentication → Settings → Authorized
   domains**, add that `github.io` URL's host — Google sign-in will fail
   with `auth/unauthorized-domain` from any host not on that list.

### Option B: Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Installing on iOS (free, no App Store)

The app is a PWA (`vite-plugin-pwa`, manifest + service worker, icons
generated from `icon-source.svg`). Once deployed:

1. Open the live URL in **Safari** on iPhone (must be Safari, not Chrome —
   iOS only supports installing PWAs from Safari).
2. Tap **Share → Add to Home Screen**.

That gives a real home-screen icon that opens full-screen (no Safari
address bar). A real App Store listing or TestFlight distribution to other
people both require Apple's $99/year Developer Program — there's no free
path for those specifically, but this covers installing it on your own
phone at no cost.

## Local testing without touching real data (optional)

The app can point at the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
instead of your real project:

```bash
firebase emulators:start --only auth,firestore --project demo-fitness-tracker
```

Then set `VITE_USE_FIREBASE_EMULATOR=true` in `.env.local` (any placeholder
values work for the other `VITE_FIREBASE_*` keys in emulator mode) and run
`npm run dev` as usual.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase (Firestore + Google Auth + Hosting)
- Recharts (charts)
- @dnd-kit (drag-and-drop workout planner)
