---
version: 1
slug: "app-login-page-tsx"
primary_target: "app/login/page.tsx"
related_targets: ["app/components/login-flow.tsx","app/lib/auth.ts"]
---

## Scope and mode
The `/login` route covers email, password, emailed code, two-step code, forgot password and reset sent, plus the sign-out entries in the account menu and the About dialog. Operate mode: the visitor's only job is to get in, and it should need no explanation.

## Audience and job
Fawaz, the sole user, signs in on laptop or phone by email + password, a 6-digit emailed code, or Google, and can recover access through the reset flow.

## Constraints
- **Honest stub:** until the backend exists, `app/lib/auth.ts` is the single integration point. Previews say that nothing was sent or checked, and the final steps report "not connected".
- **Sample data:** "Explore with sample data" stays available, and the workspace is not gated.
- **Code field:** a single real input (`one-time-code`, numeric).
- **User pins:** planner yellow and the shapes stay. Interaction uses one clear panel with a plain step marker, labelled fields and one full-width primary button. No metaphors in the controls.

## Direction
Clear panel on planner yellow. This distils the ledger sheet (seed 88820fd9) after the user found the ledger hard to understand. The character lives in the shapes and colour around the panel; the panel itself is plain.

## Unresolved
- Real sessions and redirects once the backend exists.
- Whether Google stays a sign-in method.
- Rate-limit and lockout copy.
