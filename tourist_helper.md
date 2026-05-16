# Tourist Helper — Implementation Notes

Companion to `tourist_helper_prd`. This document covers what was actually built, where the moving parts live, and how to extend or debug them.

---

## 1. What it is

A self-contained Mangalore itinerary planner, embedded as a new page on the static Urban Retreat site. The user steps through a one-question-per-slide questionnaire (progress bar + Back / Continue), and on completion the same panel is replaced by a personalised day-by-day itinerary that can be downloaded as a PDF.

No backend. No build step. Everything runs in the browser and ships through the existing FTP deployment.

---

## 2. Files

### New
| File | Purpose |
|---|---|
| `Tourist Helper.html` | The page itself — header/footer/hero match the rest of the site; centre is the stage card. |
| `css/tourist-helper.css` | Slide-deck UI, result panel, print rules. Imported via `style.css`. |
| `js/attractions-data.js` | Generated from `mangalore_attractions.xlsx`. Exposes `window.URBAN_RETREAT_ATTRACTIONS` (80 entries). |
| `js/itinerary-engine.js` | Scoring + clustering + slotting + day distribution. Exposes `window.UrbanRetreatEngine.generate(prefs)`. |
| `js/ai-enhancer.js` | Placeholder module for future LLM integration. Exposes `window.UrbanRetreatAI` (all methods are no-ops in MVP). |
| `js/tourist-helper.js` | UI orchestration: slide state machine, validation, result rendering, PDF export. |

### Touched
| File | Change |
|---|---|
| `css/style.css` | Added `@import url('tourist-helper.css');` |
| All root-level `*.html` pages | Added "Tourist Helper" link to desktop nav, mobile menu, and (where present) the footer Explore list. |

### Untouched server-side
No PHP, no database. `feedback.php` and other server hooks are unaffected.

---

## 3. Tech choices (and why)

| Concern | Choice | Why |
|---|---|---|
| Backend | None | The site is on shared FTP hosting with only PHP — no Python runtime, no SQL. Keeping it client-side ships through the existing pipeline. |
| Data store | JSON literal in a JS file | Static, ~100 KB, gzip-friendly, zero infra. |
| PDF | `jsPDF` + `html2canvas` from CDN | Captures the rendered result panel as an image and tiles it across A4 pages. Print-to-PDF works as a fallback. |
| Slide positioning | Normal document flow (not `position: absolute`) | An earlier absolute-positioned model meant tall slides (the chip cloud on the Interests step is up to 31 chips) overflowed downward and — because `transform` on the slide creates a stacking context — painted over the footer, swallowing clicks on Continue. Flow positioning lets the parent expand with content; `.th-slides` keeps a `min-height` so short slides still look generous. |
| Slide transitions | Serial: out → mount → in (~260 ms each) with re-entry guards | Because only one slide is mounted at a time, the container's height tracks the active slide exactly — no two-slide height stacking, no jitter. `isTransitioning` blocks double-clicks during the swap; `isFinalizing` blocks the same on the last step. |
| AI | Modular stub | PRD says AI is later-insertable. `UrbanRetreatAI.enhanceItinerary()` is called in the flow but returns input unchanged today. |

---

## 4. User flow

