import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLAN } from '../src/model.js';
import { validateBook, parsePlanCSV } from '../src/storage.js';

const stamp = '2026-10-30T12:00:00.000Z';
const book = () => ({ version: 1, revision: 3, plan: { ...DEFAULT_PLAN }, approvedRevision: null, checks: [false, false, false], notes: [], savedAt: stamp });

test('stored review requires three explicit booleans and approval of the exact ready revision', () => {
  assert.equal(validateBook(book()), true);
  for (const checks of [[], [true], [true, true, true, true], ['true', true, true], [1, 1, 1], null]) assert.equal(validateBook({ ...book(), checks }), false);
  const approved = { ...book(), checks: [true, true, true], approvedRevision: 3 };
  assert.equal(validateBook(approved), true);
  assert.equal(validateBook({ ...approved, approvedRevision: 2 }), false);
  assert.equal(validateBook({ ...approved, approvedRevision: '3' }), false);
  assert.equal(validateBook({ ...approved, checks: [true, false, true] }), false);
  assert.equal(validateBook({ ...approved, plan: { ...DEFAULT_PLAN, supervisor: false } }), false);
});
test('rejects corrupt notes, timestamps and unsafe image sources before render', () => {
  for (const notes of [[null], [{ text: {} }], [{ text: 'A note', time: 'yesterday' }], [{ text: '', time: stamp }]]) assert.equal(validateBook({ ...book(), notes }), false);
  for (const image of ['https://example.com/a.png', 'data:image/svg+xml;base64,AAAA', 'javascript:alert(1)', 'data:image/png;base64,', 'data:image/png;base64,not base64!']) assert.equal(validateBook({ ...book(), notes: [{ text: 'Reference', time: stamp, image }] }), false);
  for (const type of ['jpeg', 'png', 'webp']) assert.equal(validateBook({ ...book(), notes: [{ text: 'Reference', time: stamp, image: `data:image/${type};base64,AAAA` }] }), true);
  assert.equal(validateBook({ ...book(), notes: [{ text: 'A useful note', time: stamp }] }), true);
  for (const revision of [-1, 0, 1.1, Infinity, Number.MAX_SAFE_INTEGER]) assert.equal(validateBook({ ...book(), revision }), false);
  assert.equal(validateBook({ ...book(), savedAt: '2026-02-30T12:00:00.000Z' }), false);
});
test('sample import and quoted CSV preserve exact title punctuation without mutation', () => {
  const original = Object.freeze({ ...DEFAULT_PLAN });
  const result = parsePlanCSV('title,venue,guests,date,screen,projector,lighting\r\n"A night, with ""friends""",courtyard,80,2026-11-07,large,aurora,night\r\n', original);
  assert.equal(result.title, 'A night, with "friends"');
  assert.equal(result.guests, 80);
  assert.equal(result.projector, 'aurora');
  assert.deepEqual(original, DEFAULT_PLAN);
  assert.equal(parsePlanCSV('\uFEFFvenue,guests\ncourtyard,40', original).title, DEFAULT_PLAN.title);
});
test('structural CSV errors and invalid values fail atomically', () => {
  const original = Object.freeze({ ...DEFAULT_PLAN });
  const bad = [
    'venue,guests,guests\ncourtyard,40,80', 'venue,guests\ncourtyard,40,extra', 'venue,guests,title\ncourtyard,40',
    'venue,guests,unknown\ncourtyard,40,anything', 'venue,guests\ncourtyard,40\nrooftop,20', 'venue,guests\n"courtyard,40',
    'venue,guests\n"courtyard"oops,40', 'venue,guests\ncourt"yard,40', 'venue,guests\ncourtyard,1.5',
    'venue,guests\ncourtyard,NaN', 'venue,guests\ncourtyard,Infinity', 'venue,guests\ncourtyard,1e2',
    'venue,guests\ncourtyard,121', 'venue,guests,date\ncourtyard,40,2026-02-30', 'venue,guests\nunknown,40',
  ];
  for (const csv of bad) { assert.throws(() => parsePlanCSV(csv, original), csv); assert.deepEqual(original, DEFAULT_PLAN); }
});
