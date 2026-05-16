/* Urban Retreat — AI Enhancer (MVP placeholder)
 * Insertion point for future LLM enhancements:
 *   - natural-language "why recommended" copy
 *   - brochure-style summaries
 *   - conversational itinerary refinement
 *
 * In MVP: returns input unchanged. Keep the function signature stable so
 * future implementations can be dropped in without touching callers.
 */
(function (global) {
  'use strict';

  const AIEnhancer = {
    /**
     * Enhance a generated itinerary with AI-written reasoning, intros, etc.
     * @param {object} itinerary - Output of UrbanRetreatEngine.generate()
     * @param {object} [options] - Reserved for future flags (style, length, persona)
     * @returns {Promise<object>} same-shape itinerary, possibly enriched
     */
    enhanceItinerary: async function (itinerary, options) {
      return itinerary; // no-op
    },

    /**
     * Generate a natural-language reason a single place fits the user's prefs.
     * @returns {Promise<string|null>}
     */
    explainRecommendation: async function (place, prefs) {
      return null; // no-op
    },

    /**
     * Polish text for the printable PDF brochure.
     * @returns {Promise<string>}
     */
    polishBrochureText: async function (text) {
      return text; // no-op
    },

    isEnabled: function () { return false; },
  };

  global.UrbanRetreatAI = AIEnhancer;
})(window);
