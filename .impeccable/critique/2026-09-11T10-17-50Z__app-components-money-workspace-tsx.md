---
target: whole app (main checkout, uncommitted work)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-09-11T10-17-50Z
slug: app-components-money-workspace-tsx
---
Method: dual-agent (A: design-review sub-agent · B: detector + browser sub-agent)

Target: Folio workspace, main checkout (uncommitted work as of 2026-09-11): app/components/money-workspace.tsx, app/globals.css, app/lib/finance.ts.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Review count badge disappears at <=950px (rail) and <=480px (bottom bar) |
| 2 | Match System / Real World | 3 | Tagline H1s instead of view names; ISO date in detail dialog; unsigned inbox amounts |
| 3 | User Control and Freedom | 2 | Delete transaction/budget is instant, no confirm, no undo |
| 4 | Consistency and Standards | 2 | "Getting close" uses the same red as "Over budget"; off-palette #bd4935; switcher chevron opens About |
| 5 | Error Prevention | 2 | Income offered for money out; money-in silently overrides category |
| 6 | Recognition Rather Than Recall | 2 | Nav buttons have no text or accessible name at 481-950px; collapsed filters hide active sort/review filter |
| 7 | Flexibility and Efficiency | 2 | No shortcuts, no bulk review/recategorize, review dialog does not advance |
| 8 | Aesthetic and Minimalist Design | 3 | Flat and well ruled; noise from permanent sidebar slogan block and 8-11px type |
| 9 | Error Recovery | 3 | Plain messages that suggest fixes; deletions unrecoverable |
| 10 | Help and Documentation | 2 | One About dialog; "Needs review" and "% retained" never explained |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

LLM assessment: partly authored. Palette roles (yellow planner, mint budget, green in, coral out), the skewed-bar mark, 30-tick budget meter and naira copy are Folio's own. The skeleton (sidebar, breadcrumb, tagline H1, balance hero, 3-up card grids, sidebar promo card) is category-interchangeable. The product's real mechanism, turning email into reviewed transactions, is the least designed path.

Deterministic scan: 133 CLI findings. Live UI 73: 40 hard-coded colors (real: 36 in globals.css, #bd4935 inline, 3 account colors), 33 font sizes (14 undocumented = real, 19 documented in DESIGN.md prose = false positives). 60 findings in two unrendered legacy prototypes (app/hhh.tsx, app/jui.html). Browser detector on 4 views: 127 undersized/tiny text findings (56 on Overview), overused-font (Geist 100%) = false positive for an Operate surface. No overflow, no console errors. Detector missed every accessibility and interaction finding below; the LLM missed the extent of token drift.

Visual overlays: ran in the evidence agent's own tab, since closed; no live overlay remains.

## Priority Issues

- [P1] Core review workflow under-designed. Inbox rows lack sign/date/category; one-at-a-time review with a dialog that does not advance; "Needs review" styled identically to "Reviewed"; badge hidden on small screens. Fix: queue with inline category + confirm, auto-advance, distinct review marker, badge dot on rail/bar. Command: /impeccable layout
- [P1] Accessibility breaks at the rail breakpoint and in charts. Unnamed nav buttons 481-950px; spending strip buttons inside role="img"; 30 day-bars as tab stops; search input has no focus indicator; 8-9px text at ~4:1. Fix: visually-hidden labels + title, drop role="img", roving tabindex, :focus-within ring, 12px floor. Command: /impeccable harden
- [P1] Destructive and committing actions lack guardrails. Instant delete, instant category commit, silent category override. Fix: undo toast or confirm step; filter categories by type. Command: /impeccable harden
- [P2] Tiny type and slogan copy. 81 of ~110 Overview text nodes are 8-11px; poetic section titles; permanent slogan block. Fix: view-name H1s, functional section titles, 12px minimum, live status in the yellow block. Commands: /impeccable typeset, /impeccable clarify
- [P2] Responsive loses signals and targets are small. 51 of 62 mobile Overview targets under 44px; 9px bottom-nav labels; primary action at top. Command: /impeccable adapt

## Persona Red Flags

Alex (power user): no shortcuts; 30 day-bar tab stops between chart and categories; 3 clicks per review item; no bulk actions; months only steppable.
Sam (accessibility): unnamed nav at 481-950px; strip buttons hidden by role="img"; invisible search focus; ISO month read aloud on day bars; 3.5s toasts; 8-9px text at ~4:1.
Fawaz (sole user): budgets do not carry over to next month; inbox rows cannot be judged without opening; no budget pace context; review badge vanishes on phone.

## Minor Observations

Three entry points to the same About dialog; Create budget tile persists when no categories remain; toast offset assumes a 224px sidebar; Geist Mono loaded but unused; month navigation runs into empty future months; 24 of 30 chart days empty on sample data.

## Questions to Consider

- Should the review queue, not the balance, be the home screen?
- What if the yellow planner block carried live state instead of a slogan?
- Should a budget be a standing plan that carries over, with only actuals changing?
- Does a one-person tool need a tagline H1 on every view?
