# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **Urban Retreat Homestay**, a homestay in Mangalore, Karnataka, India. Hosted at `urbanretreatmangalore.com` via shared hosting (FTP deployment, no build step). The site is plain HTML/CSS/JS with one PHP file for form handling — no frameworks, no bundler, no package manager.

## Deployment

Files are uploaded to the FTP server manually. Only these need to be deployed:
- All root-level `.html` files, `sitemap.xml`, `feedback.php`
- `css/`, `js/`, `images/` folders

Skip `cgi-bin/`, `cp/`, `modlogan/`, `webalizer/`, `Templates/`, `.git/` — these are server-side or legacy.

## Architecture

### HTML Pages
All pages are standalone `.html` files in the root directory. Filenames contain spaces (e.g., `About Urban Retreat.html`) and must be URL-encoded in `href` attributes (e.g., `About%20Urban%20Retreat.html`).

Every page repeats the full header, mobile menu, footer, and script includes. There is no templating — changes to shared elements (nav links, footer, contact info) must be replicated across all pages manually.

### CSS
`css/style.css` is the single entry point, importing all partials via `@import`:
- `variables.css` — design tokens (colors, typography, spacing, shadows, transitions)
- `reset.css` → `base.css` → `layout.css` — foundation
- `components.css` — buttons (`.btn--primary`, `.btn--coral`, `.btn--whatsapp`, etc.), cards (`.icon-card`), sections
- `header.css`, `footer.css`, `hero.css` — structural components
- `forms.css`, `gallery.css` — page-specific
- `animations.css` — scroll-triggered fade/scale animations
- `responsive.css` — breakpoints
- `tourist-helper.css` — slide-deck quiz + itinerary result panel (only used on `Tourist Helper.html`, but imported globally for simplicity)

Key design tokens to use (from `variables.css`):
- Colors: `--color-primary` (ocean blue #1A6B8A), `--color-secondary` (coral #E8734A), `--color-sand`, `--color-shell`, `--color-sea-foam`, `--color-driftwood`
- Fonts: `--font-heading` (Playfair Display), `--font-body` (Inter), `--font-ui` (Poppins)
- Layout: `--container-max: 1200px`, grid classes `.grid--2`, `.grid--3`, `.grid--4`
- Section backgrounds: `.section--sand`, `.section--sea-foam`, `.section--primary`

### JavaScript
Four standalone scripts loaded with `defer` on every page:
- `js/main.js` — smooth scroll for anchor links
- `js/navigation.js` — header scroll effect, hamburger menu, mobile submenu toggles, Escape key handler
- `js/animations.js` — IntersectionObserver for `.fade-in`, `.fade-in-left`, `.fade-in-right`, `.scale-in` classes
- `js/back-to-top.js` — scroll-to-top button

Additional scripts loaded **only on `Tourist Helper.html`** (in this order):
- `js/attractions-data.js` — generated from `mangalore_attractions.xlsx`; exposes `window.URBAN_RETREAT_ATTRACTIONS` (80 entries)
- `js/itinerary-engine.js` — rule-based scoring, clustering, time-slot, day distribution; exposes `window.UrbanRetreatEngine.generate(prefs)`
- `js/ai-enhancer.js` — modular stub for future LLM enhancements (`window.UrbanRetreatAI`); no-op in MVP
- `js/tourist-helper.js` — slide-deck questionnaire UI, validation, result rendering, PDF export
- `jsPDF` + `html2canvas` from CDN — used by `tourist-helper.js` for client-side PDF export

### Tourist Helper feature
`Tourist Helper.html` is a self-contained itinerary planner with no backend. The user steps through an 11-question slide-deck (progress bar, Back / Continue), and on completion the same panel swaps to a personalised day-by-day itinerary that can be downloaded as a PDF.

Key implementation notes:
- Slides flow in normal document layout (not `position: absolute`), so tall slides (the Interests chip cloud, up to 31 chips) expand the card without overflowing the footer. Transitions are serial (out → mount → in, ~260 ms each) so only one slide is ever in the DOM. `isTransitioning` and `isFinalizing` flags guard against double-click re-entry.
- Engine reads `window.URBAN_RETREAT_ATTRACTIONS` and applies additive scoring (base priority, category/tag/mood match, group fit, budget cap, walking intensity, start-time bias). Day assembly: cluster picking → time-slot filling → meal injection → nightlife injection on the final day.
- Re-generate `js/attractions-data.js` after editing `mangalore_attractions.xlsx` using the Python snippet in `tourist_helper.md` §6.
- The AI hook (`UrbanRetreatAI.enhanceItinerary`) is awaited between engine output and rendering — drop in a real LLM call there without touching call sites.
- See `tourist_helper.md` for the full architecture, extension guide, and known limitations. `tourist_helper_prd` is the original product spec.

### Form Handling
`feedback.php` processes the reservation form (`Reserve Now.html`). It sends email via PHP `mail()` to `vimalkumark@hotmail.com` and redirects back with `?sent=1` or `?error=1`.

### SEO
- `index.html` has JSON-LD structured data (`LodgingBusiness` schema) and Open Graph tags
- `sitemap.xml` exists but uses old `http://` URLs and 2008 dates — needs updating when pages change
- `googlefa72e071c73c5474.html` is the Google Search Console verification file

## Conventions

- Pages use inline `style` attributes heavily for layout within sections (flexbox, padding, margins) while relying on CSS classes for reusable components
- Hero sections come in two variants: `.hero--full` (homepage) and `.hero--short` (subpages)
- WhatsApp floating button and back-to-top button appear on every page
- Phone numbers: +91 7760634848 and +91 7349343027
- CTA sections use `.section--primary.cta-banner` pattern
- Room tariffs: Deluxe Double (2,799), Standard Double (2,199), Twin (3,999) — all +12% GST, +15% weekends
- Check-in: 1:00 PM, Check-out: 12:00 Noon
