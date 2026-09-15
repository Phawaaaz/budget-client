// Client for budget-server, reached only through this app's own /api/*
// route handlers (see app/api/_lib/backend.ts) so the shared BUDGET_API_KEY
// never ships to the browser. The two Google OAuth routes are the
// exception - they're plain browser redirects straight to budget-server.

import type { Account, Budget, Category, FinanceData, Transaction } from "./finance";

export type BackendCategory = { id: string; name: string; color: string };
export type BackendAccount = { id: string; name: string; kind: string; openingBalance: number; color: string; balance: number | null };
export type BackendTransaction = {
  id: string;
  accountId: string;
  categoryId: string;
  category: string;
  merchant: string;
  note: string;
  amount: number;
  type: "in" | "out";
  date: string;
  reviewed: boolean;
  source: string;
};
export type BackendBudget = { id: string; categoryId: string; category: string; limit: number; month: string };
export type SyncStatus = { connected: boolean; provider: string | null; email: string | null; lastSyncedAt: string | null };
export type SyncResult = { fetched: number; created: number; skipped: number };

class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new ApiError(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function fetchCategories() {
  return request<BackendCategory[]>("/api/categories");
}
export function fetchAccounts() {
  return request<BackendAccount[]>("/api/accounts");
}
export function fetchTransactions() {
  return request<BackendTransaction[]>("/api/transactions");
}
export function fetchBudgets() {
  return request<BackendBudget[]>("/api/budgets");
}

export function createTransaction(payload: {
  accountId: string;
  categoryId: string;
  merchant: string;
  amount: number;
  type: "in" | "out";
  date: string;
  note?: string;
  reviewed?: boolean;
  source?: string;
}) {
  return request<BackendTransaction>("/api/transactions", { method: "POST", body: JSON.stringify(payload) });
}
export function updateTransaction(id: string, payload: Partial<{ categoryId: string; reviewed: boolean; merchant: string; note: string }>) {
  return request<BackendTransaction>(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteTransaction(id: string) {
  return request<void>(`/api/transactions/${id}`, { method: "DELETE" });
}

export function createBudget(payload: { categoryId: string; limit: number; month: string }) {
  return request<BackendBudget>("/api/budgets", { method: "POST", body: JSON.stringify(payload) });
}
export function updateBudget(id: string, payload: Partial<{ limit: number }>) {
  return request<BackendBudget>(`/api/budgets/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteBudget(id: string) {
  return request<void>(`/api/budgets/${id}`, { method: "DELETE" });
}

export function fetchSyncStatus() {
  return request<SyncStatus>("/api/sync/status");
}
export function runSync() {
  return request<SyncResult>("/api/sync/run", { method: "POST" });
}

// Plain browser redirect straight to budget-server - not proxied, since
// it's Google's own redirect flow and the CSRF state cookie is scoped to
// budget-server's origin.
export function googleConnectUrl() {
  const base = process.env.NEXT_PUBLIC_BUDGET_API_URL ?? "http://localhost:3000";
  return `${base}/api/sync/google/start`;
}

function toFrontendSource(source: string): Transaction["source"] {
  return source === "Email" ? "Email" : "Manual";
}

export function buildCategoryMaps(categories: BackendCategory[]) {
  const idByName = {} as Record<Category, string>;
  const nameById = {} as Record<string, Category>;
  for (const c of categories) {
    idByName[c.name as Category] = c.id;
    nameById[c.id] = c.name as Category;
  }
  return { idByName, nameById };
}

export function toFinanceData(
  accounts: BackendAccount[],
  transactions: BackendTransaction[],
  budgets: BackendBudget[]
): FinanceData {
  const feAccounts: Account[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
    openingBalance: a.openingBalance,
    color: a.color,
  }));
  const feTransactions: Transaction[] = transactions.map((t) => ({
    id: t.id,
    merchant: t.merchant,
    note: t.note,
    amount: t.amount,
    type: t.type,
    date: t.date,
    category: t.category as Category,
    accountId: t.accountId,
    reviewed: t.reviewed,
    source: toFrontendSource(t.source),
  }));
  const feBudgets: Budget[] = budgets.map((b) => ({
    id: b.id,
    category: b.category as Category,
    limit: b.limit,
    month: b.month,
  }));
  return { version: 1, accounts: feAccounts, transactions: feTransactions, budgets: feBudgets };
}

export { ApiError };
