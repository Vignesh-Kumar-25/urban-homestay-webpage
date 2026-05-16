/* Urban Retreat — Itinerary Engine
 * Pure-JS scoring + clustering + time-slot + day distribution.
 * Input: prefs object (from questionnaire). Output: structured itinerary.
 */
(function (global) {
  'use strict';

  const ATTRACTIONS = global.URBAN_RETREAT_ATTRACTIONS || [];

  // ====== Helper maps ======

  // Map user-friendly tourist/fun/restaurant/nightlife categories to dataset categories + tag/mood matches
  const CATEGORY_MAP = {
    // Tourist
    'Beaches':            { catContains: ['Beach'], tags: ['beach','sunset'], mood: ['scenic','relaxed','calm'] },
    'Temples':            { catContains: ['Temple','Spiritual'], tags: ['temple','spiritual','heritage'], mood: ['devotional','calm'] },
    'Churches':           { catContains: ['Church'], tags: ['church','heritage'], mood: ['heritage','calm'] },
    'Nature':             { catContains: ['Nature','Park','Lake','River','Garden','Wildlife','Waterfall','Island'], tags: ['nature','greenery','park','walking','wildlife','river','lake','waterfall'], mood: ['calm','green','scenic'] },
    'Historical places':  { catContains: ['Heritage','Fort','Museum','History','Mosque','Dargah','Jain Heritage'], tags: ['heritage','history','museum','fort','colonial'], mood: ['heritage','culture'] },
    'Scenic drives':      { catContains: ['Route','Viewpoint','Drive'], tags: ['drive','scenic','viewpoint','route'], mood: ['scenic'] },
    'Photography spots':  { catContains: ['Viewpoint','Beach','Heritage'], tags: ['photography','sunset','viewpoint','scenic'], mood: ['scenic'] },
    'Hidden gems':        { catContains: [], tags: ['hidden','offbeat','quiet','local'], mood: ['offbeat','quiet','local'] },
    // Fun
    'Cafes':              { catContains: ['Food'], tags: ['cafe','aesthetic','dessert'], mood: ['chill','aesthetic'] },
    'Shopping':           { catContains: ['Mall','Shopping','Market','Street'], tags: ['shopping','market','mall'], mood: ['active'] },
    'Water activities':   { catContains: ['Water','Adventure','Beach'], tags: ['water_sports','adventure','jetski','boating','swimming'], mood: ['active'] },
    'Adventure':          { catContains: ['Adventure','Trek'], tags: ['adventure','trek','hike'], mood: ['active'] },
    'Relaxation':         { catContains: ['Beach','Park','Nature','Garden'], tags: ['quiet','calm','relaxing','sunset','tree_park'], mood: ['calm','relaxed','quiet'] },
    'Sunset spots':       { catContains: ['Beach','Viewpoint'], tags: ['sunset','viewpoint'], mood: ['scenic','romantic'] },
    'Night drives':       { catContains: ['Route','Drive','Nightlife'], tags: ['drive','night'], mood: ['scenic'] },
    'Couple spots':       { catContains: [], tags: ['couples','romantic','sunset'], mood: ['romantic','calm'] },
    'Family activities':  { catContains: ['Wildlife','Water','Park','Science','Planetarium','Nature'], tags: ['family','kids'], mood: ['family'] },
    // Restaurant
    'Seafood':            { catContains: ['Food'], tags: ['seafood'], mood: [] },
    'Local cuisine':      { catContains: ['Food'], tags: ['local','mangalorean','udupi','coastal'], mood: [] },
    'Vegetarian':         { catContains: ['Food'], tags: ['vegetarian','udupi'], mood: [] },
    'Halal':              { catContains: ['Food'], tags: ['halal','muslim','beary'], mood: [] },
    'Fine dining':        { catContains: ['Food'], tags: ['fine_dining','premium'], mood: [] },
    'Cheap eats':         { catContains: ['Food','Market'], tags: ['street_food','cheap','market'], mood: [] },
    'Aesthetic cafes':    { catContains: ['Food'], tags: ['cafe','aesthetic'], mood: ['aesthetic'] },
    'Rooftop dining':     { catContains: ['Food'], tags: ['rooftop'], mood: [] },
    'Dessert spots':      { catContains: ['Food/Dessert','Food'], tags: ['dessert','ice_cream','gadbad'], mood: [] },
    // Nightlife
    'Bars':               { catContains: ['Nightlife'], tags: ['bar'], mood: [] },
    'Lounges':            { catContains: ['Nightlife'], tags: ['lounge'], mood: [] },
    'Pubs':               { catContains: ['Nightlife'], tags: ['pub'], mood: [] },
    'Live music':         { catContains: ['Nightlife'], tags: ['live_music'], mood: [] },
    'Late-night cafes':   { catContains: ['Food','Nightlife'], tags: ['late_night','cafe'], mood: [] },
  };

  // Group-type → suitability tags
  const GROUP_TAGS = {
    'Solo':   ['solo','first-time visitors'],
    'Couple': ['couples','romantic'],
    'Friends':['friends','groups'],
    'Family': ['families','kids','family'],
  };

  // Budget level mapping
  const BUDGET_RANK = { 'Free': 0, 'Free/Low': 0, 'Free/Variable': 0, 'Low': 1, 'Low/Medium': 1, 'Low/Variable': 1, 'Medium': 2, 'Medium/High': 3, 'High': 3, 'Variable': 1 };
  const USER_BUDGET_MAX = { 'Budget': 1, 'Mid-range': 2, 'Premium': 3 };

  // Intensity rank for walking-comfort filter
  const INTENSITY_RANK = { 'Low': 1, 'Low/Medium': 2, 'Medium': 2, 'Medium/High': 3, 'High': 3 };
  const USER_WALK_MAX = { 'Minimal walking': 1, 'Moderate': 2, 'Comfortable walking': 3 };

  // Time slot bucket from ideal_time
  function timeSlotOf(ideal) {
    if (!ideal) return 'flex';
    const t = ideal.toLowerCase();
    if (t.includes('night')) return 'night';
    if (t.includes('evening') || t.includes('sunset')) return 'evening';
    if (t.includes('early morning') || t.includes('morning')) return 'morning';
    if (t.includes('afternoon') || t.includes('lunch')) return 'afternoon';
    return 'flex';
  }

  // Day duration plan — number of items per slot
  function planTemplate(schedule) {
    if (schedule === 'Relaxed')  return { morning: 1, afternoon: 1, evening: 1, night: 1 };
    if (schedule === 'Packed')   return { morning: 2, afternoon: 2, evening: 2, night: 1 };
    return { morning: 2, afternoon: 1, evening: 2, night: 1 }; // Balanced
  }

  // ====== Scoring ======
  function scoreAttraction(a, prefs) {
    let score = 0;
    const cats = new Set(prefs.categories || []);
    const recType = prefs.recType; // 'tourist'|'fun'|'both'
    const groupTags = GROUP_TAGS[prefs.group] || [];

    // Base priority from dataset (1-5)
    score += (a.priority_score_1_5 || 3) * 2;

    // Recommendation type weighting
    const isFood = (a.category || '').toLowerCase().includes('food') || (a.category || '').toLowerCase().includes('market');
    const isNight = (a.nightlife_or_alcohol === 'Yes');
    const isFun = ['Mall/Shopping','Water Park','Adventure/Water','Event/Fairground','Street/Market'].includes(a.category) ||
                  (a.tags || []).some(t => ['shopping','cafe','aesthetic','adventure','water_sports','dessert'].includes(t));

    if (recType === 'tourist' && !isFood && !isNight) score += 6;
    if (recType === 'fun' && (isFun || isFood)) score += 6;
    if (recType === 'both') score += 3;

    // Restaurants explicit toggle
    if (isFood && !prefs.includeRestaurants) score -= 100; // effectively excluded
    if (isFood && prefs.includeRestaurants) score += 4;

    // Nightlife explicit toggle
    if (isNight && !prefs.includeNightlife) score -= 100;
    if (isNight && prefs.includeNightlife) score += 4;
    if (a.nightlife_or_alcohol === 'Optional' && prefs.includeNightlife) score += 1;

    // Category match
    cats.forEach(c => {
      const m = CATEGORY_MAP[c];
      if (!m) return;
      // Category substring match
      if (m.catContains.some(s => (a.category || '').toLowerCase().includes(s.toLowerCase()))) score += 8;
      // Tag match
      const tagSet = new Set((a.tags || []).map(t => t.toLowerCase()));
      m.tags.forEach(t => { if (tagSet.has(t.toLowerCase())) score += 3; });
      // Mood match
      const moodSet = new Set((a.mood_tags || []).map(t => t.toLowerCase()));
      m.mood.forEach(t => { if (moodSet.has(t.toLowerCase())) score += 2; });
    });

    // Group fit (best_for)
    const bestFor = (a.best_for || []).map(s => s.toLowerCase());
    groupTags.forEach(t => { if (bestFor.some(b => b.includes(t.toLowerCase()))) score += 4; });
    if (prefs.group === 'Couple' && a.couple_friendly === true) score += 3;
    if (prefs.group === 'Family' && a.family_friendly === true) score += 3;

    // Budget fit
    const aBud = BUDGET_RANK[a.budget_level] ?? 1;
    const userMax = USER_BUDGET_MAX[prefs.budget] ?? 2;
    if (aBud > userMax) score -= 10;
    else score += (userMax - aBud); // cheaper-than-cap gets small bump

    // Walking intensity vs comfort
    const aInt = INTENSITY_RANK[a.physical_intensity] ?? 2;
    const walkMax = USER_WALK_MAX[prefs.walking] ?? 3;
    if (aInt > walkMax) score -= 6;

    // Start time bias
    const slot = timeSlotOf(a.ideal_time);
    if (prefs.startTime === 'Early morning' && slot === 'morning') score += 2;
    if (prefs.startTime === 'Late start' && slot === 'morning') score -= 2;

    return score;
  }

  // ====== Cluster picking (distance optimization) ======
  function pickClusterOrder(scored, days) {
    // Group top-scoring attractions by cluster, ordered by best score within cluster.
    const byCluster = {};
    scored.forEach(s => {
      const c = s.attr.cluster || 'Other';
      (byCluster[c] = byCluster[c] || []).push(s);
    });
    // Order clusters by their top item's score (desc)
    const clusters = Object.keys(byCluster).sort((a, b) => byCluster[b][0].score - byCluster[a][0].score);
    // Assign one cluster per day where possible (rotate if fewer clusters)
    const order = [];
    for (let i = 0; i < days; i++) {
      order.push(clusters[i % clusters.length]);
    }
    return { order, byCluster };
  }

  // ====== Slot assignment within a day ======
  function fillDay(pool, template, usedNames) {
    const slots = { morning: [], afternoon: [], evening: [], night: [] };

    function tryFill(slotKey, max) {
      // Candidates: ideal_time matches OR flex
      const exact = pool.filter(p => !usedNames.has(p.attr.place_name) && timeSlotOf(p.attr.ideal_time) === slotKey);
      const flex  = pool.filter(p => !usedNames.has(p.attr.place_name) && timeSlotOf(p.attr.ideal_time) === 'flex');
      const ordered = [...exact, ...flex];
      for (const item of ordered) {
        if (slots[slotKey].length >= max) break;
        slots[slotKey].push(item);
        usedNames.add(item.attr.place_name);
      }
    }

    tryFill('morning', template.morning);
    tryFill('afternoon', template.afternoon);
    tryFill('evening', template.evening);
    tryFill('night', template.night);
    return slots;
  }

  // ====== Restaurant injection ======
  function injectMeals(slots, foodPool, usedNames) {
    // Try to add a food spot for breakfast/lunch/dinner if available and not over-stuffed.
    const haveFood = foodPool.length > 0;
    if (!haveFood) return slots;

    function pickFood() {
      for (const f of foodPool) {
        if (!usedNames.has(f.attr.place_name)) {
          usedNames.add(f.attr.place_name);
          return f;
        }
      }
      return null;
    }

    // Lunch in afternoon, dinner in evening/night
    if (slots.afternoon.length > 0) {
      const f = pickFood();
      if (f) slots.afternoon.push(f);
    }
    if (slots.evening.length > 0 || slots.night.length > 0) {
      const f = pickFood();
      if (f) {
        if (slots.night.length === 0 && slots.evening.length >= 2) slots.night.push(f);
        else slots.evening.push(f);
      }
    }
    return slots;
  }

  // ====== Nightlife injection ======
  function injectNightlife(slots, nightPool, usedNames) {
    if (!nightPool.length) return slots;
    const n = nightPool.find(x => !usedNames.has(x.attr.place_name));
    if (n) {
      usedNames.add(n.attr.place_name);
      slots.night.push(n);
    }
    return slots;
  }

  // ====== Public API ======
  function generate(prefs) {
    const days = Math.max(1, parseInt(prefs.duration, 10) || 1);

    // Score everything
    const scored = ATTRACTIONS.map(a => ({ attr: a, score: scoreAttraction(a, prefs) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    // Separate pools
    const isFoodAttr  = a => (a.category || '').toLowerCase().includes('food') || (a.category || '').toLowerCase().includes('market');
    const isNightAttr = a => a.nightlife_or_alcohol === 'Yes';

    const sightseeing = scored.filter(s => !isFoodAttr(s.attr) && !isNightAttr(s.attr));
    const foodPool    = prefs.includeRestaurants ? scored.filter(s => isFoodAttr(s.attr)) : [];
    const nightPool   = prefs.includeNightlife   ? scored.filter(s => isNightAttr(s.attr)) : [];

    // Cluster strategy
    const { order, byCluster } = pickClusterOrder(sightseeing, days);
    const template = planTemplate(prefs.schedule);
    const usedNames = new Set();
    const dayPlans = [];

    for (let d = 0; d < days; d++) {
      const cluster = order[d];
      // Pool = items from that cluster + spillover from next-best cluster if too few
      let pool = (byCluster[cluster] || []).slice();
      if (pool.length < 4) {
        // Fill with high-scoring items from any cluster
        for (const s of sightseeing) {
          if (pool.length >= 8) break;
          if (!pool.includes(s)) pool.push(s);
        }
      }
      let slots = fillDay(pool, template, usedNames);
      slots = injectMeals(slots, foodPool, usedNames);
      if (d === days - 1 || days === 1) {
        slots = injectNightlife(slots, nightPool, usedNames);
      }
      dayPlans.push({ day: d + 1, cluster: cluster, slots: slots });
    }

    // Overview stats
    const allPicked = dayPlans.flatMap(d => [].concat(d.slots.morning, d.slots.afternoon, d.slots.evening, d.slots.night));
    const totalCost = allPicked.reduce((acc, p) => acc + (p.attr.est_cost_per_person_inr || 0), 0);
    const totalMin  = allPicked.reduce((acc, p) => acc + (p.attr.suggested_duration_min || 60), 0);

    return {
      prefs: prefs,
      generatedAt: new Date().toISOString(),
      days: dayPlans,
      summary: {
        styleSummary: buildStyleSummary(prefs),
        totalLocations: allPicked.length,
        estCostPerPerson: totalCost,
        approxTravelHours: Math.round((totalMin / 60) * 10) / 10,
        budget: prefs.budget,
        group: prefs.group,
        schedule: prefs.schedule,
      },
    };
  }

  function buildStyleSummary(prefs) {
    const parts = [];
    if (prefs.recType === 'tourist') parts.push('Tourist-focused');
    if (prefs.recType === 'fun') parts.push('Fun & activities');
    if (prefs.recType === 'both') parts.push('Mixed sightseeing & fun');
    if (prefs.group) parts.push(prefs.group.toLowerCase() + ' trip');
    if (prefs.schedule) parts.push(prefs.schedule.toLowerCase() + ' pace');
    return parts.join(' · ');
  }

  global.UrbanRetreatEngine = { generate: generate, timeSlotOf: timeSlotOf };
})(window);
