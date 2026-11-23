# Afterlight

Afterlight is a fictional pop-up cinema operations studio. This browser demo connects an authored spatial screening plan to the equipment, crew, field evidence, and reviewed proposal needed to prepare it. The intended audience is someone planning a small screening, and someone exploring the developer's work.

## Product contract

- Stage is the starting workspace: a cinematic view of the current plan, with practical settings close at hand.
- Resources, Crew, Field notes, and Proposal expose the consequences of that same plan. They must not maintain competing copies of it.
- The visual scene represents the saved configuration. It is a procedural preview, not a measured venue survey, generated architecture, safety assessment, or physical control system.
- Plan edits increment its revision. Approval belongs to an exact reviewed revision; subsequent changes invalidate that approval. Readiness and reviewed status are distinct.
- Crew eligibility, resource availability, and capacity checks must explain their unmet condition. A pleasant preview never substitutes for a satisfied requirement.
- A proposal is a read-only, printable view of the plan and its current review status. Printing does not send a proposal or confirm a booking.

## Data and boundaries

Every sample organisation, person, venue, availability entry, amount, and field observation is fictional. Prices use CAD for illustration. Locale is `en-CA`; the domain timezone is `America/Toronto`.

The demo stores one plan in this browser. It has no shared backend, authenticated authority, external messaging, payment processing, recruitment service, or live GPS. Browser storage is convenience persistence, not a durable team database. JSON export/import is the explicit portable backup mechanism; validate a backup before replacing the current plan.

CSV imports must validate the documented schema before applying changes. Invalid records need actionable errors, and must not silently create a partially trusted plan. Review requirements apply to imported changes too.

Typed commands are deterministic shortcuts to supported actions and always remain available. Optional native speech recognition starts only after the user activates it. Speech support and processing depend on the browser; neither voice nor typed commands imply a hosted AI service or unrestricted language understanding.

## Demo story

Configure the screening; inspect its operational requirements; resolve a real, explained blocker; review the resulting plan; then demonstrate that a later edit makes that review stale. Keep the scene and its practical consequences visible together. Avoid invented customer outcomes, sales claims, and simulated external transactions.

## Completion evidence

The contracts describe intended behaviour. Build, test, browser, accessibility, deployment, and performance results must be reported from observed runs. This document records no passing verification or deployment claim.
