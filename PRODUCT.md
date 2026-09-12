# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fawaz is the sole intended user for now. Broader consumer or business audiences are not established requirements.

## Product Purpose

Help Fawaz organize personal finances by parsing financial information from his email and sorting it into understandable transactions and categories.

## Operating Context

Fawaz's email is the intended source of financial information. The product should support reviewing and organizing the resulting financial records.

## Brand Commitments

The product name will change. A replacement name has not been chosen. Neither the existing PurseFlow package name nor the Fawaz interface label is a committed product name; Fawaz identifies the user.

## Evidence on Hand

- `app/components/money-workspace.tsx` contains the frontend dashboard, categorization, filters, review controls, budgets, and CSV export.
- `app/lib/finance.ts` contains labeled sample records and shared financial calculations.
- `app/sync/page.tsx` opens the inbox view with an explicit disconnected state. Email parsing is not implemented.
- Existing examples use Nigerian naira. This does not establish a confirmed currency or regional constraint.

## Frontend Scope

Fawaz requested a full frontend recreation: total account balance, money in and out, spending categories, and budget creation. Account and email parsing will be handled separately by Fawaz on the backend. The frontend uses clearly labeled sample data until connected.

The user requested a more expressive visual direction. Folio is a provisional name used in the frontend, not a confirmed replacement name.

## Remaining Decisions

- Replacement product name.
- Email provider and connection method; Gmail appears in the prototype but is not yet confirmed.
- Financial email types to parse and the precise scope of account organization.
- Currency support, privacy and data retention requirements, deployment, and integrations.