```
hero
 │
 ▼
┌──────────────────────────────────────────────────────────┐
│  Stage card (.th-stage)                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Quiz view (.th-view#th-quiz)                      │  │
│  │   ├ progress bar + "Question X of Y"               │  │
│  │   ├ active slide  (.th-slide--active)              │  │
│  │   └ Back  |  hint   Continue                       │  │
│  └────────────────────────────────────────────────────┘  │
│           ▼  (on last "Build my plan" click)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Loading view (~900 ms)                            │  │
│  └────────────────────────────────────────────────────┘  │
│           ▼                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Result view                                       │  │
│  │   ├ gradient hero with stats                       │  │
│  │   ├ Download PDF / Print / Start over              │  │
│  │   └ per-day cards with expandable place rows       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

Steps (11):

1. **Trip style** — tourist / fun / both
2. **Food** — include or skip
3. **Nightlife** — show or hide
4. **Interests** — multi-select chips (dynamic — depends on 1-3)
5. **Trip length** — 1 / 2 / 3 days
6. **Budget** — Budget / Mid-range / Premium
7. **Travel mode** — own / rental / taxi / public
8. **Group** — solo / couple / friends / family
9. **Walking comfort** — minimal / moderate / comfortable
10. **Pace** — relaxed / balanced / packed
11. **Start time** — early morning / flexible / late start

Keyboard: **Enter** = continue, **Esc** = back.

---

## 5. Recommendation engine

`js/itinerary-engine.js` is rule-based. For every attraction in `URBAN_RETREAT_ATTRACTIONS` it computes a score, then assembles days.

### Scoring (additive)
- **Base** — `priority_score_1_5 * 2`
- **Rec-type fit** — tourist-only gets +6 for non-food/non-night, fun gets +6 for cafes/shopping/adventure/etc.
- **Toggle fit** — if restaurants disabled, food spots get −100 (effectively excluded). Same for nightlife.
- **Category match** — `CATEGORY_MAP` translates the user-facing category labels into substrings to match against `category`, `tags`, and `mood_tags` on each row. Each match adds 2–8.
- **Group fit** — looks at `best_for` and the `couple_friendly`/`family_friendly` flags.
- **Budget fit** — over-budget attractions get −10; under-budget gets a small bump.
- **Walking** — over-intensity gets −6.
- **Start-time bias** — early-morning preference rewards morning-tagged places.

Attractions with a final score ≤ 0 are excluded.

### Day assembly
1. **Cluster picking** — group remaining attractions by `cluster`, order clusters by their highest-scoring item, pick one cluster per day (round-robin if days > clusters).
2. **Time-slot filling** — `planTemplate(schedule)` defines how many items each slot wants. We fill by matching `ideal_time` to slot, then fall back to flex items.
3. **Meal injection** — if `includeRestaurants`, drop a food item into afternoon, then evening/night.
4. **Nightlife injection** — if `includeNightlife`, drop one into night of the last day.

### Tunable knobs
| Where | What |
|---|---|
| `CATEGORY_MAP` | How user labels map to dataset fields. Tweak `catContains` / `tags` / `mood` arrays. |
| `planTemplate` | Items per slot per pace preset. |
| `scoreAttraction` weights | All the `score += N` numbers; easy to recalibrate. |

---

## 6. Data model

`mangalore_attractions.xlsx` → `js/attractions-data.js` via a Python one-liner (see `Convert xlsx to JS` snippet below).

Each row becomes an object with these fields (subset used by the engine):
- `place_name`, `category`, `cluster`, `sub_cluster`
- `tags: string[]`, `mood_tags: string[]`, `best_for: string[]`, `pair_with: string[]`
- `short_description`, `ideal_time`, `best_season`
- `budget_level`, `est_cost_per_person_inr`
- `indoor_outdoor`, `family_friendly`, `couple_friendly`, `rainy_day_ok`
- `nightlife_or_alcohol` (`"Yes" | "No" | "Optional"`)
- `physical_intensity`, `priority_score_1_5`
- `distance_band_from_mangalore`
- `avoid_when`, `booking_or_verification_note`, `source_url`

To regenerate after editing the spreadsheet:

```bash
python -c "
import openpyxl, json, re
wb = openpyxl.load_workbook('mangalore_attractions.xlsx')
ws = wb['Attractions_DB']
rows = list(ws.iter_rows(values_only=True))
h = rows[0]; data = []
for r in rows[1:]:
    d = dict(zip(h, r))
    for k, v in list(d.items()):
        if isinstance(v, str): d[k] = v.strip()
    for lf in ['tags','mood_tags','best_for','pair_with']:
        val = d.get(lf)
        d[lf] = [x.strip() for x in re.split(r'[,;]', val) if x.strip()] if val and isinstance(val, str) else []
    for yn in ['family_friendly','couple_friendly','rainy_day_ok']:
        v = (d.get(yn) or '').lower()
        d[yn] = True if v=='yes' else (False if v=='no' else 'partial')
    data.append(d)
open('js/attractions-data.js','w',encoding='utf-8').write(
    'window.URBAN_RETREAT_ATTRACTIONS = ' + json.dumps(data, indent=2, ensure_ascii=False, default=str) + ';\n')
