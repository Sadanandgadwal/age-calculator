# Age Calculator

A fast, responsive web app that calculates your exact age in years, months and days. It also shows total days, weeks and months lived, your next birthday, and the weekday you were born on.

All calculations run in the browser, so the dates you enter are never sent to a server.

Built with React, Vite, JavaScript, Tailwind CSS and Lucide icons.

## Features

- Exact age on any selected date, past or future
- Correct handling of leap years, month lengths and 29 February birthdays
- Friendly validation for missing, incomplete, impossible and future dates
- Copy, share and print actions
- Responsive layout for phones, tablets and desktops
- SEO metadata, sitemap and robots.txt
- AdSense slots that stay off until you configure them

## Getting started

You need Node.js 20.19 or newer. The repository's `.nvmrc` pins the version used for development.

```bash
nvm use        # optional, if you use nvm
npm install
npm run dev
```

The dev server prints a local URL, which is `http://localhost:5173` by default.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates the production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs the unit and component tests |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run test:e2e` | Runs the browser checks against `dist/` (build first) |
| `npm run check` | Runs lint, tests and build |

### Browser checks

`npm run test:e2e` uses your installed Chrome to check layout at four screen sizes, console errors, accessibility (axe-core), SEO metadata, printing and the clipboard. Screenshots are saved to `e2e-output/`.

```bash
# Check a deployed site instead of the local build
E2E_URL=https://your-site.example npm run test:e2e

# Use Chrome from a different location
CHROME_PATH=/path/to/chrome npm run test:e2e
```

## Environment variables

Copy `.env.example` to `.env.local` for local builds, or set the variables in your Vercel project. All of them are optional.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public URL with no trailing slash, used for canonical, Open Graph and sitemap URLs. On Vercel it defaults to the project's production domain. |
| `VITE_GOOGLE_SITE_VERIFICATION` | Google Search Console ownership code: only the `content` value of its HTML tag |
| `VITE_ADSENSE_PUBLISHER_ID` | AdSense publisher ID, such as `ca-pub-1234567890123456` |
| `VITE_AD_SLOT_HEADER` | Ad unit ID for the slot above the calculator |
| `VITE_AD_SLOT_IN_CONTENT` | Ad unit ID for the slot between the calculator and the information section |
| `VITE_AD_SLOT_FOOTER` | Ad unit ID for the slot at the bottom of the page |

`VITE_` values are included in the public browser bundle, so never put secrets in them.

## AdSense setup

Ads are off by default. With no configuration, no ad script loads and no ad space is shown.

1. Get your site approved in [Google AdSense](https://adsense.google.com/) and create one display ad unit for each slot you want.
2. Set `VITE_ADSENSE_PUBLISHER_ID` and the slot IDs in Vercel. A slot with no ID stays off.
3. Add your site's `ads.txt` to `public/ads.txt`. AdSense gives you the exact contents.
4. Redeploy, because these values are applied at build time.

Before you turn ads on:

- Read `public/privacy.html` and add your contact details. Have it reviewed for the regions you serve.
- If you have visitors in the EEA, UK or Switzerland, set up a Google-certified consent management platform. You can use the Privacy & messaging tools in AdSense.

Settings are read in `src/config/ads.js`, and the ad unit is rendered by `src/components/ads/AdSlot.jsx`. Each slot reserves its height to prevent layout shift and is labelled "Advertisement". Slots are spaced away from the calculator buttons to avoid accidental clicks.

## Deploying to Vercel

The repository includes a `vercel.json`, and Vercel detects the Vite settings automatically.

**From GitHub:** import the repository at [vercel.com/new](https://vercel.com/new) and select **Deploy**. Later pushes to `main` deploy automatically.

**From the command line:**

```bash
npx vercel login
npx vercel --prod
```

After deploying, verify the live site with `E2E_URL=https://your-site.vercel.app npm run test:e2e`.

If you add a custom domain, set `VITE_SITE_URL` to it and redeploy so the SEO URLs use that domain.

## SEO

`npm run build` prerenders the page into `dist/index.html`, so crawlers get the full content without running JavaScript. The browser then replaces that HTML with the live app. The FAQ structured data is generated from `src/content/faqs.js`, so it always matches the visible text.

After the first production deployment:

1. Add the site to [Google Search Console](https://search.google.com/search-console) and submit `/sitemap.xml`. To verify with an HTML tag, set `VITE_GOOGLE_SITE_VERIFICATION` and redeploy.
2. Import the site into [Bing Webmaster Tools](https://www.bing.com/webmasters).
3. Check the live page with Google's [Rich Results Test](https://search.google.com/test/rich-results).

Vercel marks preview deployments as `noindex`, so only the production domain should appear in search results.

## How age is calculated

The logic lives in `src/utils/age.js` and is separate from the UI.

1. Count the whole calendar months between the two dates. Twelve months make a year.
2. Count the remaining days.

Each month is added to the original birth date, so a shortened month doesn't carry over: 31 Jan to 31 Mar is exactly 2 months.

- **Month ends:** a day that doesn't exist in the target month moves to that month's last day, so 31 Jan + 1 month is 28 Feb.
- **29 February birthdays:** these are shown on 28 February in common years. Some countries legally use 1 March, and the app tells users about this difference.
- **Time zones:** dates are handled as calendar days rather than timestamps, so time zones and daylight saving can't shift a result.

## Project structure

```text
build/               Build plugin for SEO URLs, robots.txt and sitemap.xml
public/              Static files: icons, Open Graph image, privacy policy
scripts/             Browser checks
src/
  components/
    ads/             AdSense slot
    calculator/      Form, results and date field
    content/         Useful information and FAQ
    layout/          Header, footer, logo and background
  config/            Site and AdSense configuration
  content/           Copy for the information sections
  hooks/             Calculator state and result actions
  pages/             Page composition
  styles/            Tailwind entry and design tokens
  test/              Test setup
  utils/             Date, age, validation and formatting logic
```
