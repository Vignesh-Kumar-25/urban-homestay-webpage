# Product Requirements Document (PRD)
## Urban Retreat Tourist Helper Chatbot

---

# 1. Overview

The Urban Retreat Tourist Helper Chatbot is an embedded conversational itinerary planner for the Urban Retreat homestay website.

The chatbot asks users progressive one-by-one questions about:
- trip preferences
- interests
- food preferences
- nightlife preferences
- travel constraints

It then generates:
- a personalized Mangalore itinerary
- recommended places
- optimized daily schedule
- optional restaurant and nightlife additions

The generated itinerary can be:
- viewed interactively
- expanded through dropdown sections
- downloaded as PDF

The chatbot UI and styling should match the current Urban Retreat website aesthetics, visual identity, spacing, typography, and overall design language.

---

# 2. Important Notes

- The schemas, scoring logic, and recommendation logic in this document are example structures and implementation directions only.
- The implementation is allowed to use better or more state-of-the-art methods if they improve itinerary quality, recommendation intelligence, brochure generation, or overall user experience.
- AI-generated recommendation reasoning and brochure enhancement should remain a later-insertable placeholder and should NOT be fully implemented in the MVP.

---

# 3. Main Product Goal

Help tourists quickly discover:
- places to visit
- things to do
- restaurants
- nightlife
- hidden gems

while optimizing:
- convenience
- pacing
- category preference
- distance grouping
- trip duration

without overwhelming users with manual research.

---

# 4. Core User Flow

## Step 1 — Entry Question

Bot asks:

> “What kind of recommendations are you looking for?”

Options:
- Mangalore tourist spots
- General fun activities
- Both

This determines:
- recommendation weighting
- itinerary generation logic
- database filtering priority

---

## Step 2 — Optional Add-ons

### Include restaurants?
Toggle:
- Yes
- No

If enabled:
show cuisine preferences.

---

### Show alcohol & nightlife locations?
Collapsed by default.

If enabled:
show:
- pubs
- lounges
- bars
- nightlife cafes
- breweries

This section remains hidden unless explicitly enabled.

---

# 5. Questionnaire Structure

## 5.1 Category Selection

Multi-select categories.

### Tourist Categories
- Beaches
- Temples
- Churches
- Nature
- Historical places
- Scenic drives
- Photography spots
- Hidden gems

### Fun Categories
- Cafes
- Shopping
- Water activities
- Adventure
- Relaxation
- Sunset spots
- Night drives
- Couple spots
- Family activities

### Restaurant Categories
- Seafood
- Local cuisine
- Vegetarian
- Halal
- Fine dining
- Cheap eats
- Aesthetic cafes
- Rooftop dining
- Dessert spots

### Nightlife Categories
(hidden unless enabled)
- Bars
- Lounges
- Pubs
- Live music
- Late-night cafes

---

## 5.2 Practical Constraints

### Trip Duration
- 1 day
- 2 days
- 3 days
- Custom

### Budget
- Budget
- Mid-range
- Premium

### Travel Mode
- Own vehicle
- Rental vehicle
- Taxi only
- Public transport

### Group Type
- Solo
- Couple
- Friends
- Family

### Walking Comfort
- Minimal walking
- Moderate
- Comfortable walking

### Preferred Schedule
- Relaxed
- Balanced
- Packed

### Preferred Start Time
- Early morning
- Flexible
- Late start

---

# 6. Recommendation Engine

The chatbot uses a rule-based weighted scoring engine.

Each attraction in the database contains:
- tags
- category
- estimated duration
- ideal visit time
- budget level
- crowd level
- location cluster
- activity intensity
- restaurant/nightlife metadata

---

# 7. Attraction Database Structure

Example schema:

```json
{
  "name": "Tannirbhavi Beach",
  "category": "beach",
  "tags": [
    "sunset",
    "relaxing",
    "couples",
    "nature"
  ],
  "ideal_visit_time": "evening",
  "time_required_hours": 2,
  "budget_level": "low",
  "location_cluster": "north_mangalore",
  "walking_intensity": "low",
  "crowd_level": "medium",
  "suitable_for": [
    "couples",
    "friends",
    "solo"
  ]
}
```

---

# 8. Scoring Logic

Each user selection increases attraction scores.

Example:

```python
scores["Tannirbhavi Beach"] += 10
scores["Panambur Beach"] += 5
scores["Surathkal Lighthouse"] += 8
```

The engine ranks attractions by:
- preference match
- pacing compatibility
- distance efficiency
- time-of-day suitability
- budget fit

---

# 9. Itinerary Generation Logic

