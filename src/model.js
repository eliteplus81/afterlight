// All venues, people, availability and prices are fictional demo data.
export const VENUES = Object.freeze([
  { id: 'courtyard', name: 'Juniper Courtyard', tag: 'Open air · intimate', capacity: 100, address: '14 Lantern Lane', coordinates: [37, 58], description: 'Brick walls, climbing ivy and a screen beneath the city lights.' },
  { id: 'rooftop', name: 'Northline Rooftop', tag: 'Skyline · elevated', capacity: 60, address: '82 Northline Avenue', coordinates: [69, 31], description: 'A small rooftop gathering with a wide view of the skyline.' },
  { id: 'warehouse', name: 'The Paper Warehouse', tag: 'Indoors · expansive', capacity: 120, address: '6 Paper Street', coordinates: [73, 76], description: 'An old print room with room for a bigger audience, whatever the weather.' },
].map(Object.freeze));

export const PROJECTORS = Object.freeze([
  { id: 'beam', name: 'Beam 4K', capacity: 60, price: 180, description: 'A crisp, compact setup for up to 60 guests.' },
  { id: 'aurora', name: 'Aurora Pro', capacity: 120, price: 320, description: 'A larger-audience projector; reserved on 7 November.' },
  { id: 'atlas', name: 'Atlas Pro', capacity: 120, price: 360, description: 'A larger-audience projector available for this demo booking.' },
].map(Object.freeze));

export const DEFAULT_PLAN = Object.freeze({ title: 'A night between buildings', venue: 'courtyard', guests: 40, screen: 'standard', projector: 'beam', supervisor: true, lighting: 'dusk', date: '2026-11-07', notes: '' });

const STAFF = Object.freeze({
  milo: Object.freeze({ id: 'milo', name: 'Milo', role: 'Projection trainee', initials: 'ML' }),
  lena: Object.freeze({ id: 'lena', name: 'Lena', role: 'Projection supervisor', initials: 'LN' }),
  iris: Object.freeze({ id: 'iris', name: 'Iris', role: 'Event operations', initials: 'IR' }),
});
const venuePrices = { courtyard: 240, rooftop: 420, warehouse: 360 };
export const formatMoney = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(value);

export function validatePlan(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return ['A valid plan is required.'];
  const errors = [];
  if (typeof plan.title !== 'string' || !plan.title.trim() || plan.title.length > 120) errors.push('Give the event a title of 1–120 characters.');
  if (!VENUES.some(v => v.id === plan.venue)) errors.push('Choose a listed venue.');
  if (!Number.isSafeInteger(plan.guests) || plan.guests < 1 || plan.guests > 120) errors.push('Guest count must be a whole number from 1 to 120.');
  if (!['standard', 'large'].includes(plan.screen)) errors.push('Choose a standard or large screen.');
  if (!PROJECTORS.some(p => p.id === plan.projector)) errors.push('Choose a listed projector.');
  if (typeof plan.supervisor !== 'boolean') errors.push('Supervisor selection must be true or false.');
  if (!['dusk', 'night'].includes(plan.lighting)) errors.push('Choose dusk or night lighting.');
  if (typeof plan.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.date) || !Number.isFinite(Date.parse(`${plan.date}T12:00:00Z`)) || new Date(`${plan.date}T12:00:00Z`).toISOString().slice(0, 10) !== plan.date) errors.push('Choose a valid calendar date.');
  if (typeof plan.notes !== 'string' || plan.notes.length > 2000) errors.push('Notes must contain at most 2,000 characters.');
  return errors;
}

