# Afterlight UX contract

Visual decisions live in `DESIGN.md`. Domain rules and validated plan transformations belong to the shared model; the React application presents their results. Requirements below are a contract, not a record of completed tests.


## Review and persistence

A saved edit increments the revision and clears or marks obsolete the previous approval. Approval is valid only for the exact reviewed revision and must not conceal unresolved readiness requirements. Export, import, reset, reload, and command shortcuts must preserve those invariants.

Saving feedback describes local persistence accurately. If browser storage is unavailable or fails, retain the in-memory plan, show a persistent warning, and keep JSON backup available. A malformed backup must leave the current plan intact. Replacing or resetting a plan requires an app-owned confirmation naming the consequence; routine reversible edits do not.

## Commands and imports

The experience route is an optional, manually navigable story. Its temporary plan is independent of the saved workspace. Use this plan passes through the canonical commit function, increments the revision and clears review checks. Leaving the story without that action preserves saved data. Optional playback can be paused and stops when the document is hidden. Every chapter and venue is available by button without autoplay, dragging or voice.

Presentation views is a read-only view of the saved plan. Camera selection, rotation and opening staging references do not call commit, change revision, or clear review. Adjust the screening returns to the studio; Open proposal opens the current saved proposal. The reference images describe the simplified courtyard study even when another venue is selected; the live canvas follows the selected venue.

Preview edit uses an isolated fictional courtyard plan and the same domain calculations and renderer. Recording starts only on Create preview, requires native MediaRecorder/canvas capture support, and creates a local silent WebM download. It sends nothing. Cancel, leaving the route, or hiding the tab stops capture. Stop/cleanup releases MediaStream tracks and object URLs. A clip is offered only after recording finishes; recording failure does not claim a usable file. Preview graphics are a composed presentation of actual scene frames and calculated sample data, not a recording of pointer actions or an external booking.

Show supported command examples and a typed input independent of microphone availability. Unsupported input explains the supported actions and makes no change. Recognition begins only on explicit activation, visibly indicates listening, and has a stop path. Do not infer consent from page load or typing.

Validate CSV headers, required values, and records before commit. Report the relevant row/field and correction. Validate backup shape and supported version before applying it. Importing plan data is a plan change and cannot retain an unrelated approval. Never report successful import before commit.

## Interaction and accessibility

All workflows need a keyboard path. Use visible focus, associated field help/errors, text statuses alongside colour, and adequately sized controls. Every drag interaction needs a button or native-control alternative. A canvas is supplementary: resource totals, plan settings, readiness, and scene controls require accessible DOM content.

Reduced motion limits scene animation and decorative transitions. Narrow screens preserve all five sections, legible text, and complete workflows. Image failures and unsupported WebGL show usable fallbacks. Reserve layout space for media and status changes.

Use `en-CA`, `America/Toronto`, and CAD consistently in labels, dates, times, numbers, print output, and error messages. Do not present sample availability as real-time inventory or fictional prices as quotes from an actual operator.

## Review checklist

Verify the initial plan, an explained blocker, its resolution, approval, and approval invalidation after an edit. Exercise CSV rejection, JSON rejection without mutation, backup restore, reload, command rejection, microphone absence/denial, dialog Escape/focus return, keyboard navigation, narrow layouts, print, and the scene fallback. Record actual outcomes separately.

Date ownership: native input[type=date] uses the platform calendar. The shared domain validator checks calendar dates before saving. Form ownership: App handlers with noValidate, explicit empty/size/schema checks, and visible status. Textarea ownership: fixed generous height with internal vertical scrolling.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Date | Native date input | model.js validatePlan | Platform calendar | Calendar validation tests; phone layout |
| Form | App handlers | model.js and storage.js | Instruction; note; import | Empty-state and validation browser checks |
| Scrollbar | main.css root | DESIGN.md | Document and textarea | Narrow overflow checks |
| Toast | App notice | UX-CONTRACT.md | Success; caution | Visible live status |
| CRUD | App commit | storage.js valid envelope | Single local plan | Revision and malformed-backup tests |
