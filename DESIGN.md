---
name: "Folio (working name)"
description: "An expressive monthly personal finance planner."
colors:
  ink: "#242820"
  background: "#fafbf8"
  white: "#ffffff"
  muted: "#686e63"
  line: "#e1e5db"
  sidebar: "#f3f5ee"
  yellow: "#f3e65c"
  green: "#358760"
  coral: "#ed896f"
  mint: "#d7f1ba"
  positive: "#27734d"
  negative: "#ad4130"
  primary-hover: "#424a36"
  chip: "#eef1e8"
  on-yellow: "#565222"
  yellow-rule: "#c9bf4e"
  on-mint: "#4b6240"
  coral-strong: "#a96854"
  warning: "#8a5a00"
  field-border: "#858c7b"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "46px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  title:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "14px"
    letterSpacing: "0"
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 550
    letterSpacing: "0"
rounded:
  bar: "2px"
  chip: "3px"
  badge: "4px"
  control: "5px"
  panel: "6px"
  merchant: "7px"
  card: "8px"
  circle: "50%"
spacing:
  compact: "4px"
  control-gap: "8px"
  field: "12px"
  card: "22px"
  dialog: "27px"
  section: "36px"
  page-inline: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.negative}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  icon-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    width: "32px"
    height: "32px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px"
  navigation-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "13px 15px"
  account-chip:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "6px 7px"
  budget-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "22px"
  budget-snapshot:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "23px 24px 18px"
---

# Design System: Folio (Working Name)

## Overview

**Creative North Star: "An expressive monthly personal finance planner"**

Graphite text and white surfaces give the financial records a clear, compact structure. A yellow sidebar planner, green income, coral expenses, and mint budget summary make monthly planning expressive and tangible.

Folio is a working name only. This document records the current implementation in `app/globals.css` and `app/components/money-workspace.tsx`, with font loading confirmed in `app/layout.tsx`. The interface addresses Fawaz and displays sample NGN data. Changes persist locally in the browser; bank and email connections are not implemented. This is source inspection, not a rendered accessibility or visual certification.

**Key Characteristics:**

- Compact financial records with prominent balances.
- Graphite and white structure with yellow, green, coral, and mint accents.
- Unframed overview sections separated by fine rules.
- Planner bars, daily cash flow, category strips, and budget ticks.
- Crisp controls, Lucide icons, and modest corner radii.

## Colors

### Primary

Graphite ink anchors text, primary actions, the selected navigation item, and the bar-shaped brand mark. Planner yellow fills the sidebar invitation, monthly budget banner, and disconnected inbox panel.

### Secondary

Income green and expense coral distinguish the comparative bars, daily chart, and legends. Positive and negative text use separate, darker semantic colors, also exposed as the `--positive` and `--negative` custom properties.

### Tertiary

Mint provides the overview budget summary field. Category and account colors come from the imported finance data; preserve those mappings rather than replacing them with the cash-flow palette. Merchant backgrounds mix the category color with white using `color-mix(in srgb,var(--category) 17%,white)`.

### Neutral

The canvas is near-white with a slight green cast. White cards and fields, a pale sidebar, muted labels, and fine divider lines supply structure.

The palette is exposed as custom properties in `app/globals.css`:
- **Surfaces:** `--sidebar` (pale sidebar), `--chip` (chips and segmented tracks), `--hover` (row, nav and icon hover).
- **Lines:** `--line` (decorative dividers), `--line-strong` (button and label outlines), `--field-border` (input boundaries at 3:1 or better on white).
- **Text on colored fields:** `--on-yellow` and `--yellow-rule` on the planner yellow, `--on-mint` on the mint field.
- **Data:** `--coral-strong` (`#A96854`, 4.2:1) fills money-out graphics, so bars pass non-text contrast while the pale `--coral` stays for tints.
- **Status:** `--warning` (`#8A5A00`) marks "Getting close" and "Needs review", kept distinct from the `--negative` red.

