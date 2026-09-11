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

Income green and expense coral distinguish the comparative bars, daily chart, and legends. Positive and negative text use separate, darker semantic colors.

### Tertiary

Mint provides the overview budget summary field. Category and account colors come from the imported finance data; preserve those mappings rather than replacing them with the cash-flow palette. Merchant backgrounds mix the category color with white using `color-mix(in srgb,var(--category) 17%,white)`.

### Neutral

The canvas is near-white with a slight green cast. White cards and fields, a pale sidebar, muted labels, and fine divider lines supply structure.

**The Cash Flow Rule.** Keep green for money in and coral for money out in the cash-flow graphics; retain labels and direction icons alongside color.

## Typography

Geist is the shared display and interface family, loaded through `--font-geist-sans`, with Arial and sans-serif fallbacks. Geist Mono is loaded but is not assigned to visible workspace content.

The frontmatter captures base desktop roles, not a mathematical scale. Balances use tabular numerals and medium weight. The main balance changes to 54px at wide desktop, 38px at compact desktop, 43px at the stacked breakpoint, and 42px on phones. The account total starts at 48px.

Page headings start at 28px; responsive rules use 32, 25, 24, 26, and 25px in cascade order. Section titles are 16px. Supporting copy is commonly 11-12px, with dense chart and metadata labels at 8-10px. Budget summary headings use 23px at base desktop. Letter spacing is zero globally; sizes change at explicit breakpoints.

**The Numeric Hierarchy Rule.** Give balances greater visual weight than metadata, and retain tabular numerals on the balance, cash-flow amounts, and transaction amounts.

## Layout

The desktop shell has a fixed 224px sidebar, matching main offset, and a 76px topbar. Main content is centered within a 1550px maximum width with 36px top and 40px horizontal padding. Overview content uses open sections with dividing rules: balance and flow at 1:1, chart and categories at 1.25:1, and recent transactions and budget summary at 1.8:1.

Budget and account collections use three columns. Transaction rows align merchant, category, date, and amount; the overview shows five recent records, while the ledger paginates eight records.

- At a minimum width of 1500px, the sidebar becomes 245px, main top padding becomes 43px, and charts and balances enlarge.
- At a maximum width of 1200px, the sidebar becomes 195px, main horizontal padding becomes 26px, and budget/account grids use two columns.
- At a maximum width of 950px, navigation becomes a 76px icon rail; the planner panel, workspace switch, and sidebar footer disappear. Transaction categories are hidden.
- At a maximum width of 720px, overview and card collections stack, the page action follows the heading, the budget banner stacks, and the ledger search occupies a full row.
- At a maximum width of 480px, navigation becomes a fixed 64px bottom bar with labels; main loses its left offset and reserves bottom space. The topbar becomes 58px, main horizontal padding becomes 20px, and transaction dates disappear.

The menu button is present in markup but hidden by the stylesheet; the implemented mobile navigation is the bottom bar. Long balances and merchant text allow wrapping. Dialogs use a width capped at 480px and constrained by viewport width, with a viewport-relative maximum height.

## Elevation & Depth

The working surface is predominantly flat. Borders, spacing, and solid color fields separate content; ordinary account and budget cards have no shadows. The selected ledger segment uses a small shadow. Dialogs have a broad shadow and dark translucent backdrop; toasts have a smaller shadow. Exact shadow values are recorded in the sidecar.

**The Flat Workspace Rule.** Keep overview sections unframed and use shadows only where the implementation already signals selection or an overlay.

## Shapes

Controls have compact corners, with slightly softer planner and summary panels and 8px cards/dialogs. Account and category marks and avatars use circles. Chart bars have lightly rounded tops. The brand uses three skewed bars; the yellow planner illustration uses five rotated, cropped graphite bars. These are CSS shapes and Lucide icons, not raster illustrations.

## Components

- **Actions:** Graphite primary buttons, outlined secondary buttons, and red outlined delete buttons share compact padding and a 39px minimum height. Primary hover changes the fill; all buttons also receive a slight brightness reduction. Disabled buttons use 45% opacity and a not-allowed cursor.
- **Icon controls:** Fixed 32px squares contain 16px Lucide icons. The shared icon button supplies both a native title tooltip and an accessible label. Month stepping, balance visibility, filters, export, edit, and close use these controls.
- **Navigation:** Five views share icon-and-label buttons, a graphite selected state, and an inbox review count. Selection uses `aria-current`. Compact layouts progressively switch to a rail and bottom navigation.
- **Fields and filters:** White outlined fields have 5px corners. Dialog fields have a 43px minimum height. Search, category/account selects, segmented cash-flow filters, sort, and a review checkbox operate the ledger. The search input specifically removes its outline; do not infer universal focus visibility from the global rule.
- **Focus and feedback:** The global focus-visible outline is 2px green with a 4px offset; chart buttons reduce the offset to 1px. A skip link appears on focus. Form/storage errors use alert roles; toasts use a status role and dismiss after 3500ms.
- **Cash-flow graphics:** Comparative bars reveal over 650ms. Daily paired bars are buttons that select a day and update the net caption; Reset restores the monthly caption. Category strips and list rows open filtered transactions. The chart's linear gradient draws grid lines.
- **Planner and budget summary:** The yellow sidebar invitation opens budget creation. The mint overview summary has 30 vertical ticks, used/remaining amounts, and a link to budgets. Budget calculations cover the selected month across all accounts, independently of the overview account filter.
- **Budget cards:** White bordered cards show category identity, spent/limit amounts, progress, and editing. At 90% usage the status becomes Getting close; above 100% it becomes Over budget and the progress fill turns red. The visual bar caps at 100%, while text reports actual usage. A dashed tile opens creation.
- **Transactions and accounts:** Transaction rows open details with category editing, review, and deletion. Account cards show all-time balances and monthly movements. Balance masking substitutes dots in monetary displays; it does not hide chart proportions.
- **Dialogs and empty states:** Native modal dialogs support Escape, close controls, and backdrop clicks. Forms support transaction creation and budget creation/editing/deletion. Empty states cover missing transactions, no spending, and completed review. The inbox explicitly states that email is disconnected.

State colors transition over 160ms, category strips lift 3px over 150ms on hover, and progress widths transition over 300ms. Reduced-motion preferences disable animations and transitions globally.

## Do's and Don'ts

- Do preserve the graphite/white foundation and the yellow planner, green income, coral expense, and mint summary roles.
- Do keep financial labels, direction icons, and status text alongside color.
- Do use open overview sections and compact repeated cards for budgets and accounts.
- Do retain sample-data labeling and identify Folio as a working name.
- Don't imply bank or email integration, or remote persistence, is already implemented.
- Don't replace the observed breakpoint behavior with fluid typography.
- Don't treat loaded Geist Mono as the current financial display font.
- Don't describe balance masking as hiding the shapes or proportions of the charts.
