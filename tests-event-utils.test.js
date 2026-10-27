'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EventUtils = require('./event-utils');
const { DEMO_EVENT } = require('./demo-data');
const { validatePlanRequest, sanitizeConditionalDetails } = require('./server-utils');
const { AIEngine } = require('./ai-engine');
global.EventUtils = EventUtils;
const { ConfidenceEngine } = require('./confidence-engine');

test('date-only parser rejects invalid and impossible dates', () => {
  assert.equal(EventUtils.parseDateOnly('2026-10-27').day, 27);
  assert.equal(EventUtils.parseDateOnly('2026-02-30'), null);
  assert.equal(EventUtils.parseDateOnly('Oct 27, 2026'), null);
});

test('date countdown uses calendar days rather than 24-hour intervals', () => {
  assert.equal(EventUtils.daysUntil('2026-10-28', new Date(2026, 9, 27, 23, 59, 59)), 1);
  assert.equal(EventUtils.daysUntil('2026-10-27', new Date(2026, 9, 27, 0, 0, 1)), 0);
  assert.equal(EventUtils.daysUntil('2026-10-26', new Date(2026, 9, 27, 12)), -1);
  assert.equal(EventUtils.daysUntil('invalid', new Date(2026, 9, 27)), null);
});

test('add days and months return local date-only strings', () => {
  assert.equal(EventUtils.addDaysToDateOnly('2026-12-31', 1), '2027-01-01');
  assert.equal(EventUtils.addMonthsDateOnly(1, new Date(2026, 0, 31)), '2026-02-28');
});

test('budget metrics distinguish allocation, estimate, and actual overspend', () => {
  const metrics = EventUtils.budgetMetrics(45000, [
    { allocated: 45000, estimated: 45000, actual: 42130 }
  ]);
  assert.equal(metrics.allocated, 45000);
  assert.equal(metrics.estimated, 45000);
  assert.equal(metrics.actual, 42130);
  assert.equal(metrics.remaining, 2870);
  assert.equal(metrics.allocationAtCap, true);
  assert.equal(metrics.alert, false);
  assert.equal(metrics.actualOverCap, false);
});

test('budget metrics flag each true overrun while treating invalid numbers as zero', () => {
  const allocation = EventUtils.budgetMetrics(100, [{ allocated: 110, estimated: 90, actual: 60 }]);
  assert.equal(allocation.allocationOverCap, true);
  assert.equal(allocation.alert, true);
  const estimate = EventUtils.budgetMetrics(100, [{ allocated: 100, estimated: 101, actual: 60 }]);
  assert.equal(estimate.estimateOverCap, true);
  const actual = EventUtils.budgetMetrics(100, [{ allocated: 100, estimated: 100, actual: 101 }]);
  assert.equal(actual.actualOverCap, true);
  assert.equal(EventUtils.numeric(Infinity), 0);
  assert.equal(EventUtils.numeric(-10), 0);
});

