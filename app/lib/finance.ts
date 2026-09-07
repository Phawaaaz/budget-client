export type Category = "Food & groceries" | "Shopping" | "Transport" | "Bills & subscriptions" | "Lifestyle" | "Income" | "Other";
export type Transaction = { id: string; merchant: string; note: string; amount: number; type: "in" | "out"; date: string; category: Category; accountId: string; reviewed: boolean; source: "Sample email" | "Manual" };
export type Account = { id: string; name: string; kind: string; openingBalance: number; color: string };
export type Budget = { id: string; category: Category; limit: number; month: string };
export type FinanceData = { version: 1; accounts: Account[]; transactions: Transaction[]; budgets: Budget[] };
export const categories: Category[] = ["Food & groceries", "Shopping", "Transport", "Bills & subscriptions", "Lifestyle", "Income", "Other"];
export const categoryColors: Record<Category, string> = { "Food & groceries": "#358760", Shopping: "#ed896f", Transport: "#e7c449", "Bills & subscriptions": "#aaa2ca", Lifestyle: "#69aebc", Income: "#358760", Other: "#92958f" };
export const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
export const shortMoney = (amount: number) => amount >= 1000000 ? `₦${(amount / 1000000).toFixed(2)}m` : amount >= 1000 ? `₦${Math.round(amount / 1000)}k` : money(amount);
export const monthLabel = (month: string) => new Date(`${month}-02T12:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
export function monthTransactions(data: FinanceData, month: string, accountId = "all") {
  return data.transactions.filter(t => t.date.startsWith(month) && (accountId === "all" || t.accountId === accountId));
}
export function totals(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const spending = transactions.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
  return { income, spending, net: income - spending };
}
export function accountBalance(data: FinanceData, id: string) {
  return (data.accounts.find(a => a.id === id)?.openingBalance ?? 0) + totals(data.transactions.filter(t => t.accountId === id)).net;
}
const rows: [string, string, number, "in" | "out", string, Category, string, boolean][] = [
  ["Shoprite", "Weekly groceries", 38500, "out", "2026-09-06", "Food & groceries", "kuda", false],
  ["Bolt", "Ride to Lekki", 6200, "out", "2026-09-06", "Transport", "kuda", true],
  ["Client payment", "September design project", 350000, "in", "2026-09-05", "Income", "gtb", true],
  ["Spotify", "Premium subscription", 1600, "out", "2026-09-05", "Bills & subscriptions", "kuda", true],
  ["Jumia", "Desk accessories", 42500, "out", "2026-09-04", "Shopping", "gtb", false],
  ["The Place", "Lunch with friends", 14800, "out", "2026-09-04", "Food & groceries", "kuda", true],
  ["MTN", "Monthly data plan", 15000, "out", "2026-09-03", "Bills & subscriptions", "gtb", true],
  ["Filmhouse", "Movie night", 18000, "out", "2026-09-03", "Lifestyle", "kuda", true],
  ["Paystack payout", "Website maintenance", 180000, "in", "2026-09-02", "Income", "gtb", false],
  ["Ikeja Electric", "Prepaid electricity", 30000, "out", "2026-09-02", "Bills & subscriptions", "gtb", true],
  ["Market run", "Fresh produce", 24700, "out", "2026-09-02", "Food & groceries", "kuda", true],
  ["Uber", "Airport trip", 14500, "out", "2026-09-01", "Transport", "gtb", true],
  ["Nike", "Running essentials", 48500, "out", "2026-09-01", "Shopping", "gtb", true],
  ["Client payment", "August project", 420000, "in", "2026-08-25", "Income", "gtb", true],
  ["Shoprite", "Groceries", 85000, "out", "2026-08-27", "Food & groceries", "gtb", true],
  ["Jumia", "Office supplies", 125000, "out", "2026-08-20", "Shopping", "gtb", true],
  ["MTN", "Data", 35000, "out", "2026-08-12", "Bills & subscriptions", "gtb", true],
  ["Bolt", "Transport", 42500, "out", "2026-08-06", "Transport", "gtb", true],
];
export const sampleData: FinanceData = {
  version: 1,
  accounts: [
    { id: "gtb", name: "GTBank", kind: "Everyday account", openingBalance: 385000, color: "#d9744e" },
    { id: "kuda", name: "Kuda", kind: "Spending account", openingBalance: 175000, color: "#8e83b2" },
    { id: "savings", name: "Savings", kind: "Rainy-day fund", openingBalance: 450000, color: "#44846a" },
  ],
  transactions: rows.map(([merchant, note, amount, type, date, category, accountId, reviewed], index) => ({ id: `sample-${index}`, merchant, note, amount, type, date, category, accountId, reviewed, source: "Sample email" })),
  budgets: [
    { id: "b1", category: "Food & groceries", limit: 120000, month: "2026-09" },
    { id: "b2", category: "Shopping", limit: 100000, month: "2026-09" },
    { id: "b3", category: "Transport", limit: 50000, month: "2026-09" },
    { id: "b4", category: "Bills & subscriptions", limit: 80000, month: "2026-09" },
    { id: "b5", category: "Lifestyle", limit: 50000, month: "2026-09" },
  ],
};
export function isFinanceData(value: unknown): value is FinanceData {
  if (!value || typeof value !== "object") return false;
  const d = value as FinanceData;
  return d.version === 1 && Array.isArray(d.accounts) && d.accounts.length > 0 && d.accounts.every(a => typeof a.id === "string" && typeof a.name === "string" && Number.isFinite(a.openingBalance)) && Array.isArray(d.transactions) && d.transactions.every(t => typeof t.id === "string" && typeof t.merchant === "string" && typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Number.isFinite(t.amount) && t.amount > 0 && ["in", "out"].includes(t.type) && categories.includes(t.category) && d.accounts.some(a => a.id === t.accountId)) && Array.isArray(d.budgets) && d.budgets.every(b => typeof b.id === "string" && categories.includes(b.category) && Number.isFinite(b.limit) && b.limit > 0 && /^\d{4}-\d{2}$/.test(b.month));
}