export function derivePlan(plan) {
  const errors = validatePlan(plan);
  if (errors.length) return { lineItems: [], total: 0, subtotal: 0, tax: 0, conflicts: errors.map((detail, i) => ({ id: `validation-${i}`, title: 'Check your plan', detail, action: 'Edit the plan' })), equipmentCount: 0, crew: [], crewReady: false, ready: false, requirements: errors.map(label => ({ label, ok: false })), runSheet: [], capacity: 0 };
  const venue = VENUES.find(v => v.id === plan.venue);
  const projector = PROJECTORS.find(p => p.id === plan.projector);
  const conflicts = [];
  const venueOK = plan.guests <= venue.capacity;
  const projectionOK = plan.guests <= projector.capacity;
  const screenOK = plan.guests <= 60 || plan.screen === 'large';
  const available = !(plan.projector === 'aurora' && plan.date === '2026-11-07');
  if (!venueOK) conflicts.push({ id: 'venue-capacity', title: 'This venue is too small', detail: `${venue.name} holds ${venue.capacity} guests; your plan has ${plan.guests}.`, action: 'Choose a larger venue' });
  if (!projectionOK) conflicts.push({ id: 'projector-capacity', title: 'More projection power needed', detail: `${projector.name} supports up to ${projector.capacity} guests.`, action: 'Use a larger projector' });
  if (!screenOK) conflicts.push({ id: 'screen-size', title: 'A larger screen is required', detail: 'Audiences above 60 guests need the large screen.', action: 'Use the large screen' });
  if (!available) conflicts.push({ id: 'projector-reserved', title: 'Aurora Pro is already reserved', detail: 'Aurora Pro is reserved on 7 November. Atlas Pro is available at $360.', action: 'Use available projector' });
  if (!plan.supervisor) conflicts.push({ id: 'crew-supervision', title: 'Milo needs a supervisor', detail: 'Milo is a trainee. Add Lena to supervise the projection setup.', action: 'Add supervisor' });
  const crew = [STAFF.milo, ...(plan.supervisor ? [STAFF.lena] : []), STAFF.iris].map(person => ({ ...person }));
  const lineItems = [];
  const add = (id, label, unit, qty = 1) => lineItems.push({ id, label, qty, unit, total: unit * qty });
  add('venue', venue.name, venuePrices[plan.venue]);
  add('screen', plan.screen === 'large' ? 'Large cinema screen' : 'Standard cinema screen', plan.screen === 'large' ? 210 : 120);
  add('projector', projector.name, projector.price);
  add('seating', 'Guest seating', 6, plan.guests);
  add('milo', 'Milo · projection trainee', 160);
  if (plan.supervisor) add('lena', 'Lena · projection supervisor', 180);
  add('iris', 'Iris · event operations', 140);
  add('lighting', plan.lighting === 'night' ? 'Night lighting kit' : 'Dusk lighting kit', plan.lighting === 'night' ? 140 : 80);
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subtotal * 0.13 * 100) / 100;
  const requirements = [
    { label: 'Venue fits the audience', ok: venueOK }, { label: 'Projector supports the audience', ok: projectionOK },
    { label: 'Screen suits the audience', ok: screenOK }, { label: 'Equipment available on your date', ok: available },
    { label: 'Trainee has a supervisor', ok: plan.supervisor },
  ];
  return { lineItems, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100, conflicts, equipmentCount: plan.guests + 3, crew, crewReady: plan.supervisor, ready: conflicts.length === 0, requirements, capacity: Math.min(venue.capacity, projector.capacity, plan.screen === 'large' ? 120 : 60), runSheet: [
    { time: '16:00', title: 'Load in', detail: `${crew.map(p => p.name).join(', ')} arrive at ${venue.name}.` },
    { time: '17:00', title: 'Screen & sound check', detail: `${projector.name}, ${plan.screen} screen and ${plan.lighting} lighting.` },
    { time: '18:00', title: 'Doors open', detail: `Iris welcomes ${plan.guests} guests.` },
    { time: '18:30', title: 'Film begins', detail: plan.title },
    { time: '21:00', title: 'Pack down', detail: 'Crew checks equipment and leaves the venue ready for its next day.' },
  ] };
}

export function applyCommand(plan, text) {
  const unchanged = reply => ({ plan: { ...plan }, reply, changed: false });
  if (validatePlan(plan).length) return unchanged('Please correct the plan fields before using a shortcut.');
  if (typeof text !== 'string' || !text.trim() || text.length > 300) return unchanged('Try a short request, such as “80 guests and larger screen”.');
  const input = text.toLowerCase().trim().replace(/[.!?]+$/g, '');
  // Match whole clauses; an unknown clause rejects the entire request.
  const clauses = input.split(/\s*(?:,|;|\band\b|\bthen\b)\s*/).filter(Boolean);
  if (clauses.length > 5) return unchanged('Try up to five supported changes at a time.');
  const next = { ...plan };
  for (const raw of clauses) {
    const clause = raw.replace(/^(?:please\s+|also\s+)/, '');
    let match;
    if ((match = clause.match(/^(?:(?:set|make|change)(?: it| this)?(?: to)?\s+)?([+-]?(?:\d+(?:\.\d+)?|infinity|nan))\s+(?:guests|people)$/))) next.guests = Number(match[1]);
    else if (/^(?:(?:use|add|switch to|choose)\s+)?(?:a |the )?(?:large|larger|big|bigger) screen$/.test(clause)) { next.screen = 'large'; if (next.projector === 'beam') next.projector = 'aurora'; }
    else if (/^(?:(?:use|choose|switch to)\s+)?(?:the |an )?available projector$/.test(clause)) next.projector = 'atlas';
    else if (/^(?:add|include)(?: a| the)? supervisor$/.test(clause)) next.supervisor = true;
    else if (/^(?:remove|drop)(?: the| a)? supervisor$/.test(clause)) next.supervisor = false;
    else if ((match = clause.match(/^(?:(?:use|choose|switch to|set)\s+)?(night|dusk)(?: lighting)?$/))) next.lighting = match[1];
    else if ((match = clause.match(/^(?:(?:use|choose|switch to|move to)\s+)?(?:the )?(courtyard|rooftop|warehouse)$/))) next.venue = match[1];
    else if (/^(?:(?:move|change|set)(?: it| date)? to |use |on )?(?:november 8(?:th)?|8(?:th)? november|nov 8(?:th)?|2026-11-08)$/.test(clause)) next.date = '2026-11-08';
    else return unchanged('I support guest counts, larger screens, an available projector, supervisors, lighting, venues and 8 November. Try “80 guests and larger screen”.');
  }
  const errors = validatePlan(next);
  if (errors.length) return unchanged(errors.join(' '));
  const venue = VENUES.find(v => v.id === next.venue);
  if (next.guests > venue.capacity) return unchanged(`${venue.name} holds ${venue.capacity} guests. Choose a larger venue in the same request or reduce the guest count; no changes were applied.`);
  const changed = Object.keys(DEFAULT_PLAN).some(key => next[key] !== plan[key]);
  const result = derivePlan(next);
  return { plan: next, changed, reply: changed ? `Plan updated. ${result.ready ? 'All planning checks pass.' : `${result.conflicts.length} planning ${result.conflicts.length === 1 ? 'issue needs' : 'issues need'} attention: ${result.conflicts.map(c => c.title).join('; ')}.`}` : 'Your plan already has those settings.' };
}
