import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLAN, derivePlan, applyCommand, validatePlan, formatMoney } from '../src/model.js';

test('default plan has exact traceable CAD costs and a complete run sheet', () => {
  const result = derivePlan(DEFAULT_PLAN);
  assert.equal(result.ready, true);
  assert.equal(result.subtotal, 1340);
  assert.equal(result.tax, 174.2);
  assert.equal(result.total, 1514.2);
  assert.equal(result.lineItems.reduce((s, row) => s + row.qty * row.unit, 0), result.subtotal);
  assert.equal(result.crew.length, 3);
  assert.equal(result.runSheet.length, 5);
  assert.match(formatMoney(result.total), /1,514\.20/);
});
test('compound audience request exposes reserved equipment and can resolve it', () => {
  const first = applyCommand(DEFAULT_PLAN, '80 guests and larger screen');
  assert.equal(first.changed, true);
  assert.equal(first.plan.guests, 80);
  assert.equal(first.plan.screen, 'large');
  assert.equal(first.plan.projector, 'aurora');
  assert.deepEqual(derivePlan(first.plan).conflicts.map(c => c.id), ['projector-reserved']);
  const resolved = applyCommand(first.plan, 'use available projector');
  assert.equal(resolved.plan.projector, 'atlas');
  assert.equal(derivePlan(resolved.plan).ready, true);
  assert.equal(derivePlan(resolved.plan).subtotal, 1850);
});
test('capacity, screen and trainee constraints are independently visible', () => {
  const result = derivePlan({ ...DEFAULT_PLAN, venue: 'rooftop', guests: 80, supervisor: false });
  assert.deepEqual(result.conflicts.map(c => c.id), ['venue-capacity', 'projector-capacity', 'screen-size', 'crew-supervision']);
  assert.equal(result.crewReady, false);
  assert.equal(result.crew.some(p => p.id === 'lena'), false);
  assert.equal(derivePlan(applyCommand({ ...DEFAULT_PLAN, supervisor: false }, 'add supervisor').plan).crewReady, true);
});
test('reservation applies only to 7 November and date command clears it', () => {
  const plan = { ...DEFAULT_PLAN, projector: 'aurora' };
  assert.equal(derivePlan(plan).ready, false);
  const result = applyCommand(plan, 'move date to November 8');
  assert.equal(result.plan.date, '2026-11-08');
  assert.equal(derivePlan(result.plan).ready, true);
});
test('rejects invalid numbers and dates without crashing or applying partial changes', () => {
  for (const guests of [0, -1, 1.5, NaN, Infinity, 121, '40', undefined]) {
    assert.ok(validatePlan({ ...DEFAULT_PLAN, guests }).length);
    assert.equal(derivePlan({ ...DEFAULT_PLAN, guests }).ready, false);
  }
  for (const date of ['2026-02-30', '', 'not-a-date', '2026-13-01']) assert.ok(validatePlan({ ...DEFAULT_PLAN, date }).length);
  for (const text of ['-2 guests and night', '1.5 guests and night', '200 guests and larger screen', 'infinity guests', 'nan guests']) {
    const result = applyCommand(DEFAULT_PLAN, text);
    assert.equal(result.changed, false);
    assert.deepEqual(result.plan, DEFAULT_PLAN);
  }
});
test('venue capacity changes are atomic; a larger venue can be chosen in the same request', () => {
  const invalid = applyCommand(DEFAULT_PLAN, '80 guests and rooftop and night');
  assert.equal(invalid.changed, false);
  assert.deepEqual(invalid.plan, DEFAULT_PLAN);
  const valid = applyCommand(DEFAULT_PLAN, '120 guests and warehouse and larger screen and use available projector');
  assert.equal(valid.changed, true);
  assert.equal(derivePlan(valid.plan).ready, true);
});
test('limited parser rejects unknown and external requests in full', () => {
  for (const text of ['night and send the quote', 'book it', 'save automatically', 'use available projector and charge my card', 'night and sing a song', 'x'.repeat(301)]) {
    const result = applyCommand(DEFAULT_PLAN, text);
    assert.equal(result.changed, false);
    assert.deepEqual(result.plan, DEFAULT_PLAN);
  }
  assert.equal(applyCommand(DEFAULT_PLAN, 'Please use night lighting.').plan.lighting, 'night');
  assert.equal(applyCommand(DEFAULT_PLAN, '40 guests').changed, false);
});
test('commands and derivation never mutate their input', () => {
  const input = Object.freeze({ ...DEFAULT_PLAN });
  applyCommand(input, '80 guests and larger screen');
  const derived = derivePlan(input);
  derived.crew[0].name = 'Changed';
  assert.equal(derivePlan(input).crew[0].name, 'Milo');
  assert.deepEqual(input, DEFAULT_PLAN);
});
