---
version: 1
slug: "app-advice-page-tsx"
primary_target: "app/advice/page.tsx"
related_targets: ["app/components/advice-view.tsx","app/lib/advice.ts"]
---

## Scope and mode
The Advice view (`/advice`, and the "Advice" nav item in the workspace). Operate mode for the charts and insights; the Field notes guides follow Read rules (65ch measure, disclosure, no modals).

## Audience and job
Fawaz, the sole user, checks it every month or so to spot patterns over time: what grew, what held steady, what repeats. Then he jumps to the transactions or budget behind a pattern.

## Constraints
- General information only. The disclaimer stays visible next to the guides. No investment, tax or debt recommendations, and no personalised product advice.
- Averages and patterns use full months only. The current month is marked as in progress (striped), never compared as if it were complete.
- Months before the first record, or after today, are "no records", never ₦0.
- All accounts. Budgets are month-scoped: the dashed line is the budget for the month shown, and only that month's bar can be marked over budget.
- Sample data stays labelled. April–July sample history exists only so there are trends to show.

## Direction
Category small multiples on one month axis (seed 06188ca6, candidate 3). Money in, money out and what was kept lead the page, followed by one unframed, hairline-ruled cell per spending category. After those come ranked observations, the repeats table, and Field notes on the yellow planner field. The memorable moment is the Own/Shared scale toggle: flipping it shows which categories are actually large.

## Unresolved
- Performance with real email-parsed volumes: everything is recomputed on each render.
- Browsers with saved demo data from before the history was added will not see April–July until the site data is cleared.
- Whether budgets should carry over between months. They are month-scoped today, so the budget line appears only in months that have budgets.
