# Urban Retreat Homestay Website

Static website for Urban Retreat Homestay in Mangalore, Karnataka, India.

Live site: <https://www.urbanretreatmangalore.com/>

There is no install step and no build step.

## Structure

- Root `.html` files are the public pages.
- `index.html` and verification files stay at the root.
- `pages/` contains the secondary website pages using normalized filenames.
- `feedback.php` handles reservation form submissions.
- `css/`, `js/`, and `images/` contain active runtime assets.
- `data/` contains source data used to regenerate runtime assets.
- `docs/` contains project notes and feature documentation.
- `archive/` contains legacy hosting files and unused historical assets kept for reference.

## Local Editing

Run the site from the repository root with any small static server so root-relative asset paths resolve correctly. `feedback.php` requires a PHP-capable host to test form mail behavior if it remains part of the live contact flow.

## Deployment

Deploy the static site files to the web host. The public deployment payload should include:

- Root files such as `index.html` and verification HTML
- `pages/`
- `feedback.php`
- `sitemap.xml`
- `googlefa72e071c73c5474.html`
- `css/`
- `js/`
- `images/`

Do not deploy `archive/`, `data/`, `docs/`, `.git/`, or `.claude/`.

## Tourist Helper

The itinerary planner uses `js/attractions-data.js`, generated from `data/mangalore_attractions.xlsx`.

See `docs/tourist-helper.md` for the architecture and regeneration notes.