test('HTML escaping protects user-controlled values', () => {
  assert.equal(EventUtils.escapeHtml(`<img src=x onerror="alert('x')">`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;');
});

test('color helper rejects CSS injection', () => {
  assert.equal(EventUtils.safeColor('#aabbCC'), '#aabbCC');
  assert.equal(EventUtils.safeColor('red; background:url(javascript:alert(1))'), '#C5A059');
});

test('inline arguments encode JavaScript and HTML delimiter characters', () => {
  const encoded = EventUtils.inlineArg(`x');alert(1);//`);
  assert.equal(decodeURIComponent(encoded), `x');alert(1);//`);
  assert.ok(!encoded.includes("'"));
  assert.ok(!encoded.includes('('));
});

test('guest RSVP totals handle numeric strings and malformed party sizes safely', () => {
  assert.deepEqual(EventUtils.guestRsvpCounts([
    { rsvp: 'attending', count: '3' },
    { rsvp: 'attending', count: 2 },
    { rsvp: 'declined', count: '1' },
    { rsvp: 'pending', count: -5 },
    { rsvp: 'unknown', count: 99 },
    null
  ]), { attending: 5, declined: 1, pending: 1 });
  assert.deepEqual(EventUtils.guestRsvpCounts(null), { attending: 0, declined: 0, pending: 0 });
});

test('CSV quotes cells and neutralizes formula injection', () => {
  assert.equal(EventUtils.csvCell('Smith, "Sam"'), '"Smith, ""Sam"""');
  assert.equal(EventUtils.csvCell('=HYPERLINK("https://x")'), '"\'=HYPERLINK(""https://x"")"');
  assert.equal(EventUtils.csvCell('  +SUM(A1:A2)'), '"\'  +SUM(A1:A2)"');
});

test('demo totals are consistent across budget, tasks, vendors, and score', () => {
  const metrics = EventUtils.budgetMetrics(DEMO_EVENT.budget, DEMO_EVENT.budgetItems);
  assert.equal(metrics.allocated, DEMO_EVENT.budget);
  assert.equal(metrics.estimated, DEMO_EVENT.budget);
  assert.equal(metrics.actual, 42130);
  assert.equal(metrics.remaining, 2870);
  const score = ConfidenceEngine.calculate(DEMO_EVENT);
  assert.equal(score.overallScore, 86);
  assert.equal(score.stats.completedTasks, 11);
  assert.equal(score.stats.totalTasks, 18);
  assert.equal(score.breakdown.vendorScore.bookedCount, 8);
  assert.equal(score.breakdown.vendorScore.total, 8);
  assert.ok(DEMO_EVENT.date > EventUtils.todayLocalDate());
});

test('AI planner probes backend health before sending event data', async () => {
  const originalWindow = global.window;
  const originalFetch = global.fetch;
  const calls = [];
  global.window = { FESTIVA_API_BASE_URL: '', location: { hostname: 'shubh07272.github.io' } };
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options?.method || 'GET', body: options?.body });
    return { ok: false, status: 404, headers: { get: () => 'text/html' } };
  };
  try {
    const plan = await AIEngine.generateEventPlan({
      type: 'Wedding', name: 'Test Event', date: EventUtils.addDaysToDateOnly(EventUtils.todayLocalDate(), 60),
      guests: 50, budget: 5000, currency: 'USD', style: 'Elegant'
    });
    assert.ok(Array.isArray(plan.tasks));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].url, '/api/health');
    assert.equal(calls[0].body, undefined);
  } finally {
    global.fetch = originalFetch;
    if (originalWindow === undefined) delete global.window;
    else global.window = originalWindow;
    AIEngine.activeMode = 'intelligent-heuristic';
  }
});

test('server request validation rejects malformed bounds and impossible dates', () => {
  assert.match(validatePlanRequest(null).error, /JSON object/);
  assert.match(validatePlanRequest({ guests: 0, budget: 100, date: '2027-05-01' }).error, /Guest count/);
  assert.match(validatePlanRequest({ guests: 10, budget: -1, date: '2027-05-01' }).error, /Budget/);
  assert.match(validatePlanRequest({ guests: 10, budget: 100, date: '2027-02-30' }).error, /not valid/);
});

test('server request validation bounds and normalizes fields', () => {
  const result = validatePlanRequest({
    type: '  Wedding  ', name: 'x'.repeat(150), date: '2027-05-01', guests: '101.4', budget: '12500', currency: 'usd',
    conditionalDetails: {
      ceremonyType: '  sunset  ', bridalPartySize: 8, yes: true,
      nested: { secret: 'discard me' }, 'invalid key': 'discard me', huge: 'y'.repeat(400)
    }, extraSecret: 'drop this'
  });
  assert.ok(result.value);
  assert.equal(result.value.type, 'Wedding');
  assert.equal(result.value.name.length, 120);
  assert.equal(result.value.guests, 101);
  assert.equal(result.value.currency, 'USD');
  assert.deepEqual(result.value.conditionalDetails, {
    ceremonyType: 'sunset', bridalPartySize: 8, yes: true, huge: 'y'.repeat(300)
  });
  assert.equal(Object.hasOwn(result.value, 'extraSecret'), false);
  assert.deepEqual(sanitizeConditionalDetails(['not', 'an', 'object']), {});
});

test('confidence engine keeps scores between zero and one hundred with malformed input rows', () => {
  const score = ConfidenceEngine.calculate({ budget: Infinity, tasks: [null, {}], vendors: [null], budgetItems: [null] });
  assert.ok(score.overallScore >= 0 && score.overallScore <= 100);
});
