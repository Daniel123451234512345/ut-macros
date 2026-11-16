# Longhorn Macros (unofficial)

A free macro tracker for UT Austin dining halls (J2, Kins, JCL). Pick a hall, tap what you ate, set servings, and the app totals calories, protein, carbs and fat against your goals.

It's an unofficial student project: not affiliated with or endorsed by UT Austin. Nutrition data comes from UT Housing & Dining's public menu.

## How it works

- `app/api/menu/route.ts` fetches UT's menu on the server, cuts it from about 2 MB down to 260 KB (`lib/slim.ts`), and caches it for 6 hours. Students' phones only ever talk to this app, never to UT's server.
- Everything personal (log, goals, favorites, custom foods) is stored in `localStorage` on each person's own phone. There's no database and no accounts.
- Each log entry saves a copy of its macros, so past days stay correct after the menu changes.
- Dates and the auto-picked meal use Austin time: Breakfast before 10:30, Lunch before 4:00 pm, Dinner after that.

## Run it locally

```bash
npm install
npm run dev -- -H 0.0.0.0
```

Open http://localhost:3000.

**On your phone (same Wi-Fi):** find your Mac's IP with `ipconfig getifaddr en0` (for example `192.168.48.121`), then open `http://192.168.48.121:3000` in Safari on your iPhone. If macOS asks whether to allow incoming connections for `node`, click **Allow**. UT and campus Wi-Fi often block phone-to-laptop connections, so this works best on home Wi-Fi or your phone's hotspot.

> The local version runs over plain `http`, so "Add to Home Screen" there is only a preview. Install the real one from the Vercel URL below.

Other commands:

```bash
npm test          # unit tests (menu slimming, macro math, Austin dates)
npm run build     # production build
npm run icons     # regenerate app icons from scripts/make-icons.mjs
```

## Just want to use it?

You don't need to deploy anything. Open the app's link on your phone and add it to your home screen (steps below). Your log stays on your own phone.

## Run your own copy

No API keys or environment variables are needed, so a copy works as soon as it's deployed.

**One click:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDaniel123451234512345%2Fut-macros&project-name=ut-macros&repository-name=ut-macros)

This copies the repo to your GitHub account and deploys it to your Vercel account (both free).

**Or fork it:**

1. Click **Fork** at the top of this repo on GitHub.
2. On vercel.com, sign in with GitHub, click **Add New… → Project**, pick your fork, and click **Deploy**.

Every push to your fork redeploys it.

## Deploy from scratch (the original setup)

1. **Make a GitHub repo.** On github.com, click **New repository**, name it `ut-macros`, and leave it empty (no README or .gitignore).
2. **Push this folder** (it's already a git repo):
   ```bash
   git add -A
   git commit -m "Longhorn Macros first version"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ut-macros.git
   git push -u origin main
   ```
3. **Import into Vercel.** Go to vercel.com, sign up with GitHub, click **Add New… → Project**, pick `ut-macros`, and click **Deploy**. No settings or environment variables are needed, since Vercel detects Next.js on its own.
4. After a minute you get a URL like `https://ut-macros-xyz.vercel.app`. Every `git push` to `main` redeploys automatically.

(Optional) In Vercel's **Settings → Domains** you can rename it to something like `longhorn-macros.vercel.app` if that name is free.

## Add it to your iPhone home screen

1. Open your Vercel URL in **Safari**. It has to be Safari, not the Chrome or Instagram in-app browser.
2. Tap the **Share** button (square with an arrow), scroll down, and tap **Add to Home Screen**.
3. Make sure **Open as Web App** is on, then tap **Add**.

It now opens full-screen like a normal app, with the bottom tabs.

Note: the home-screen app has its own storage, separate from Safari tabs. Log from the home-screen icon so your history stays in one place.

## Project layout

```
app/
  page.tsx            Menu (hall + meal picker, search, stations)
  today/page.tsx      Progress bars, quick add, today's log
  history/page.tsx    Last 14 days
  settings/page.tsx   Goals, favorites, my foods, clear data
  api/menu/route.ts   Server fetch + 6h cache of UT's menu
  manifest.ts         PWA manifest
components/           ItemSheet, CustomFoodSheet, LogList, MacroBars, BottomTabs, ui
lib/
  slim.ts             UT JSON → small menu (tested)
  macros.ts           servings math + rounding (tested)
  dates.ts            Austin date keys "MM/DD/YYYY", meal by time (tested)
  storage.ts          localStorage hooks
  useMenu.ts          loads /api/menu, falls back to the last saved copy
```

To test the "menu unavailable" screen, run the app with a broken source URL: `UT_MENU_URL=https://example.invalid npm run dev`.
