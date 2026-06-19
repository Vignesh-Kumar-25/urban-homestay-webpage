# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **Urban Retreat Homestay**, a homestay in Mangalore, Karnataka, India. Hosted at `urbanretreatmangalore.com` via shared hosting/FTP. The site is plain HTML/CSS/JS with one PHP form handler. There is no framework, bundler, package manager, or build step.

## Repository Layout

- Root `.html` files: public website pages. Filenames intentionally contain spaces and should remain at the root for current shared-hosting compatibility.
- `feedback.php`: reservation form handler.
- `sitemap.xml`: search-engine sitemap.
- `css/`: active stylesheet entry point and partials.
- `js/`: active browser scripts.
- `images/`: active website image assets.
- `data/`: source data used to generate website assets, including `mangalore_attractions.xlsx`.
- `docs/`: project documentation and product notes.
- `archive/`: legacy hosting output, old templates, and unused assets kept for reference only. Do not deploy or reference these files from active pages.

## Deployment

Deploy the static site files to the shared host. The deployment payload should include:

- All root-level public `.html` files
- `sitemap.xml`
- `feedback.php`
- `css/`, `js/`, `images/`
- `.htaccess` if PHP handler settings are needed on the host

Do not deploy:

- `archive/`
- `data/`
- `docs/`
- `.git/`
- `.claude/`
- local OS/cache files

## Architecture

### HTML Pages

Pages are standalone `.html` files in the root directory. Filenames contain spaces, for example `About Urban Retreat.html`, and must be URL-encoded in `href` attributes, for example `About%20Urban%20Retreat.html`.

Every page repeats the full header, mobile menu, footer, and script includes. There is no templating. Changes to shared elements such as nav links, footer text, and contact info must be replicated across all pages manually.

### CSS

`css/style.css` is the single entry point, importing all active partials via `@import`.

### JavaScript

Four standalone scripts are loaded with `defer` on every page:

- `js/main.js`
- `js/navigation.js`
- `js/animations.js`
- `js/back-to-top.js`

Additional Tourist Helper scripts are loaded only on `Tourist Helper.html`.

### Tourist Helper Feature

`Tourist Helper.html` is a self-contained itinerary planner with no backend. Re-generate `js/attractions-data.js` after editing `data/mangalore_attractions.xlsx` using the Python snippet in `docs/tourist-helper.md`.

### Form Handling

`feedback.php` processes the reservation form on `Reserve Now.html`. It sends email via PHP `mail()` to `vimalkumark@hotmail.com` and redirects back with `?sent=1` or `?error=1`.

### SEO

- `index.html` has JSON-LD structured data using `LodgingBusiness` schema and Open Graph tags.
- `sitemap.xml` should list the deployed root-level page URLs. Update it when pages change.
- `googlefa72e071c73c5474.html` is the Google Search Console verification file.