## 9.1 Time-Based Planning

### Morning
Prioritize:
- temples
- breakfast spots
- sightseeing
- low-heat activities

### Afternoon
Prioritize:
- cafes
- indoor places
- shopping
- lunch

### Evening
Prioritize:
- beaches
- sunset locations
- scenic drives
- rooftop restaurants

### Night
Prioritize:
- nightlife
- dinner
- cafes

---

## 9.2 Distance Optimization

System clusters nearby locations together.

Avoid:
- unnecessary city-crossing
- inefficient travel
- exhausting schedules

Example cluster:
- Tannirbhavi Beach
- Sultan Battery
- nearby seafood restaurant

---

## 9.3 Energy Management

Avoid overly exhausting plans.

System balances:
- active locations
- rest periods
- food breaks
- travel time

---

# 10. Final Output Structure

Generated itinerary includes:

## Overview
- trip style summary
- estimated budget
- total locations
- approximate travel time

---

## Day-wise Plan

Example:

### Day 1

#### Morning
Kadri Temple  
Breakfast at local cafe

#### Afternoon
Pilikula Biological Park  
Lunch nearby

#### Evening
Tannirbhavi Beach sunset

#### Night
Seafood dinner

---

# 11. Expandable Dropdown Details

Each itinerary item contains expandable details:

### Place Details Dropdown
- why recommended
- estimated duration
- ideal visit time
- crowd level
- budget estimate
- Google Maps link
- nearby alternatives
- tips/warnings

### Restaurant Dropdown
- cuisine
- pricing
- vegetarian/halal availability
- best dishes

### Nightlife Dropdown
(hidden unless enabled)
- type
- atmosphere
- timing
- alcohol availability

---

# 12. PDF Export

User can download:
- complete itinerary
- timings
- recommendations
- maps links
- estimated costs

Format:
- clean mobile-friendly PDF
- printable
- branded with Urban Retreat

---

# 13. AI Placeholder Layer

The architecture should leave a clean placeholder layer for future AI enhancements.

Possible future AI usage:
- natural recommendation explanations
- brochure text enhancement
- conversational refinement
- smarter itinerary optimization
- personalized summaries

This AI layer should remain modular and optional.

The MVP should NOT depend on AI for core recommendation logic.

---

# 14. Tech Stack

The Urban Retreat website is a fully static site deployed via FTP to shared hosting (no Node/Python runtime, only PHP). The chatbot is therefore implemented **entirely client-side** so it can ship through the existing deployment pipeline with zero new infrastructure.

## Frontend
- New page `Tourist Helper.html` (sits alongside other root-level HTML pages)
- Linked from the main nav and mobile menu on every page
- Reuses existing header/footer markup, design tokens (`css/variables.css`), button/card components, and floating WhatsApp + back-to-top buttons
- Chatbot-specific styles in `css/tourist-helper.css` (imported from `css/style.css`)
- Mobile-responsive; matches site typography (Playfair Display / Inter / Poppins) and palette (ocean blue, coral, sand, sea-foam, shell)

## Recommendation engine
- Pure JavaScript, runs in the browser
- `js/tourist-helper.js` — questionnaire flow, state machine, rendering
- `js/itinerary-engine.js` — scoring + clustering + time-slot + day distribution
- `js/ai-enhancer.js` — modular placeholder for future LLM calls (`aiEnhanceItinerary` returns input unchanged in MVP)

## Database
- `js/attractions-data.js` — JSON array of Mangalore attractions, generated from `mangalore_attractions.xlsx`
- No server-side database. Future expansion may migrate this file into a backing service.

## PDF Generation
- Client-side via **jsPDF** + **html2canvas** loaded from CDN
- `@media print` styles let users fall back to browser print-to-PDF
- Output branded as "Urban Retreat — Your Mangalore Itinerary"

---

# 15. MVP Scope

## Included
- Progressive questionnaire
- Database-driven recommendations
- Weighted scoring
- Fixed itinerary generation
- PDF export
- Expandable details
- Restaurant support
- Optional nightlife support

## Excluded
- Real-time bookings
- Google Maps live APIs
- Conversational itinerary editing
- User accounts
- Dynamic AI planning
- Real-time weather adaptation

---

# 16. Future Expansion

Potential future upgrades:
- conversational itinerary editing
- live weather optimization
- crowd prediction
- traffic-aware routing
- live restaurant availability
- multilingual support

---

# 17. Success Criteria

The product is successful if users can:
- quickly generate a useful itinerary
- easily discover places matching their interests
- download and use the generated plan
- explore Mangalore with less manual planning effort
