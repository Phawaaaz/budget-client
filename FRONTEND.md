# Frontend Integration

The app is a local demo. No email or bank connection is implemented.

- `app/lib/finance.ts` defines Account, Transaction, Budget and FinanceData, plus sample data and shared calculations.
- `app/components/money-workspace.tsx` loads the sample or browser-saved snapshot and applies mutations through `update`.
- Replace the initial snapshot load and `update` persistence with your backend queries and mutations. No endpoint contract is assumed.
- Amounts are positive NGN values; `type` determines direction. Account balances are opening balance plus all recorded inflows minus outflows. Monthly summaries use transaction dates, independently of the all-time account balance.
- Opening balances must precede all imported transactions. Represent internal transfers separately or exclude them from income and expense totals before integration.
- Budgets are unique per category and month and cover all accounts. Transaction account filters do not change budget calculations.
- Local demo storage key: `folio-demo-v1`. Treat backend data as authoritative when connected and remove the sample-data labels only after real data is loaded.
- `/sync` opens the inbox and review view without simulating a successful connection.

Run locally with `node node_modules/next/dist/bin/next dev --port 3010`.
