# Fitness Tracker

A personal fitness tracking web app — gym workout logging with progress
charts, food/weight/protein tracking with trend charts, and a drag-and-drop
weekly workout planner. Built mobile-first (React + TypeScript + Vite +
Tailwind + shadcn/ui), backed by Firebase (Firestore + silent anonymous
auth, no login screen).

## First-time setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Firestore** in **production mode** (not test mode).
   - Under **Authentication → Sign-in method**, enable the **Anonymous** provider.
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
   is never exposed under the default test-mode-style open rules):
   ```bash
   firebase use --add   # pick your project, first time only
   firebase deploy --only firestore:rules
   ```

5. **Harden the security rules** once you have a real anonymous uid: open
   the app once, find your uid in the Firebase console under
   **Authentication**, then edit `firestore.rules` — replace
   `isAllowedUser()`'s body with the uid-allowlist version described in
   that file's comments, and redeploy. This restricts the database to your
   device(s) instead of anyone who can call the (public, credential-free)
   anonymous sign-in endpoint.

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
   domains**, add that `github.io` URL's host — anonymous sign-in will
   fail with `auth/unauthorized-domain` from any host not on that list.

### Option B: Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

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
- Firebase (Firestore + Anonymous Auth + Hosting)
- Recharts (charts)
- @dnd-kit (drag-and-drop workout planner)
