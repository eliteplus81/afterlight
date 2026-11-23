# Afterlight

A fictional pop-up cinema operations demo built with React, Vite, and Three.js. An authored cinema preview sits beside a single plan's resources, crew, field notes, and reviewed proposal.

All sample entities and prices are fictional. This is a local browser application with no external messages, payments, recruitment, bookings, or live GPS. A visual preview is not a measured venue model or safety approval.

## Working locally

Run commands from `sites/afterlight`. Install the package dependencies, then use the scripts declared in `package.json` for development, verification, and production build. On Windows PowerShell, prefer `npm.cmd` when script execution policy blocks `npm.ps1`. The package manifest is the source of truth for available commands.

## Data and commands

The app maintains one revisioned plan in browser storage. Edits invalidate approval of older revisions. Export a JSON backup for portability; browser-local storage can be cleared and does not synchronise between users or devices. Validate imported JSON and CSV before replacing or changing the plan.

Typed commands invoke supported deterministic actions. Optional browser-native speech recognition is user initiated and browser dependent; it is not a hosted AI feature. The typed path must remain available when recognition is absent or denied.

Locale is `en-CA`, time zone is `America/Toronto`, and illustrative amounts use CAD.

## Project contracts

- `PRODUCT.md`: scope, fictional-data boundaries, and domain expectations.
- `DESIGN.md`: visual identity and mapping to canonical tokens in `src/main.css`.
- `UX-CONTRACT.md`: shared interaction owners, state invariants, recovery, and verification targets.

These documents describe intended behaviour. They do not establish that build, tests, browser checks, deployment, or accessibility audits have passed. Report those results only after observing the corresponding run.

## Current implementation
Five connected views: spatial studio, equipment/costs, crew training requirements, field/map/reference notes and proposal. Supports a bounded deterministic typed-command vocabulary, optional browser speech input and spoken replies, validated one-plan CSV import, validated JSON backup/restore, local revision conflict detection, evidence-review reset on edits and an HTML proposal with embedded current 3D scene plus added notes/photos. No external AI, bookings, messages, payments or GPS service.
