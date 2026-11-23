# Afterlight design context

## North star

A cinema production desk after sunset: a vivid spatial stage next to calm, readable working paper. This is a product workspace, not a promotional landing page. The signature is the authored cinema scene changing in step with its practical plan. Avoid analytics tiles, decorative dashboards, glass panels, and repeated gradients.

The entry route now has a presentation register: an interactive five-chapter story framed as a cinema programme. A large scene sits next to a midnight-blue narrative panel, with amber selections and paper-coloured copy. The operational routes retain their working-paper register. The story is optional and directly navigable; its temporary configuration never overwrites the saved plan until the visitor selects Use this plan. There is no forced intro or automatic playback.

## Canonical tokens

`src/main.css` is the canonical runtime token owner. This document records accepted values and intent; it does not generate CSS. Components consume the stylesheet's shared tokens. Change this contract and the runtime owner together when a durable decision changes. Exact variable names remain owned by the stylesheet.

| Role | Value | Use |
| --- | --- | --- |
| Night ink | `#171F2F` | Navigation, stage surround, primary text on light surfaces |
| Slate | `#425A69` | Secondary text and structural detail |
| Amber | `#DFAE60` | Stage light and selected emphasis; pair with ink text |
| Rust | `#BD5E43` | Caution/error accent with explicit text and icon |
| Sage | `#6F8C7D` | Readiness accent with explicit status label |
| Paper | `#F2EDE4` | Operational surfaces and light text on ink |

These are palette primitives, not permission to use every pairing for text. Verify actual foreground/background contrast; lighter accents primarily serve fills and non-text marks.

## Typography

Use Source Serif 4, with Georgia and serif fallbacks, for restrained display headings. Use Manrope, with system sans fallbacks, for body text, navigation, forms, and data. Prefer self-hosted fonts when assets are supplied; fallback rendering must remain usable. Body and essential controls use at least `1rem` at the default root size, with comfortable line height. Small captions never carry the only copy of a requirement or action.

## Layout and density

Desktop uses a persistent sidebar for Stage, Resources, Crew, Field notes, and Proposal. Give the image-rich stage the foreground, with light operational panels as its supporting workspace. Keep related settings and consequences together. At phone widths, reflow into one readable column and compact navigation; allow the document to scroll rather than shrinking controls or hiding decisions. Audit at 320px, 390px, and 1440px.

Use a shared spacing rhythm, restrained corner radii, thin dividers, and limited elevation. The scene may be expressive; forms and tables stay quiet. Wide data views must retain labels and usable actions when stacked or scrolled. Shared control dimensions, focus rings, and semantic tones apply across all five sections.

## Imagery and motion

Venue and field imagery explain the fictional location and observations. Identify procedural views as previews and supplied photography as illustrative where applicable. Textual requirements and controls remain usable if WebGL is unavailable. Scene animation should reveal a configuration change, respect reduced-motion preferences, and pause or reduce work when its surface is inactive.

## States and content

Use sentence case and concrete verbs. State what is missing, what an action changed, and what remains to review. Do not celebrate approval when the current revision is stale. Errors, selection, and readiness cannot depend on colour alone. Preserve visible keyboard focus and stable layouts during loading, missing media, empty imports, or long content.

## Verification boundary

This is the intended visual contract. Runtime screenshots, contrast checks, responsive inspection, and focus checks must substantiate compliance. Behaviour ownership is recorded in `UX-CONTRACT.md`.

Runtime fonts are self-hosted Source Serif 4 Variable and Manrope, with their licenses in public/assets. The stage and venue studies are original authored procedural/code imagery; no searched third-party photography was shipped.

## Scene and route matrix

| Route | Goal and scene | Interaction and direct entry | Fallback |
|---|---|---|---|
| experience | Walk from empty venue through setup, bigger audience, reservation resolution and handover | Five explicit chapters, optional play/pause, three venues, camera controls. Local story state; saved plan changes only on Use this plan. | Narrative, facts, requirements and navigation remain DOM content. |
| views | Present the saved screening from arrival, reveal, guest, equipment and layout cameras | Five semantic selection buttons, plan summary, optional Topview reference disclosure. Changes to camera do not edit the plan. | Captions, references, plan facts and navigation remain usable. |
| preview | Compose a social preview from the actual scene renderer | Eight timed scenes, optional local recording/cancel/download; isolated sample plan | Recording capability failure is explicit; the working planner stays available. |
| studio | Configure the saved screening in perspective, overhead or guest view | Date, audience, screen, light, typed shortcut and separated kit | Full DOM controls and planning checks. |
| resources | Select equipment and understand itemised costs | Availability and selection; return to equipment camera in the studio | Illustrated equipment cards, no WebGL dependency. |
| crew | Inspect supervision and sample training | Add/remove the supervisor; readiness follows shared model | Semantic cards and learning path. |
| field | Keep site context and review the current revision | Original diagram map, notes, reference search, checklist | Map is SVG/DOM; notes remain readable. |
| proposal | Review and export a matching document | Overhead selected venue, crew, run sheet, costs and image export | Document stays usable without rendered scene. |

## Reconcile drift

The original UI gave essential sidebar and form labels 12–14px despite the readability intent. Navigation and form labels now use a larger shared scale; native inputs retain 16px. The new story surface is an intentional expansion of the original workspace, not a replacement of its persistence/review contract. Runtime colours remain in main.css; experience.css consumes those tokens and owns only the named story surface shade.

## Topview integration

`src/camera-shots.json` carries five camera positions, targets and fields of view taken from the actual Topview CLI 0.1.8 study at sceneSequence 100. The source study was translated +0.12 on Y to separate its floor from the renderer ground; the bridge removes that translation. `Scene.jsx` adapts camera distance for narrow aspect ratios while preserving target and orientation. The experience chapters use those same definitions. Presentation views uses the current saved plan; grey study frames are only shown in an optional, explicitly labelled disclosure.

The Topview project lives at `../../social-post-kit/afterlight-topview`. Primitive row banks are composition references, not measured individual seats. Rendered frame copies in public/assets/topview are authored primitive geometry with no downloaded character or third-party model assets.

## Social edit pacing

The preview recorder uses a 41-second sequence: 3.5-second opening, four seconds for the empty space, five to six seconds for setup and equipment scenes, and seven seconds for the final plan. Preserve normal animation speed and give captions and camera changes time to settle. Duration and recording progress derive from the final phase endpoint.
