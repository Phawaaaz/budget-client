import { ArrowDownLeft, Car, Circle, Music, ShoppingBag, Utensils, Zap } from "lucide-react";

export type Category = "Food & groceries" | "Shopping" | "Transport" | "Bills & subscriptions" | "Lifestyle" | "Income" | "Other";
export type Transaction = { id: string; merchant: string; note: string; amount: number; type: "in" | "out"; date: string; category: Category; accountId: string; reviewed: boolean; source: "Sample email" | "Manual" };
export type Account = { id: string; name: string; kind: string; openingBalance: number; color: string };
export type Budget = { id: string; category: Category; limit: number; month: string };
export type FinanceData = { version: 1; accounts: Account[]; transactions: Transaction[]; budgets: Budget[] };
export const categories: Category[] = ["Food & groceries", "Shopping", "Transport", "Bills & subscriptions", "Lifestyle", "Income", "Other"];
export const categoryColors: Record<Category, string> = { "Food & groceries": "#358760", Shopping: "#ed896f", Transport: "#e7c449", "Bills & subscriptions": "#aaa2ca", Lifestyle: "#69aebc", Income: "#358760", Other: "#92958f" };
export const categoryIcons: Record<Category, typeof Circle> = { "Food & groceries": Utensils, Shopping: ShoppingBag, Transport: Car, "Bills & subscriptions": Zap, Lifestyle: Music, Income: ArrowDownLeft, Other: Circle };
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
  // April–July history so the Advice page has months to compare. Sample only.
  ["Client payment", "Website redesign", 285000, "in", "2026-07-25", "Income", "gtb", true],
  ["Paystack payout", "Website maintenance", 120000, "in", "2026-07-14", "Income", "kuda", true],
  ["Shoprite", "Monthly groceries", 55800, "out", "2026-07-04", "Food & groceries", "kuda", true],
  ["Market run", "Fresh produce", 24000, "out", "2026-07-12", "Food & groceries", "kuda", true],
  ["The Place", "Lunch with friends", 18000, "out", "2026-07-19", "Food & groceries", "kuda", true],
  ["Jumia", "Monitor stand", 41400, "out", "2026-07-09", "Shopping", "gtb", true],
  ["Nike", "Trainers", 55000, "out", "2026-07-21", "Shopping", "gtb", true],
  ["Bolt", "Rides this month", 24100, "out", "2026-07-16", "Transport", "kuda", true],
  ["Uber", "Client meetings", 20000, "out", "2026-07-23", "Transport", "gtb", true],
  ["MTN", "Monthly data plan", 15000, "out", "2026-07-03", "Bills & subscriptions", "gtb", true],
  ["Spotify", "Premium subscription", 1600, "out", "2026-07-05", "Bills & subscriptions", "kuda", true],
  ["Ikeja Electric", "Prepaid electricity", 28000, "out", "2026-07-02", "Bills & subscriptions", "gtb", true],
  ["Filmhouse", "Movie night", 22000, "out", "2026-07-26", "Lifestyle", "kuda", true],
  ["Client payment", "Mobile app design", 520000, "in", "2026-06-27", "Income", "gtb", true],
  ["Shoprite", "Monthly groceries", 58300, "out", "2026-06-06", "Food & groceries", "kuda", true],
  ["Market run", "Fresh produce", 26000, "out", "2026-06-13", "Food & groceries", "kuda", true],
  ["Chicken Republic", "Lunch", 20000, "out", "2026-06-20", "Food & groceries", "kuda", true],
  ["Jumia", "Keyboard", 46000, "out", "2026-06-10", "Shopping", "gtb", true],
  ["Konga", "Desk lamp", 25000, "out", "2026-06-24", "Shopping", "gtb", true],
  ["Bolt", "Rides this month", 20400, "out", "2026-06-17", "Transport", "kuda", true],
  ["Uber", "Island meeting", 18000, "out", "2026-06-11", "Transport", "gtb", true],
  ["MTN", "Monthly data plan", 15000, "out", "2026-06-03", "Bills & subscriptions", "gtb", true],
  ["Spotify", "Premium subscription", 1600, "out", "2026-06-05", "Bills & subscriptions", "kuda", true],
  ["Ikeja Electric", "Prepaid electricity", 30000, "out", "2026-06-02", "Bills & subscriptions", "gtb", true],
  ["Filmhouse", "Movie night", 14500, "out", "2026-06-14", "Lifestyle", "kuda", true],
  ["Hard Rock Cafe", "Dinner with friends", 20000, "out", "2026-06-28", "Lifestyle", "kuda", true],
  ["Gift for Mum", "Birthday gift", 15000, "out", "2026-06-18", "Other", "kuda", true],
  ["Client payment", "Brand refresh project", 310000, "in", "2026-05-24", "Income", "gtb", true],
  ["Paystack payout", "Template sales", 90000, "in", "2026-05-12", "Income", "kuda", true],
  ["Shoprite", "Monthly groceries", 49000, "out", "2026-05-02", "Food & groceries", "kuda", true],
  ["Market run", "Fresh produce", 23500, "out", "2026-05-16", "Food & groceries", "kuda", true],
  ["The Place", "Lunch with friends", 16000, "out", "2026-05-22", "Food & groceries", "kuda", true],
  ["Jumia", "Headphones", 52500, "out", "2026-05-08", "Shopping", "gtb", true],
  ["Bolt", "Rides this month", 22000, "out", "2026-05-15", "Transport", "kuda", true],
  ["Uber", "Airport trip", 19000, "out", "2026-05-27", "Transport", "gtb", true],
  ["MTN", "Monthly data plan", 15000, "out", "2026-05-03", "Bills & subscriptions", "gtb", true],
  ["Spotify", "Premium subscription", 1600, "out", "2026-05-05", "Bills & subscriptions", "kuda", true],
  ["Ikeja Electric", "Prepaid electricity", 27500, "out", "2026-05-02", "Bills & subscriptions", "gtb", true],
  ["Filmhouse", "Movie night", 18000, "out", "2026-05-09", "Lifestyle", "kuda", true],
  ["Client payment", "April retainer", 380000, "in", "2026-04-26", "Income", "gtb", true],
  ["Shoprite", "Monthly groceries", 54000, "out", "2026-04-05", "Food & groceries", "kuda", true],
  ["Market run", "Fresh produce", 21500, "out", "2026-04-12", "Food & groceries", "kuda", true],
  ["Chicken Republic", "Lunch", 16500, "out", "2026-04-19", "Food & groceries", "kuda", true],
  ["Jumia", "Phone case and charger", 38000, "out", "2026-04-15", "Shopping", "gtb", true],
  ["Bolt", "Rides this month", 18700, "out", "2026-04-08", "Transport", "kuda", true],
  ["Uber", "Island meeting", 17500, "out", "2026-04-22", "Transport", "gtb", true],
  ["MTN", "Monthly data plan", 15000, "out", "2026-04-03", "Bills & subscriptions", "gtb", true],
  ["Spotify", "Premium subscription", 1600, "out", "2026-04-05", "Bills & subscriptions", "kuda", true],
  ["Ikeja Electric", "Prepaid electricity", 25000, "out", "2026-04-02", "Bills & subscriptions", "gtb", true],
  ["Filmhouse", "Movie night", 12000, "out", "2026-04-18", "Lifestyle", "kuda", true],
  ["Hard Rock Cafe", "Birthday dinner", 14500, "out", "2026-04-11", "Lifestyle", "kuda", true],
  ["Gift for Tolu", "Birthday gift", 10000, "out", "2026-04-27", "Other", "kuda", true],
];
export const sampleData: FinanceData = {
  version: 1,
  // Opening balances are as of 1 April, so every current balance stays positive with the history above.
  accounts: [
    { id: "gtb", name: "GTBank", kind: "Everyday account", openingBalance: 45000, color: "#d9744e" },
    { id: "kuda", name: "Kuda", kind: "Spending account", openingBalance: 540000, color: "#8e83b2" },
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
  return d.version === 1
    && Array.isArray(d.accounts) && d.accounts.length > 0
    && d.accounts.every(a => a && typeof a.id === "string" && typeof a.name === "string" && typeof a.kind === "string" && typeof a.color === "string" && Number.isFinite(a.openingBalance))
    && Array.isArray(d.transactions)
    && d.transactions.every(t => t && typeof t.id === "string" && typeof t.merchant === "string" && typeof t.note === "string" && typeof t.reviewed === "boolean" && ["Sample email", "Manual"].includes(t.source) && typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Number.isFinite(t.amount) && t.amount > 0 && ["in", "out"].includes(t.type) && categories.includes(t.category) && d.accounts.some(a => a.id === t.accountId))
    && Array.isArray(d.budgets)
    && d.budgets.every(b => b && typeof b.id === "string" && categories.includes(b.category) && b.category !== "Income" && Number.isFinite(b.limit) && b.limit > 0 && /^\d{4}-(0[1-9]|1[0-2])$/.test(b.month))
    && new Set(d.budgets.map(b => `${b.month}:${b.category}`)).size === d.budgets.length;
}
