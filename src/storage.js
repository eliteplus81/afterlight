import { validatePlan, derivePlan } from './model.js';

const validTimestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const validImage = value => typeof value === 'string' && value.length <= 2_000_050 && /^data:image\/(?:jpeg|png|webp);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value) && value.split(',')[1].length > 0;

/** Validate stored state before any part of it reaches a renderer or review gate. */
export function validateBook(book) {
  if (!book || typeof book !== 'object' || Array.isArray(book) || book.version !== 1) return false;
  if (!Number.isSafeInteger(book.revision) || book.revision < 1 || book.revision === Number.MAX_SAFE_INTEGER) return false;
  if (validatePlan(book.plan).length || !validTimestamp(book.savedAt)) return false;
  if (!Array.isArray(book.checks) || book.checks.length !== 3 || !book.checks.every(value => typeof value === 'boolean')) return false;
  if (!Array.isArray(book.notes) || !book.notes.every(note => note && typeof note === 'object' && !Array.isArray(note) && typeof note.text === 'string' && note.text.trim().length > 0 && note.text.length <= 3000 && validTimestamp(note.time) && (note.image === undefined || validImage(note.image)))) return false;
  if (book.approvedRevision !== null && (book.approvedRevision !== book.revision || !book.checks.every(Boolean) || !derivePlan(book.plan).ready)) return false;
  return true;
}

function csvRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  const endField = () => { row.push(field.trim()); field = ''; closed = false; };
  const endRow = () => { endField(); rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += char;
      continue;
    }
    if (char === ',') { endField(); continue; }
    if (char === '\r' || char === '\n') { if (char === '\r' && text[i + 1] === '\n') i++; endRow(); continue; }
    if (closed) { if (char === ' ' || char === '\t') continue; throw new Error('Unexpected text after a quoted CSV field.'); }
    if (char === '"') { if (field.trim()) throw new Error('Quotes must surround the whole CSV field.'); field = ''; quoted = true; continue; }
    field += char;
  }
  if (quoted) throw new Error('A quoted CSV field was not closed.');
  if (field || closed || row.length) endRow();
  return rows;
}

/** Returns a new valid plan; a parsing error leaves the caller's state untouched. */
export function parsePlanCSV(text, basePlan) {
  if (typeof text !== 'string' || text.length > 100_000) throw new Error('Choose a plan CSV smaller than 100 KB.');
  if (validatePlan(basePlan).length) throw new Error('The current plan is invalid. Reset it before importing.');
  const rows = csvRows(text.replace(/^\uFEFF/, '').trim());
  if (rows.length !== 2) throw new Error('Use a header and exactly one plan row.');
  const keys = rows[0].map(key => key.toLowerCase());
  const allowed = ['title', 'venue', 'guests', 'date', 'screen', 'projector', 'lighting'];
  if (keys.some(key => !allowed.includes(key))) throw new Error('Use only title, venue, guests, date, screen, projector and lighting columns.');
  if (new Set(keys).size !== keys.length) throw new Error('CSV column names must be unique.');
  if (!keys.includes('venue') || !keys.includes('guests')) throw new Error('Include venue and guests columns.');
  if (rows[1].length !== keys.length) throw new Error('The plan row must have exactly one value for every column.');
  const record = Object.fromEntries(keys.map((key, i) => [key, rows[1][i]]));
  if (!/^[1-9]\d*$/.test(record.guests)) throw new Error('Guest count must be a whole number from 1 to 120.');
  const plan = { ...basePlan, ...record, guests: Number(record.guests) };
  const errors = validatePlan(plan);
  if (errors.length) throw new Error(errors[0]);
  return plan;
}
