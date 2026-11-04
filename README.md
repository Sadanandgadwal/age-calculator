# ToolNest

Free, simple online tools for everyday calculations. All calculations run in the browser, so what you enter is never sent to a server.

Built with React, React Router, Vite, JavaScript, Tailwind CSS and Lucide icons.

## Tools

| Tool | Route |
| --- | --- |
| Age Calculator | `/age-calculator` |
| Marks & Percentage Calculator | `/marks-percentage-calculator` |
| Percentage Calculator | `/percentage-calculator` |
| KG to Gram Converter | `/kg-to-gram-converter` |
| CM to Feet Converter | `/cm-to-feet-converter` |
| Date Calculator | `/date-calculator` |
| GST Calculator | `/gst-calculator` |
| Word Counter | `/word-counter` |
| Unix Timestamp Converter | `/unix-timestamp-converter` |
| Work Hours Calculator | `/work-hours-calculator` |
| Week Number Calculator | `/week-number-calculator` |
| Leap Year Checker | `/leap-year-checker` |
| Pomodoro Timer | `/pomodoro-timer` |
| Day of the Week Calculator | `/day-of-week-calculator` |
| Business Days Calculator | `/business-days-calculator` |
| Time Zone Converter | `/time-zone-converter` |
| Online Stopwatch | `/stopwatch` |
| Countdown Timer | `/countdown-timer` |
| Angle Converter | `/angle-converter` |
| Frequency Converter | `/frequency-converter` |
| Energy Converter | `/energy-converter` |
| Pressure Converter | `/pressure-converter` |
| Time Unit Converter | `/time-unit-converter` |
| Speed Converter | `/speed-converter` |
| Data Storage Converter | `/data-storage-converter` |
| Volume Converter | `/volume-converter` |
| Area Converter | `/area-converter` |
| Temperature Converter | `/temperature-converter` |
| Bill Split Calculator | `/bill-split-calculator` |
| Discount Calculator | `/discount-calculator` |
| Time Calculator | `/time-calculator` |
| EMI Calculator | `/emi-calculator` |

## Adding a tool

1. Add the page under `src/tools/<tool-id>/`. Show results with `ResultActions` (or use `UnitConverter`), so the tool offers Copy results, Share and Print. A test fails if a tool leaves it out.
2. Add one entry to `src/data/toolsRegistry.js`.

The route, cards, search, category listings, SEO tags and sitemap entry all come from the registry.

## Getting started

You need Node.js 22.22 or newer. The repository's `.nvmrc` pins the version used for development.

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
| `VITE_CONTACT_EMAIL` | Public email address shown on the Contact page. The page stays out of search results until it's set. |
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

Ads appear on tool pages, the homepage and tool listings. The About, Contact, Privacy and 404 pages have no ads, as they have little content. All pages share one script and the same slot IDs.

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

`npm run build` prerenders every route into `dist/`, along with `404.html` and `sitemap.xml`, so crawlers get full content and unique tags without running JavaScript. The browser then replaces that HTML with the live app. Page tags come from `src/seo/pageMeta.js`, and FAQ structured data comes from each tool's visible copy. Empty categories stay out of the sitemap and are marked `noindex`.

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
build/               Build plugin for robots.txt and the local preview server
public/              Static files: icons, Open Graph images, privacy policy
scripts/             Prerendering and browser checks
src/
  components/
    ads/             AdSense slot
    calculator/      Age Calculator form, results and date field
    common/          Navigation, breadcrumb, tool cards and search
    content/         Age Calculator information and FAQ
    layout/          App layout, page header, footer and background
  config/            Site and AdSense configuration
  content/           Copy for the information sections
  data/              Tool registry and categories
  hooks/             Calculator state, result actions and page tags
  pages/             Pages
  seo/               Page metadata and head tags
  styles/            Tailwind entry and design tokens
  tools/             One folder per tool: page, logic, content and tests
  test/              Test setup
  utils/             Date, age, validation and formatting logic
```