- **On graphite:** `--on-ink-muted` (`#B4BBA9`, 7.6:1) for secondary text, `--error-on-ink` (`#F4A38F`, 7.5:1) for errors, and `--line-on-ink` for rules in the graphite account menu.

About 40 one-off hex values remain as local tints.

**The Cash Flow Rule.** Keep green for money in and coral for money out in the cash-flow graphics; retain labels and direction icons alongside color.

## Typography

Geist is the shared display and interface family, loaded through `--font-geist-sans`, with Arial and sans-serif fallbacks. Geist Mono is not loaded.

The frontmatter captures base desktop roles, not a mathematical scale. Balances use tabular numerals and medium weight. The main balance changes to 54px at wide desktop, 38px at compact desktop, 43px at the stacked breakpoint, and 42px on phones. The account total starts at 48px.

Page headings start at 28px; responsive rules use 32, 25, 24, 26, and 25px in cascade order. Section titles are 16px. Supporting copy is commonly 11-12px. 11px is the floor for every label, chart axis, and metadata line. The only exception is the phone bottom-navigation label, which is 10px (`.625rem`) so "Transactions" fits one of six slots at 375px. Budget summary headings use 23px at base desktop. Letter spacing is zero globally; sizes change at explicit breakpoints.

**The Numeric Hierarchy Rule.** Give balances greater visual weight than metadata, and retain tabular numerals on the balance, cash-flow amounts, and transaction amounts.

## Layout

The desktop shell has a fixed 224px sidebar, matching main offset, and a 76px topbar. Main content is centered within a 1550px maximum width with 36px top and 40px horizontal padding. Overview content uses open sections with dividing rules: balance and flow at 1:1, chart and categories at 1.25:1, and recent transactions and budget summary at 1.8:1.

Budget and account collections use three columns. Transaction rows align merchant, category, date, and amount; the overview shows five recent records, while the ledger paginates eight records.

- At a minimum width of 1500px, the sidebar becomes 245px, main top padding becomes 43px, and charts and balances enlarge.
- At a maximum width of 1200px, the sidebar becomes 195px, main horizontal padding becomes 26px, and budget/account grids use two columns.
- At a maximum width of 950px, navigation becomes a 76px icon rail; the planner panel and the profile block disappear, and the top-bar avatar opens the account menu instead. On desktop the profile block is sticky at the sidebar foot, so the nav and planner card scroll beneath it on short viewports while keeping their exact shape. Transaction categories are hidden.
- At a maximum width of 720px, overview and card collections stack, the page action follows the heading, the budget banner stacks, and the ledger search occupies a full row.
- At a maximum width of 480px, navigation becomes a fixed 64px bottom bar with labels; main loses its left offset and reserves bottom space. The topbar becomes 58px, main horizontal padding becomes 20px, and transaction dates disappear.

The sidebar width is the `--sidebar-w` custom property (224, 245, 195, 76, then 0 on phones). The main offset and the centered toast follow it. On phones, the mobile navigation is the bottom bar. Long balances and merchant text allow wrapping. Dialogs use a width capped at 480px and constrained by viewport width, with a viewport-relative maximum height.

## Elevation & Depth

The working surface is predominantly flat. Borders, spacing, and solid color fields separate content; ordinary account and budget cards have no shadows. The selected ledger segment uses a small shadow. Dialogs have a broad shadow and dark translucent backdrop; toasts have a smaller shadow. The account menu uses `0 18px 50px #171f2940, 0 2px 6px #171f2926`. The sign-in panel uses a yellow-tinted `0 24px 60px #5A520F2E, 0 2px 8px #5A520F1F`. Exact shadow values are recorded in the sidecar.

**The Flat Workspace Rule.** Keep overview sections unframed and use shadows only where the implementation already signals selection or an overlay.

## Shapes

