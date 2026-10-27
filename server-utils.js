/** Server-side validation and normalization for untrusted planner input. */
'use strict';

function cleanString(value, fallback = '', maxLength = 500) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function sanitizeConditionalDetails(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [key, item] of Object.entries(value).slice(0, 20)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,59}$/.test(key)) continue;
    if (typeof item === 'string') result[key] = item.trim().slice(0, 300);
    else if (typeof item === 'number' && Number.isFinite(item)) result[key] = Math.max(-1_000_000, Math.min(1_000_000, item));
    else if (typeof item === 'boolean') result[key] = item;
  }
  return result;
}

function validatePlanRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const guests = Number(body.guests);
  const budget = Number(body.budget);
  if (!Number.isFinite(guests) || guests < 1 || guests > 10000) {
    return { error: 'Guest count must be between 1 and 10,000.' };
  }
  if (!Number.isFinite(budget) || budget < 1 || budget > 1_000_000_000) {
    return { error: 'Budget must be a positive number within the supported limit.' };
  }
  if (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return { error: 'Event date must use YYYY-MM-DD format.' };
  }
  const [year, month, day] = body.date.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() !== month - 1 || parsedDate.getUTCDate() !== day) {
    return { error: 'Event date is not valid.' };
  }
  if (body.conditionalDetails && (typeof body.conditionalDetails !== 'object' || Array.isArray(body.conditionalDetails))) {
    return { error: 'Conditional details must be an object.' };
  }

  return {
    value: {
      type: cleanString(body.type, 'Custom Event', 80),
      name: cleanString(body.name, '', 120),
      description: cleanString(body.description, '', 1200),
      date: body.date,
      location: cleanString(body.location, '', 180),
      guests: Math.round(guests),
      budget,
      currency: typeof body.currency === 'string' && /^[A-Z]{3}$/.test(body.currency) ? body.currency : 'USD',
      style: cleanString(body.style, 'Elegant', 100),
      theme: cleanString(body.theme, '', 160),
      venuePreference: cleanString(body.venuePreference, '', 300),
      cateringPreference: cleanString(body.cateringPreference, '', 500),
      dietaryRestrictions: cleanString(body.dietaryRestrictions, '', 500),
      culturalTraditions: cleanString(body.culturalTraditions, '', 500),
      planningPriorities: cleanString(body.planningPriorities, '', 300),
      conditionalDetails: sanitizeConditionalDetails(body.conditionalDetails)
    }
  };
}

module.exports = { cleanString, sanitizeConditionalDetails, validatePlanRequest };
