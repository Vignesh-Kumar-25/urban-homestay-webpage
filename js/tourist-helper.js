/* Urban Retreat — Tourist Helper (slide-deck UI)
 *
 * One-question-per-slide flow with a progress bar. On completion,
 * the quiz view is swapped for a polished itinerary view that the
 * user can download as PDF or print.
 *
 * Dependencies:
 *   - window.URBAN_RETREAT_ATTRACTIONS  (attractions-data.js)
 *   - window.UrbanRetreatEngine          (itinerary-engine.js)
 *   - window.UrbanRetreatAI              (ai-enhancer.js)
 *   - jsPDF + html2canvas (loaded via CDN on Tourist Helper.html)
 */
(function () {
  'use strict';

  // ============================================================
  // Icon library — small stroke SVGs that match the site style
  // ============================================================
  const I = {
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v4M7 19H3"/></svg>',
    grid:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    fork:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v6a2 2 0 002 2v12M10 2v6a2 2 0 01-2 2"/><path d="M17 2v20M21 2v8a4 4 0 01-4 4"/></svg>',
    skip:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
    moon:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    rupee:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h11M7 9h11M7 5c4 0 7 1.8 7 4S11 13 7 13h-1l9 8"/></svg>',
    car:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17l1.5-5h11L19 17M5 17v3M19 17v3"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
    key:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15L19 4M18 5l3 3M15 8l3 3"/></svg>',
    taxi:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="7" rx="1"/><path d="M5 11l1.5-4h11L19 11M10 4h4"/><circle cx="7" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/></svg>',
    bus:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="9" y2="20"/><line x1="15" y1="18" x2="15" y2="20"/></svg>',
    user:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    couple:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6M12 20c0-3.5 2-6 4-6s5 2.5 5 6"/></svg>',
    friends: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2"/><path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6M15 19c0-2.5 1.5-4 3-4s3 1.5 3 4"/></svg>',
    family:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="14" r="2.5"/><path d="M2 20c0-3 2-5 5-5s5 2 5 5M12 20c0-3 2-5 5-5s5 2 5 5"/></svg>',
    foot:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4c1.5 0 2.5 1.5 2.5 3.5S9.5 11 8 11s-2.5-1.5-2.5-3.5S6.5 4 8 4z"/><path d="M14 12c1 0 2 1 2 2.5S15 17 14 17s-2-1-2-2.5S13 12 14 12z"/><path d="M6 15c1 0 1.5 1 1.5 2S7 19 6 19s-1.5-1-1.5-2S5 15 6 15z"/><path d="M11 8c.8 0 1.5.8 1.5 2s-.7 2-1.5 2-1.5-.8-1.5-2 .7-2 1.5-2z"/></svg>',
    gauge:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><polyline points="12 8 12 12 15 14"/></svg>',
    leaf:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 014 13c0-3.7 5-9 11-9 0 4.5-1 11-4 16zM4 13c4 0 7 3 7 7"/></svg>',
    bolt:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>',
    sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 00-10 0M12 2v6M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4"/></svg>',
    sun:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    sunset:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 00-10 0M12 9V2M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M16 5l-4 4-4-4"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    print:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15A9 9 0 1119.7 8.7L23 12"/></svg>',
    map:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  // ============================================================
  // Step definitions
  // ============================================================
  const steps = [
    {
      id: 'recType',
      label: 'Style',
      eyebrow: 'Trip style',
      title: 'What kind of recommendations are you after?',
      help: "We'll weight your itinerary toward what you pick — you can always change this later.",
      type: 'single',
      layout: 'three',
      options: [
        { value: 'tourist', label: 'Mangalore tourist spots',    hint: 'Heritage, temples, beaches, lighthouses.', icon: I.compass },
        { value: 'fun',     label: 'General fun & activities',   hint: 'Cafes, shopping, water sports, drives.',  icon: I.sparkle },
        { value: 'both',    label: 'A mix of both',              hint: 'Best of sightseeing and casual fun.',     icon: I.grid    },
      ],
    },
    {
      id: 'includeRestaurants',
      label: 'Food',
      eyebrow: 'Food',
      title: 'Should we add food spots to your plan?',
      help: 'Restaurants, cafes, dessert shops and street food.',
      type: 'single',
      layout: 'two',
      options: [
        { value: true,  label: 'Yes, add food spots', hint: 'Mix in cafes, restaurants and local cuisine.', icon: I.fork },
        { value: false, label: 'Skip food',            hint: "I'll plan meals on my own.",                  icon: I.skip },
      ],
    },
    {
      id: 'includeNightlife',
      label: 'Nightlife',
      eyebrow: 'Nightlife',
      title: 'Want alcohol & nightlife options?',
      help: 'Pubs, lounges, bars and late-night spots. Hidden by default.',
      type: 'single',
      layout: 'two',
      options: [
        { value: false, label: 'No thanks',           hint: 'Keep nightlife out of the plan.',          icon: I.skip },
        { value: true,  label: 'Yes, show nightlife', hint: 'Add a couple of pubs/lounges as options.', icon: I.moon },
      ],
    },
    {
      id: 'categories',
      label: 'Interests',
      eyebrow: 'Your interests',
      title: 'Pick the categories that interest you',
      help: "Tap as many as you like. Skip to include everything for the recommendation types you picked.",
      type: 'multi',
      layout: 'chips',
      dynamic: true,
      allowSkip: true,
      skipMeansAll: true,
    },
    {
      id: 'duration',
      label: 'Days',
      eyebrow: 'Trip length',
      title: 'How many days are you exploring?',
      type: 'single',
      layout: 'three',
      options: [
        { value: '1', label: '1 day',  hint: 'Quick day-trip — best for one cluster.',     icon: I.calendar },
        { value: '2', label: '2 days', hint: 'A short weekend covering more ground.',      icon: I.calendar },
        { value: '3', label: '3 days', hint: 'A relaxed long-weekend with day-trips.',     icon: I.calendar },
      ],
    },
    {
      id: 'budget',
      label: 'Budget',
      eyebrow: 'Budget',
      title: "What's your overall spending vibe?",
      type: 'single',
      layout: 'three',
      options: [
        { value: 'Budget',    label: 'Budget',    hint: 'Free attractions, street food, public spots.', icon: I.rupee },
        { value: 'Mid-range', label: 'Mid-range', hint: 'Sit-down meals and a few paid experiences.',   icon: I.rupee },
        { value: 'Premium',   label: 'Premium',   hint: 'Fine dining, splurge experiences welcome.',    icon: I.rupee },
      ],
    },
    {
      id: 'travelMode',
      label: 'Travel',
      eyebrow: 'Getting around',
      title: 'How will you get around?',
      type: 'single',
      layout: 'four',
      options: [
        { value: 'Own vehicle',     label: 'Own vehicle',     hint: 'Full flexibility on routes & timing.',     icon: I.car  },
        { value: 'Rental vehicle', label: 'Rental vehicle',   hint: 'Self-drive or bike for the trip.',         icon: I.key  },
        { value: 'Taxi only',      label: 'Taxi / cab',        hint: 'Point-to-point comfort, no parking hassles.', icon: I.taxi },
        { value: 'Public transport', label: 'Public transport', hint: 'Buses and shared rides.',                  icon: I.bus  },
      ],
    },
    {
      id: 'group',
      label: 'Group',
      eyebrow: 'Travel party',
      title: "Who's coming with you?",
      type: 'single',
      layout: 'four',
      options: [
        { value: 'Solo',    label: 'Solo',    hint: 'Travelling alone.',                   icon: I.user    },
        { value: 'Couple',  label: 'Couple',  hint: 'Romantic getaway for two.',           icon: I.couple  },
        { value: 'Friends', label: 'Friends', hint: 'A group of friends — chill & active.', icon: I.friends },
        { value: 'Family',  label: 'Family',  hint: 'With kids or older family members.',  icon: I.family  },
      ],
    },
    {
      id: 'walking',
      label: 'Walking',
      eyebrow: 'Comfort',
      title: 'How much walking are you up for?',
      type: 'single',
      layout: 'three',
      options: [
        { value: 'Minimal walking',    label: 'Minimal',    hint: 'Mostly drive-up, gentle stops.',          icon: I.foot },
        { value: 'Moderate',           label: 'Moderate',   hint: 'Some walking between stops is fine.',     icon: I.foot },
        { value: 'Comfortable walking', label: 'Comfortable', hint: 'Treks and long walks welcome.',          icon: I.foot },
      ],
    },
    {
      id: 'schedule',
      label: 'Pace',
      eyebrow: 'Pacing',
      title: 'How packed should your days be?',
      type: 'single',
      layout: 'three',
      options: [
        { value: 'Relaxed',  label: 'Relaxed',  hint: '2–3 stops a day, lots of downtime.', icon: I.leaf  },
        { value: 'Balanced', label: 'Balanced', hint: 'A solid mix of activity and rest.',  icon: I.gauge },
        { value: 'Packed',   label: 'Packed',   hint: 'Maximise — see as much as possible.', icon: I.bolt  },
      ],
    },
    {
      id: 'startTime',
      label: 'Start',
      eyebrow: 'Daily start',
      title: 'When do you like to start each day?',
      type: 'single',
      layout: 'three',
      options: [
        { value: 'Early morning', label: 'Early morning', hint: 'Sunrise temples & breakfast strolls.', icon: I.sunrise },
        { value: 'Flexible',      label: 'Flexible',      hint: 'Whenever works — no fixed start.',     icon: I.sun     },
        { value: 'Late start',    label: 'Late start',    hint: 'Slow mornings, plans kick off mid-day.', icon: I.sunset  },
      ],
    },
  ];

  // Categories shown for the multi-select step (dynamic on toggles)
  const CAT_GROUPS = {
    tourist:     ['Beaches','Temples','Churches','Nature','Historical places','Scenic drives','Photography spots','Hidden gems'],
    fun:         ['Cafes','Shopping','Water activities','Adventure','Relaxation','Sunset spots','Night drives','Couple spots','Family activities'],
    restaurants: ['Seafood','Local cuisine','Vegetarian','Halal','Fine dining','Cheap eats','Aesthetic cafes','Rooftop dining','Dessert spots'],
    nightlife:   ['Bars','Lounges','Pubs','Live music','Late-night cafes'],
  };

  // ============================================================
  // State
  // ============================================================
  const state = {
    stepIdx: 0,
    answers: {},
  };

  // DOM refs
  let elSlides, elProgressFill, elStepCurrent, elStepTotal, elStepLabel,
      elBack, elNext, elFootHint,
      elQuiz, elLoading, elResult;

  // ============================================================
  // Utilities
  // ============================================================
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function categoryPool() {
    let pool = [];
    if (state.answers.recType === 'tourist' || state.answers.recType === 'both') pool = pool.concat(CAT_GROUPS.tourist);
    if (state.answers.recType === 'fun'     || state.answers.recType === 'both') pool = pool.concat(CAT_GROUPS.fun);
    if (state.answers.includeRestaurants) pool = pool.concat(CAT_GROUPS.restaurants);
    if (state.answers.includeNightlife)   pool = pool.concat(CAT_GROUPS.nightlife);
    return Array.from(new Set(pool));
  }

  // ============================================================
  // Slide rendering
  // ============================================================
  function buildSlide(idx) {
    const step = steps[idx];
    const slide = el('div', 'th-slide');
    slide.dataset.stepId = step.id;

    slide.appendChild(el('span', 'th-slide__eyebrow', escapeHtml(step.eyebrow)));
    slide.appendChild(el('h2', 'th-slide__title', escapeHtml(step.title)));
    if (step.help) slide.appendChild(el('p', 'th-slide__help', escapeHtml(step.help)));

    const opts = el('div',
      'th-options' + (step.layout === 'three' ? ' th-options--three'
                    : step.layout === 'four'  ? ' th-options--four'
                    : step.layout === 'chips' ? ' th-options--chips' : ''));

    if (step.type === 'single') {
      step.options.forEach(o => opts.appendChild(buildTile(step, o)));
    } else {
      // multi (categories)
      const pool = categoryPool();
      if (!pool.length) {
        opts.appendChild(el('p', null, 'No categories to pick — go back and adjust your choices.'));
      }
      pool.forEach(label => opts.appendChild(buildChip(step, label)));
    }

    slide.appendChild(opts);
    return slide;
  }

  function buildTile(step, opt) {
    const isSelected = optionMatches(step, opt.value);
    const btn = el('button',
      'th-tile' + (isSelected ? ' th-tile--selected' : ''));
    btn.type = 'button';
    btn.innerHTML =
      '<span class="th-tile__icon">' + (opt.icon || I.compass) + '</span>' +
      '<span class="th-tile__text">' +
        '<span class="th-tile__label">' + escapeHtml(opt.label) + '</span>' +
        (opt.hint ? '<span class="th-tile__hint">' + escapeHtml(opt.hint) + '</span>' : '') +
      '</span>' +
      '<span class="th-tile__check">' + I.check + '</span>';
    btn.addEventListener('click', () => {
      state.answers[step.id] = opt.value;
      // visual feedback
      btn.parentElement.querySelectorAll('.th-tile').forEach(t => t.classList.remove('th-tile--selected'));
      btn.classList.add('th-tile--selected');
      updateChrome();
    });
    return btn;
  }

  function buildChip(step, label) {
    const arr = state.answers[step.id] || [];
    const isSelected = Array.isArray(arr) && arr.indexOf(label) !== -1;
    const btn = el('button',
      'th-chip' + (isSelected ? ' th-chip--selected' : ''));
    btn.type = 'button';
    btn.innerHTML =
      '<span class="th-chip__dot" aria-hidden="true"></span>' +
      escapeHtml(label);
    btn.addEventListener('click', () => {
      const cur = state.answers[step.id] || [];
      const i = cur.indexOf(label);
      if (i === -1) cur.push(label); else cur.splice(i, 1);
      state.answers[step.id] = cur;
      btn.classList.toggle('th-chip--selected');
      updateChrome();
    });
    return btn;
  }

  function optionMatches(step, value) {
    const got = state.answers[step.id];
    return got !== undefined && got === value;
  }

  // ============================================================
  // Navigation
  //
  // Slides live in normal document flow (no absolute positioning),
  // so tall slides expand the container and the footer always stays
  // below them. Transitions are serial: fade out the old slide, then
  // mount and fade in the new one. Total ≈ 260 ms.
  // ============================================================
  let isTransitioning = false;

  function gotoStep(newIdx, direction) {
    if (isTransitioning) return;
    direction = direction || (newIdx > state.stepIdx ? 'forward' : 'back');
    isTransitioning = true;

    const oldSlide = elSlides.querySelector('.th-slide--active');

    const mountNew = () => {
      const newSlide = buildSlide(newIdx);
      newSlide.classList.add(direction === 'forward' ? 'th-slide--enter-right' : 'th-slide--enter-left');
      elSlides.appendChild(newSlide);

      // double rAF so the enter classes paint before we swap to active
      requestAnimationFrame(() => requestAnimationFrame(() => {
        newSlide.classList.remove('th-slide--enter-right', 'th-slide--enter-left');
        newSlide.classList.add('th-slide--active');
        setTimeout(() => { isTransitioning = false; }, 260);
      }));

      state.stepIdx = newIdx;
      updateChrome();
    };

    if (oldSlide) {
      oldSlide.classList.remove('th-slide--active');
      oldSlide.classList.add(direction === 'forward' ? 'th-slide--leave-left' : 'th-slide--leave-right');
      setTimeout(() => {
        oldSlide.remove();
        mountNew();
      }, 240);
    } else {
      mountNew();
    }
  }

  function updateChrome() {
    const step = steps[state.stepIdx];
    elStepCurrent.textContent = String(state.stepIdx + 1);
    elStepTotal.textContent = String(steps.length);
    elStepLabel.textContent = step.label;
    const pct = (state.stepIdx / (steps.length - 1)) * 100;
    elProgressFill.style.width = pct + '%';

    elBack.disabled = state.stepIdx === 0;

    // Validity
    let valid = false;
    let hint = '';
    if (step.type === 'single') {
      valid = state.answers[step.id] !== undefined;
      if (!valid) hint = 'Pick one to continue';
    } else {
      const arr = state.answers[step.id] || [];
      valid = step.allowSkip || arr.length > 0;
      if (!valid) hint = 'Pick at least one or skip';
      else if (arr.length === 0 && step.skipMeansAll) hint = 'Skipping = all selected';
      else hint = arr.length + ' selected';
    }
    elNext.disabled = !valid;
    elFootHint.textContent = hint;

    // Last step?
    if (state.stepIdx === steps.length - 1) {
      elNext.innerHTML = 'Build my plan ' + I.sparkle;
    } else {
      elNext.innerHTML = 'Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    }
  }

  function next() {
    if (elNext.disabled) return;
    if (state.stepIdx < steps.length - 1) {
      gotoStep(state.stepIdx + 1, 'forward');
    } else {
      finalize();
    }
  }
  function back() {
    if (state.stepIdx > 0) gotoStep(state.stepIdx - 1, 'back');
  }

  // ============================================================
  // Finalize → loading → result
  // ============================================================
  let isFinalizing = false;
  async function finalize() {
    if (isFinalizing) return;
    isFinalizing = true;
    // Lock the buttons immediately so a rapid double-click can't re-enter
    elNext.disabled = true;
    elBack.disabled = true;

    // Hide quiz with crossfade, show loading
    elQuiz.classList.add('th-view--fading');
    setTimeout(() => {
      elQuiz.classList.add('th-view--hidden');
      elQuiz.classList.remove('th-view--fading');
      elLoading.classList.remove('th-view--hidden');
    }, 320);

    // Run engine
    await sleep(900); // brief delay so the loading state is felt
    // Normalise: if categories step left empty, treat as "all"
    const a = state.answers;
    if (!a.categories || a.categories.length === 0) {
      a.categories = categoryPool();
    }

    let itin;
    try {
      itin = window.UrbanRetreatEngine.generate(a);
      try { itin = await window.UrbanRetreatAI.enhanceItinerary(itin); } catch (e) { /* AI placeholder failed silently */ }
    } catch (e) {
      console.error(e);
      itin = null;
    }

    renderResult(itin);

    // Swap loading → result
    elLoading.classList.add('th-view--fading');
    setTimeout(() => {
      elLoading.classList.add('th-view--hidden');
      elLoading.classList.remove('th-view--fading');
      elResult.classList.remove('th-view--hidden');
      // Scroll the stage into view smoothly
      document.querySelector('.th-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 320);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ============================================================
  // Result rendering
  // ============================================================
  function renderResult(itin) {
    elResult.innerHTML = '';
    if (!itin || itin.summary.totalLocations === 0) {
      elResult.appendChild(renderEmpty());
      elResult.appendChild(renderResultActions(itin, true));
      return;
    }

    // Hero
    const hero = el('div', 'th-result__hero');
    hero.innerHTML = `
      <p class="th-result__eyebrow">Your Mangalore plan</p>
      <h2 class="th-result__title">A ${itin.days.length}-day ${escapeHtml((itin.summary.group||'trip').toLowerCase())} itinerary</h2>
      <p class="th-result__summary">${escapeHtml(itin.summary.styleSummary || '')}. Tap any place to expand details, open it in Maps, or read tips.</p>
      <div class="th-stats"></div>
    `;
    const stats = hero.querySelector('.th-stats');
    [
      ['Days', itin.days.length],
      ['Stops', itin.summary.totalLocations],
      ['Active time', '~' + itin.summary.approxTravelHours + 'h'],
      ['Est. cost', '₹' + itin.summary.estCostPerPerson + '/pp'],
      ['Pace', itin.summary.schedule || '—'],
    ].forEach(([label, value]) => {
      const s = el('div', 'th-stat');
      s.innerHTML = '<div class="th-stat__label">' + escapeHtml(label) + '</div>' +
                    '<div class="th-stat__value">' + escapeHtml(String(value)) + '</div>';
      stats.appendChild(s);
    });
    elResult.appendChild(hero);

    // Action bar
    elResult.appendChild(renderResultActions(itin, false));

    // Day list
    const body = el('div', 'th-result__body');
    body.id = 'th-pdf-target';
    // Hidden header inside body for PDF (so we keep the gradient hero only on screen, but title in PDF)
    itin.days.forEach(d => body.appendChild(renderDay(d)));
    elResult.appendChild(body);
  }

  function renderResultActions(itin, isEmpty) {
    const bar = el('div', 'th-result__actions');
    bar.innerHTML =
      '<span class="th-result__actions-left">Personalised for ' +
      escapeHtml((itin && itin.summary && itin.summary.group) || 'you') + '</span>';

    if (!isEmpty) {
      const pdf = el('button', 'btn btn--primary');
      pdf.type = 'button';
      pdf.innerHTML = I.download + ' Download PDF';
      pdf.addEventListener('click', () => exportPdf(itin));
      bar.appendChild(pdf);

      const print = el('button', 'btn btn--outline');
      print.type = 'button';
      print.innerHTML = I.print + ' Print';
      print.addEventListener('click', () => window.print());
      bar.appendChild(print);
    }

    const restart = el('button', 'btn btn--secondary');
    restart.type = 'button';
    restart.innerHTML = I.refresh + ' Start over';
    restart.addEventListener('click', restart_);
    bar.appendChild(restart);
    return bar;
  }

  function renderEmpty() {
    const wrap = el('div', 'th-empty');
    wrap.innerHTML =
      '<div class="th-empty__icon">' + I.info + '</div>' +
      '<h3 style="font-family:var(--font-heading);color:var(--color-primary);">No matches found</h3>' +
      '<p>Try broadening your categories or raising your budget. Use Start over to revise.</p>';
    return wrap;
  }

  function renderDay(dayPlan) {
    const day = el('div', 'th-day');
    const head = el('div', 'th-day__head');
    head.innerHTML =
      '<h3 class="th-day__title">Day ' + dayPlan.day + '</h3>' +
      (dayPlan.cluster ? '<span class="th-day__cluster">' + escapeHtml(dayPlan.cluster) + '</span>' : '');
    day.appendChild(head);

    const slotIcon = { morning: I.sunrise, afternoon: I.sun, evening: I.sunset, night: I.moon };
    const slotLabel = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };
    ['morning','afternoon','evening','night'].forEach(s => {
      const items = dayPlan.slots[s] || [];
      if (!items.length) return;
      const slot = el('div', 'th-slot');
      const label = el('span', 'th-slot__label');
      label.innerHTML = slotIcon[s] + ' ' + slotLabel[s];
      slot.appendChild(label);
      items.forEach(p => slot.appendChild(renderPlace(p.attr)));
      day.appendChild(slot);
    });
    return day;
  }

  function renderPlace(a) {
    const card = el('div', 'th-place');
    const head = el('button', 'th-place__head');
    head.type = 'button';

    const main = el('div', 'th-place__main');
    main.appendChild(el('h4', 'th-place__name', escapeHtml(a.place_name)));
    const tags = el('div', 'th-place__tags');
    if (a.category)     tags.appendChild(el('span', 'th-tag th-tag--cat', escapeHtml(a.category)));
    if (a.ideal_time)   tags.appendChild(el('span', 'th-tag th-tag--time', escapeHtml(a.ideal_time)));
    if (a.budget_level) tags.appendChild(el('span', 'th-tag th-tag--budget', escapeHtml(a.budget_level)));
    if (a.distance_band_from_mangalore) tags.appendChild(el('span', 'th-tag', escapeHtml(a.distance_band_from_mangalore)));
    main.appendChild(tags);
    head.appendChild(main);

    head.insertAdjacentHTML('beforeend',
      '<svg class="th-place__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>');
    head.addEventListener('click', () => card.classList.toggle('th-place--open'));
    card.appendChild(head);

    const body = el('div', 'th-place__body');
    const inner = el('div', 'th-place__inner');
    if (a.short_description) {
      inner.appendChild(el('h5', null, 'Why this fits your plan'));
      inner.appendChild(el('p', null, escapeHtml(a.short_description)));
    }

    const details = el('div', 'th-place__details');
    addDetail(details, 'Time needed', a.suggested_duration_min ? a.suggested_duration_min + ' min' : null);
    addDetail(details, 'Ideal time', a.ideal_time);
    addDetail(details, 'Budget', a.budget_level && a.est_cost_per_person_inr
      ? a.budget_level + ' (≈₹' + a.est_cost_per_person_inr + '/pp)'
      : a.budget_level);
    addDetail(details, 'Best season', a.best_season);
    addDetail(details, 'Indoor / Outdoor', a.indoor_outdoor);
    addDetail(details, 'Physical intensity', a.physical_intensity);
    inner.appendChild(details);

    if (a.pair_with && a.pair_with.length) {
      inner.appendChild(el('h5', null, 'Pair with / nearby'));
      inner.appendChild(el('p', null, a.pair_with.map(escapeHtml).join(' · ')));
    }
    if (a.avoid_when) {
      const warn = el('div', 'th-place__warn');
      warn.innerHTML = '<strong>Heads up:</strong> avoid when ' + escapeHtml(a.avoid_when);
      inner.appendChild(warn);
    }
    if (a.booking_or_verification_note) {
      inner.appendChild(el('h5', null, 'Tip'));
      inner.appendChild(el('p', null, escapeHtml(a.booking_or_verification_note)));
    }

    const acts = el('div', 'th-place__actions');
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.place_name + ' Mangalore');
    acts.insertAdjacentHTML('beforeend',
      '<a class="btn btn--primary btn--sm" target="_blank" rel="noopener" href="' + mapsUrl + '">' + I.map + ' Open in Maps</a>');
    if (a.source_url) {
      acts.insertAdjacentHTML('beforeend',
        '<a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' + escapeHtml(a.source_url) + '">More info</a>');
    }
    inner.appendChild(acts);

    body.appendChild(inner);
    card.appendChild(body);
    return card;
  }
  function addDetail(host, label, value) {
    if (!value && value !== 0) return;
    const d = el('div', 'th-detail');
    d.innerHTML = '<div class="th-detail__label">' + escapeHtml(label) + '</div>' +
                  '<div class="th-detail__value">' + escapeHtml(String(value)) + '</div>';
    host.appendChild(d);
  }

  // ============================================================
  // PDF export
  // ============================================================
  async function exportPdf(itin) {
    if (!window.jspdf || !window.html2canvas) {
      alert('PDF tools are still loading — please try again in a moment.');
      return;
    }
    const target = elResult; // capture the full result panel
    if (!target) return;

    // Open all dropdowns for the snapshot
    const closed = Array.from(target.querySelectorAll('.th-place:not(.th-place--open)'));
    closed.forEach(c => c.classList.add('th-place--open'));

    try {
      const canvas = await window.html2canvas(target, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imgW = pageW - margin * 2;
      const imgH = canvas.height * (imgW / canvas.width);
      if (imgH <= pageH - margin * 2) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgW, imgH);
      } else {
        const sliceH = (pageH - margin * 2) * (canvas.width / imgW);
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        const ctx = tmp.getContext('2d');
        let srcY = 0;
        let pageNum = 0;
        while (srcY < canvas.height) {
          const h = Math.min(sliceH, canvas.height - srcY);
          tmp.height = h;
          ctx.clearRect(0, 0, tmp.width, tmp.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, h, 0, 0, canvas.width, h);
          if (pageNum > 0) pdf.addPage();
          const sliceImgH = h * (imgW / canvas.width);
          pdf.addImage(tmp.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, imgW, sliceImgH);
          srcY += h;
          pageNum++;
        }
      }
      pdf.save('Urban-Retreat-Mangalore-Itinerary.pdf');
    } catch (err) {
      console.error(err);
      alert('Sorry — PDF export ran into a problem. Try Print as a fallback.');
    } finally {
      closed.forEach(c => c.classList.remove('th-place--open'));
    }
  }

  // ============================================================
  // Restart
  // ============================================================
  function restart_() {
    state.answers = {};
    state.stepIdx = 0;
    isFinalizing = false;
    isTransitioning = false;
    elSlides.innerHTML = '';
    elResult.innerHTML = '';
    elResult.classList.add('th-view--hidden');
    elLoading.classList.add('th-view--hidden');
    elQuiz.classList.remove('th-view--hidden');

    const first = buildSlide(0);
    first.classList.add('th-slide--active');
    elSlides.appendChild(first);
    updateChrome();
    document.querySelector('.th-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    elSlides       = $('th-slides');
    elProgressFill = $('th-progress-fill');
    elStepCurrent  = $('th-step-current');
    elStepTotal    = $('th-step-total');
    elStepLabel    = $('th-step-label');
    elBack         = $('th-back');
    elNext         = $('th-next');
    elFootHint     = $('th-foot-hint');
    elQuiz         = $('th-quiz');
    elLoading      = $('th-loading');
    elResult       = $('th-result');
    if (!elSlides || !elQuiz || !elResult || !elLoading) return;

    elBack.addEventListener('click', back);
    elNext.addEventListener('click', next);

    // Enter advances; Esc goes back
    document.addEventListener('keydown', (e) => {
      if (elQuiz.classList.contains('th-view--hidden')) return;
      if (e.key === 'Enter' && !elNext.disabled) { e.preventDefault(); next(); }
      else if (e.key === 'Escape' && !elBack.disabled) { e.preventDefault(); back(); }
    });

    // Render first slide
    const first = buildSlide(0);
    first.classList.add('th-slide--active');
    elSlides.appendChild(first);
    updateChrome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