Controls have compact corners, with slightly softer planner and summary panels and 8px cards/dialogs. Account and category marks and avatars use circles. Chart bars have lightly rounded tops. The brand uses three skewed bars; the yellow planner illustration uses five rotated, cropped graphite bars. These are CSS shapes and Lucide icons, not raster illustrations.

## Components

- **Actions:** Graphite primary buttons, outlined secondary buttons, and red outlined delete buttons share compact padding and a 39px minimum height. Primary hover changes the fill; all buttons also receive a slight brightness reduction. Disabled buttons use 45% opacity and a not-allowed cursor.
- **Icon controls:** Fixed 32px squares contain 16px Lucide icons. They grow to 44px at 720px and below, along with buttons, segmented controls, text buttons, chips, selects and category rows. The shared icon button supplies a native title tooltip, an accessible label, and `aria-pressed` when it toggles (Filters). Month stepping, balance visibility, filters, export, edit, and close use these controls.
- **Navigation:** Six views (Overview, Transactions, Budgets, Advice, Accounts, Inbox) share icon-and-label buttons, a graphite selected state, and an inbox review count. Selection uses `aria-current`. Compact layouts progressively switch to a rail and bottom navigation. On the rail, labels are visually hidden but still named, and each button has a title. The review count rides as a yellow badge on the Inbox icon in both the rail and the bottom bar.
- **Fields and filters:** White outlined fields have 5px corners. Dialog fields have a 43px minimum height. Search, category/account selects, segmented cash-flow filters, sort, and a review checkbox operate the ledger. The search field shows focus on its container: a green border plus a 1px ring. The transaction form offers only the categories valid for its direction: Income for money in, and spending categories for money out.
- **Focus and feedback:** The global focus-visible outline is 2px green with a 4px offset; chart buttons reduce the offset to 1px. A skip link appears on focus. Form/storage errors use alert roles; toasts use a status role and dismiss after 3500ms.
- **Cash-flow graphics:** Comparative bars reveal over 650ms. Daily paired bars are buttons that select a day and update the net caption; Reset restores the monthly caption. The chart is a single tab stop: arrow keys, Home and End move between days, and the selected day uses `aria-pressed`. Category list rows open filtered transactions. The strip above them is a pointer shortcut hidden from assistive technology, so the list is the one accessible set. The chart's linear gradient draws grid lines.
- **Planner and budget summary:** The yellow sidebar invitation opens budget creation. The mint overview summary has 30 vertical ticks, used/remaining amounts, and a link to budgets. Budget calculations cover the selected month across all accounts, independently of the overview account filter.
- **Budget cards:** White bordered cards show category identity, spent/limit amounts, progress, and editing. At 90% usage the status becomes Getting close in `--warning` amber; above 100% it becomes Over budget in `--negative` red and the progress fill turns red. The Create tile disappears once every spending category has a budget. Unreviewed transactions carry an amber dot and "Needs review", and Inbox rows show signed amounts and dates. The visual bar caps at 100%, while text reports actual usage. A dashed tile opens creation.
- **Transactions and accounts:** Transaction rows open details with category editing, review, and deletion. Account cards show all-time balances and monthly movements. Balance masking substitutes dots in monetary displays; it does not hide chart proportions.
- **Advice small multiples:** Month-bar charts share one month axis. Bars are green for money in, coral mixed 66% with ink for money out, ink for the share kept, and each category's color mixed 66% with ink so every hue holds 3:1 on the canvas. A striped bar is a month in progress, a dotted baseline is a month with no records, and a dashed ink line is the budget for the month shown. Only that month's bar turns negative red when over. Values print under each bar up to six months. Each chart is a single `role="img"` with a spoken month-by-month description. Category cells are unframed and divided by hairlines. An Own/Shared segmented toggle switches the scale.
- **Observations, repeats, and Field notes:** Ranked observations carry a tone dot (coral: worth watching, olive: worth knowing, green: going well) with a legend and screen-reader text, plus text-button actions and guide links. Repeat payments sit in a ruled table. Field notes sit on the yellow planner field as disclosure rows with a graphite "Suggested" tag in yellow text, next to a standing general-information disclaimer.
- **Account:**
  - **Profile block:** The profile sits at the foot of the sidebar: a mint avatar, name and "Personal workspace", with an up-down chevron that turns 180° when open.
  - **Menu:** It opens a graphite account menu with the account header, "About this workspace", "Keyboard shortcuts ?" and "Sign out".
    - **Placement:** The menu is positioned fixed, so the scrolling sidebar can't clip it.
    - **Motion:** It rises 6px, scaling from .97 over 180ms, and exits in 120ms.
    - **Keyboard:** Arrow keys, Home, End and Esc work, and focus returns to the trigger.
  - **Top bar:** Below 951px the sidebar foot is hidden, and the top-bar avatar opens the same menu, dropping downward.