"
```

---

## 7. AI placeholder

`window.UrbanRetreatAI` exposes:
- `enhanceItinerary(itin, options)` — currently returns input unchanged.
- `explainRecommendation(place, prefs)` — returns `null`.
- `polishBrochureText(text)` — returns input unchanged.
- `isEnabled()` — returns `false`.

The orchestrator (`tourist-helper.js`) awaits `enhanceItinerary` between engine output and rendering, so dropping in a real implementation (e.g. an Anthropic API call) means editing only this one file. Keep the function signatures stable.

---

## 8. Running locally

```powershell
cd C:\01_Projects\urban-homestay-webpage
python -m http.server 8000
```

Open `http://localhost:8000/Tourist%20Helper.html`.

Or use VS Code's **Live Server** extension. Double-clicking the HTML file works for the quiz, but PDF export needs `http://` because `html2canvas` is picky about `file://` origins.

---

## 9. Deploying

FTP upload these files:
- `Tourist Helper.html`
- `css/tourist-helper.css`
- `css/style.css` (the import line was added)
- `js/attractions-data.js`
- `js/itinerary-engine.js`
- `js/ai-enhancer.js`
- `js/tourist-helper.js`
- All updated root `*.html` files (nav now has a Tourist Helper link)

Skip everything in `cp/`, `webalizer/`, `Templates/`, `modlogan/` as usual.

---

## 10. Extending

| Task | Where |
|---|---|
| Add a new attraction | Edit `mangalore_attractions.xlsx`, regenerate `attractions-data.js` (snippet in §6). |
| Add a new category | Add label to `CAT_GROUPS` in `tourist-helper.js`; add a matcher in `CATEGORY_MAP` inside `itinerary-engine.js`. |
| Re-order questions | Reorder `steps[]` in `tourist-helper.js`. The progress bar and X-of-Y count are derived automatically. |
| Add another question | Append to `steps[]`. Single-select uses `type:'single'` with `options[]`. The validity logic in `updateChrome()` handles disabling Continue until something is picked. Tall content is safe — slides flow in normal layout and the card grows to fit. |
| Change pacing density | Edit `planTemplate()` in `itinerary-engine.js`. |
| Plug in an LLM | Implement `UrbanRetreatAI.enhanceItinerary` (and helpers) in `js/ai-enhancer.js`. Don't change call sites in `tourist-helper.js`. |
| Brand the PDF differently | `exportPdf()` in `tourist-helper.js` controls the capture. To add a real text header to the PDF (not an image), use `pdf.text(...)` before `addImage(...)`. |

---

## 11. Known limitations

- No "Custom" duration option (PRD §5.2). Max is 3 days. Adding a free-text option means handling layout for a numeric field, deferred.
- `travelMode` is captured but doesn't yet influence scoring. Hook point is `scoreAttraction()` — easy to add.
- The dataset has Mangalore-area attractions only. Day-trips to Udupi / Dharmastala / Kerala border are tagged with cluster names; the engine treats them as cluster choices but doesn't compute road distance.
- PDF export inlines the full panel as an image — searchable text would require switching to a text-mode jsPDF build (more code, lower fidelity).
- No state persistence — refresh resets the quiz. If you want resume-on-reload, persist `state.answers` to `localStorage` inside `tourist-helper.js`.

---

## 12. Quick sanity check

```bash
node -e "
const fs = require('fs');
const w = {};
new Function('window', fs.readFileSync('js/attractions-data.js','utf8'))(w);
new Function('window', fs.readFileSync('js/itinerary-engine.js','utf8'))(w);
const out = w.UrbanRetreatEngine.generate({
  recType:'both', includeRestaurants:true, includeNightlife:false,
  categories:['Beaches','Sunset spots','Local cuisine'],
  duration:'2', budget:'Mid-range', travelMode:'Own vehicle',
  group:'Couple', walking:'Moderate', schedule:'Balanced', startTime:'Flexible'
});
console.log(out.summary, out.days.map(d => d.day + ':' + d.cluster));
"
```

Should print a summary object and a per-day cluster list.
