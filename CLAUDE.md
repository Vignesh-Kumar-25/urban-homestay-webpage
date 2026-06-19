# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **Urban Retreat Homestay**, a homestay in Mangalore, Karnataka, India. The live site is <https://www.urbanretreatmangalore.com/>. The site is plain HTML/CSS/JS with one PHP form handler. There is no framework, bundler, package manager, or build step.

## Repository Layout

- `index.html`: homepage.
- `pages/`: secondary website pages with normalized kebab-case filenames.
- `feedback.php`: reservation form handler.
- `sitemap.xml`: search-engine sitemap.
- `css/`: active stylesheet entry point and partials.
- `js/`: active browser scripts.
- `images/`: active website image assets.
- `data/`: source data used to generate website assets, including `mangalore_attractions.xlsx`.
- `docs/`: project documentation and product notes.
- `archive/`: legacy hosting output, old templates, and unused assets kept for reference only. Do not deploy or reference these files from active pages.

## Deployment

Deploy the static site files to the web host. The deployment payload should include:

- Root files such as `index.html` and verification HTML
- `sitemap.xml`
- `feedback.php`
- `pages/`
- `css/`, `js/`, `images/`

Do not deploy:

- `archive/`
- `data/`
- `docs/`
- `.git/`
- `.claude/`
- local OS/cache files

## Architecture

### HTML Pages

Pages are standalone `.html` files. The homepage stays at `index.html`; secondary pages live in `pages/` with kebab-case filenames such as `pages/about.html` and `pages/tourist-helper.html`. Public links should point directly to page files, for example `/pages/about.html`, `/pages/reserve.html`, and `/pages/tourist-helper.html`.

Every page repeats the full header, mobile menu, footer, and script includes. There is no templating. Changes to shared elements such as nav links, footer text, and contact info must be replicated across all pages manually.

### CSS

`css/style.css` is the single entry point, importing all active partials via `@import`:

- `variables.css`: design tokens
- `reset.css`, `base.css`, `layout.css`: foundation
- `components.css`: buttons, cards, sections, reusable UI pieces
- `header.css`, `footer.css`, `hero.css`: structural components
- `forms.css`, `gallery.css`: page-specific styling
- `animations.css`: scroll-triggered animation classes
- `responsive.css`: breakpoints
- `tourist-helper.css`: slide-deck quiz and itinerary result panel

Key design tokens from `variables.css`:

- Colors: `--color-primary` (ocean blue `#1A6B8A`), `--color-secondary` (coral `#E8734A`), `--color-sand`, `--color-shell`, `--color-sea-foam`, `--color-driftwood`
- Fonts: `--font-heading` (Playfair Display), `--font-body` (Inter), `--font-ui` (Poppins)
- Layout: `--container-max: 1200px`, grid classes `.grid--2`, `.grid--3`, `.grid--4`
- Section backgrounds: `.section--sand`, `.section--sea-foam`, `.section--primary`

### JavaScript

Four standalone scripts are loaded with `defer` on every page:

- `js/main.js`: smooth scroll for anchor links
- `js/navigation.js`: header scroll effect, hamburger menu, mobile submenu toggles, Escape key handler
- `js/animations.js`: IntersectionObserver for `.fade-in`, `.fade-in-left`, `.fade-in-right`, `.scale-in` classes
- `js/back-to-top.js`: scroll-to-top button

Additional scripts are loaded only on `/pages/tourist-helper.html`, in this order:

- `js/attractions-data.js`: generated from `data/mangalore_attractions.xlsx`; exposes `window.URBAN_RETREAT_ATTRACTIONS`
- `js/itinerary-engine.js`: rule-based scoring, clustering, time-slot, and day distribution; exposes `window.UrbanRetreatEngine.generate(prefs)`
- `js/ai-enhancer.js`: modular no-op stub for future LLM enhancements; exposes `window.UrbanRetreatAI`
- `js/tourist-helper.js`: slide-deck questionnaire UI, validation, result rendering, PDF export
- `jsPDF` and `html2canvas` from CDN: used by `tourist-helper.js` for client-side PDF export

### Tourist Helper Feature

`/pages/tourist-helper.html` is a self-contained itinerary planner with no backend. The user steps through an 11-question slide deck, and on completion the same panel swaps to a personalised day-by-day itinerary that can be downloaded as a PDF.

Key implementation notes:

- Slides flow in normal document layout, so tall slides expand the card without overflowing the footer.
- Transitions are serial, so only one slide is mounted at a time.
- `isTransitioning` and `isFinalizing` guard against double-click re-entry.
- The engine reads `window.URBAN_RETREAT_ATTRACTIONS` and applies additive scoring based on priority, category/tag/mood match, group fit, budget cap, walking intensity, and start-time bias.
- Day assembly uses cluster picking, time-slot filling, meal injection, and final-day nightlife injection.
- Re-generate `js/attractions-data.js` after editing `data/mangalore_attractions.xlsx` using the Python snippet in `docs/tourist-helper.md`.
- The AI hook, `UrbanRetreatAI.enhanceItinerary`, is awaited between engine output and rendering. A real LLM call can be added there without touching call sites.
- See `docs/tourist-helper.md` for the full architecture, extension guide, and known limitations. `docs/tourist-helper-prd.md` is the original product spec.

### Form Handling

`feedback.php` processes the reservation form on `/pages/reserve.html`. It sends email via PHP `mail()` to `vimalkumark@hotmail.com` and redirects back with `?sent=1` or `?error=1`.

### SEO

- `/` has JSON-LD structured data using `LodgingBusiness` schema and Open Graph tags.
- `sitemap.xml` should list the deployed page URLs. Update it when pages change.
- `googlefa72e071c73c5474.html` is the Google Search Console verification file.

## Conventions

- Pages use inline `style` attributes heavily for layout within sections while relying on CSS classes for reusable components.
- Hero sections come in two variants: `.hero--full` for the homepage and `.hero--short` for subpages.
- WhatsApp floating button and back-to-top button appear on every page.
- Phone numbers: `+91 7760634848` and `+91 7349343027`.
- CTA sections use the `.section--primary.cta-banner` pattern.
- Room tariffs: Deluxe Double `2,799`, Standard Double `2,199`, Twin `3,999`; all plus 12% GST and 15% weekends.
- Check-in: `1:00 PM`; check-out: `12:00 Noon`.