- **About this workspace:** An identity card (avatar, name, "Sample data" chip) and a ruled facts list (name, currency, data, connections). A shortcuts list shows keys as `kbd` caps with a 2px bottom edge. It ends with Sign out and Done. All dialogs rise 10px from .98 scale over 280ms.
- **Keyboard shortcuts:** N adds a transaction (or a budget on Budgets), / searches, 1–6 switch views, [ and ] step months, H hides balances, and ? opens the shortcuts. They are ignored while typing, with a modifier held, or while a dialog or menu is open.
- **Sign-in (`/login`):**
  - **Page:** A planner-yellow page. Folio's shapes sit at the edges and settle in over 800ms, staggered: a mint disc, a teal quarter, a coral half-disc, a lilac square, and the tilted planner bars from the sidebar card at 1.55× scale.
  - **Panel:**
    - **Surface:** One centred white panel, 440px wide, with 12px corners and a soft yellow-tinted shadow, rising 14px on load.
    - **Top:** The wordmark, then a row with a Back link and a plain step marker ("Step 1 of 2", "Step 2 of 2", "Extra security check", "Password reset").
    - **Heading:** A 24px heading with a one-line muted explanation.
  - **Controls:**
    - **Fields:** Labelled 48px fields with a 3.5:1 border. Focus gives a 2px ink ring with a mint halo.
    - **Buttons:** One full-width ink primary button, then outlined secondary buttons under an "or" divider. A spinner shows on whichever button was pressed.
    - **Code:** A six-box code field over a single real input.
  - **Steps:** Each step slides in over 240ms. Honest preview and not-connected notes sit in a soft yellow box, and the foot keeps "Sign-in isn't connected yet · Explore with sample data".
  - **Honesty:** Server actions in `app/lib/auth.ts` are the single integration point. "Check your email" appears only once something was actually sent.
  - **Sign-out:** Menu and About dialog buttons submit `signOut()`, which redirects to `/login`.- **Dialogs and empty states:** Native modal dialogs support Escape, close controls, and backdrop clicks. Forms support transaction creation and budget creation/editing/deletion. Empty states cover missing transactions, no spending, and completed review. The inbox explicitly states that email is disconnected.

State colors transition over 160ms, category strips lift 3px over 150ms on hover, progress widths transition over 300ms, and Advice month bars rise over 500ms with a clip-path reveal. Reduced-motion preferences disable animations and transitions globally.

## Do's and Don'ts

- Do preserve the graphite/white foundation and the yellow planner, green income, coral expense, and mint summary roles.
- Do keep financial labels, direction icons, and status text alongside color.
- Do use open overview sections and compact repeated cards for budgets and accounts.
- Do retain sample-data labeling and identify Folio as a working name.
- Don't imply bank or email integration, or remote persistence, is already implemented.
- Don't replace the observed breakpoint behavior with fluid typography.
- Don't reintroduce hard-coded colors where a custom property exists, or text below 11px outside the documented bottom-navigation exception.
- Don't describe balance masking as hiding the shapes or proportions of the charts.
