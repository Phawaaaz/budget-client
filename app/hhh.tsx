"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

/* ============================================================================
 * TYPES
 * ==========================================================================*/

type TransactionType = "DEBIT" | "CREDIT";
type ViewMode = "tree" | "kanban" | "calendar";

interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  categoryId: string;
}

interface Transaction {
  id: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  rawEmailSubject: string;
  amount: number;
  type: TransactionType;
  items: ReceiptItem[];
}

interface Subcategory {
  id: string;
  name: string;
  transactions: Transaction[];
}

interface ParentCategory {
  id: string;
  name: string;
  type: TransactionType;
  subcategories: Subcategory[];
}

interface CategoryOption {
  id: string;
  name: string;
}

interface FlatItemEntry {
  parentType: TransactionType;
  parentName: string;
  subName: string;
  merchant: string;
  date: string;
  txId: string;
  item: ReceiptItem;
}

interface PendingRuleItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
}

/* ============================================================================
 * MOCK DATA — the only hardcoded data in this file. Once a real backend
 * exists, delete this block along with the in-memory store in the API
 * LAYER section below.
 * ==========================================================================*/

const INITIAL_CATEGORIES: CategoryOption[] = [
  { id: "cat-groceries", name: "Groceries & Provisions" },
  { id: "cat-dining", name: "Dining & Restaurants" },
  { id: "cat-electronics", name: "Electronics & Hardware" },
  { id: "cat-clothing", name: "Apparel & Accessories" },
  { id: "cat-software", name: "Software & SaaS Subscriptions" },
  { id: "cat-cloud", name: "Cloud Server & Hosting" },
  { id: "cat-utilities", name: "Electricity & Utilities" },
  { id: "cat-logistics", name: "Shipping & Delivery" },
  { id: "cat-freelance", name: "Client Invoices" },
];

const INITIAL_DATA: ParentCategory[] = [
  {
    id: "parent-1",
    name: "Food & Household Supplies",
    type: "DEBIT",
    subcategories: [
      {
        id: "sub-1",
        name: "Supermarket & Provisions",
        transactions: [
          {
            id: "tx-1",
            merchant: "Jumia Supermarket",
            date: "2026-08-26",
            rawEmailSubject: "Your Jumia Order Confirmation #89201",
            amount: 58500,
            type: "DEBIT",
            items: [
              {
                id: "item-1",
                description: "Basmati Rice 5kg",
                quantity: 2,
                unitPrice: 15000,
                totalAmount: 30000,
                categoryId: "cat-groceries",
              },
              {
                id: "item-2",
                description: "Wireless Mouse & USB Dongle",
                quantity: 1,
                unitPrice: 23500,
                totalAmount: 23500,
                categoryId: "cat-electronics",
              },
              {
                id: "item-3",
                description: "Express Delivery Fee",
                quantity: 1,
                unitPrice: 5000,
                totalAmount: 5000,
                categoryId: "cat-logistics",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "parent-2",
    name: "Earnings & Settlements",
    type: "CREDIT",
    subcategories: [
      {
        id: "sub-2",
        name: "Client Payments",
        transactions: [
          {
            id: "tx-2",
            merchant: "Paystack Direct Deposit",
            date: "2026-08-25",
            rawEmailSubject: "Paystack: Payout Confirmation #PAY-9912",
            amount: 250000,
            type: "CREDIT",
            items: [
              {
                id: "item-4",
                description: "Custom Web App Design Deposit",
                quantity: 1,
                unitPrice: 250000,
                totalAmount: 250000,
                categoryId: "cat-freelance",
              },
            ],
          },
        ],
      },
    ],
  },
];

/* ============================================================================
 * API LAYER — ★ the backend integration point.
 *
 * Every function below is a stand-in for a real API call. The rest of this
 * file only ever calls these functions — never the mock store directly.
 *
 * To wire up a real backend:
 *   1. Delete the in-memory store and the delay() helper just below.
 *   2. Replace each function body with a `fetch(...)` call to your API,
 *      keeping the same signature and return type. Each has a
 *      TODO(backend) comment with a suggested route + verb.
 *   3. Nothing else in this file needs to change.
 * ==========================================================================*/

let dataStore: ParentCategory[] =
  typeof structuredClone === "function"
    ? structuredClone(INITIAL_DATA)
    : JSON.parse(JSON.stringify(INITIAL_DATA));
let categoryStore: CategoryOption[] =
  typeof structuredClone === "function"
    ? structuredClone(INITIAL_CATEGORIES)
    : JSON.parse(JSON.stringify(INITIAL_CATEGORIES));

const SIMULATED_LATENCY_MS = 250;
const delay = (ms = SIMULATED_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiFetchTransactions(): Promise<ParentCategory[]> {
  // TODO(backend): GET /api/transactions
  await delay();
  return JSON.parse(JSON.stringify(dataStore));
}

async function apiFetchCategories(): Promise<CategoryOption[]> {
  // TODO(backend): GET /api/categories
  await delay();
  return JSON.parse(JSON.stringify(categoryStore));
}

async function apiUpdateItemCategory(itemId: string, categoryId: string): Promise<void> {
  // TODO(backend): PATCH /api/items/:itemId  { categoryId }
  await delay();
  dataStore = dataStore.map((parent) => ({
    ...parent,
    subcategories: parent.subcategories.map((sub) => ({
      ...sub,
      transactions: sub.transactions.map((tx) => ({
        ...tx,
        items: tx.items.map((item) => (item.id === itemId ? { ...item, categoryId } : item)),
      })),
    })),
  }));
}

async function apiBulkUpdateItemCategory(itemIds: string[], categoryId: string): Promise<void> {
  // TODO(backend): PATCH /api/items/bulk-category  { itemIds, categoryId }
  await delay();
  const idSet = new Set(itemIds);
  dataStore = dataStore.map((parent) => ({
    ...parent,
    subcategories: parent.subcategories.map((sub) => ({
      ...sub,
      transactions: sub.transactions.map((tx) => ({
        ...tx,
        items: tx.items.map((item) => (idSet.has(item.id) ? { ...item, categoryId } : item)),
      })),
    })),
  }));
}

async function apiAddLineItem(
  transactionId: string,
  item: Omit<ReceiptItem, "id">
): Promise<ReceiptItem> {
  // TODO(backend): POST /api/transactions/:transactionId/items  -> ReceiptItem
  await delay();
  const newItem: ReceiptItem = { ...item, id: `item-${Date.now()}` };
  dataStore = dataStore.map((parent) => ({
    ...parent,
    subcategories: parent.subcategories.map((sub) => ({
      ...sub,
      transactions: sub.transactions.map((tx) => {
        if (tx.id !== transactionId) return tx;
        const items = [...tx.items, newItem];
        return { ...tx, items, amount: items.reduce((sum, i) => sum + i.totalAmount, 0) };
      }),
    })),
  }));
  return newItem;
}

async function apiDeleteLineItem(transactionId: string, itemId: string): Promise<void> {
  // TODO(backend): DELETE /api/items/:itemId
  await delay();
  dataStore = dataStore.map((parent) => ({
    ...parent,
    subcategories: parent.subcategories.map((sub) => ({
      ...sub,
      transactions: sub.transactions.map((tx) => {
        if (tx.id !== transactionId) return tx;
        const items = tx.items.filter((i) => i.id !== itemId);
        return { ...tx, items, amount: items.reduce((sum, i) => sum + i.totalAmount, 0) };
      }),
    })),
  }));
}

async function apiCreateCategory(name: string): Promise<CategoryOption> {
  // TODO(backend): POST /api/categories  { name }  -> CategoryOption
  await delay();
  const newCategory: CategoryOption = { id: `cat-${Date.now()}`, name };
  categoryStore = [...categoryStore, newCategory];
  return newCategory;
}

async function apiSaveAutoCategorizationRule(matchName: string, categoryId: string): Promise<void> {
  // TODO(backend): POST /api/rules  { matchName, categoryId }
  await delay();
  // No-op against the mock store — future line items matching this
  // description would be auto-categorized server-side once wired up.
  void matchName;
  void categoryId;
}

/* ============================================================================
 * DATA HOOK — owns fetching + mutations, exposes them to the UI below.
 * Every mutation re-fetches afterward instead of hand-patching local state,
 * so this hook needs no changes once the API layer above talks to a real
 * backend.
 * ==========================================================================*/

function useBudgetData() {
  const [data, setData] = useState<ParentCategory[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactions, cats] = await Promise.all([apiFetchTransactions(), apiFetchCategories()]);
      setData(transactions);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeItemCategory = useCallback(
    async (itemId: string, categoryId: string) => {
      await apiUpdateItemCategory(itemId, categoryId);
      await load();
    },
    [load]
  );

  const bulkChangeCategory = useCallback(
    async (itemIds: string[], categoryId: string) => {
      await apiBulkUpdateItemCategory(itemIds, categoryId);
      await load();
    },
    [load]
  );

  const addLineItem = useCallback(
    async (transactionId: string, fallbackCategoryId: string) => {
      const newItem: Omit<ReceiptItem, "id"> = {
        description: "New Item Entry",
        quantity: 1,
        unitPrice: 1000,
        totalAmount: 1000,
        categoryId: fallbackCategoryId,
      };
      await apiAddLineItem(transactionId, newItem);
      await load();
    },
    [load]
  );

  const deleteLineItem = useCallback(
    async (transactionId: string, itemId: string) => {
      await apiDeleteLineItem(transactionId, itemId);
      await load();
    },
    [load]
  );

  const addCategory = useCallback(
    async (name: string) => {
      const created = await apiCreateCategory(name);
      await load();
      return created;
    },
    [load]
  );

  const saveRule = useCallback(async (matchName: string, categoryId: string) => {
    await apiSaveAutoCategorizationRule(matchName, categoryId);
  }, []);

  const allFlatItems = useMemo<FlatItemEntry[]>(() => {
    const list: FlatItemEntry[] = [];
    data.forEach((parent) => {
      parent.subcategories.forEach((sub) => {
        sub.transactions.forEach((tx) => {
          tx.items.forEach((item) => {
            list.push({
              parentType: parent.type,
              parentName: parent.name,
              subName: sub.name,
              merchant: tx.merchant,
              date: tx.date,
              txId: tx.id,
              item,
            });
          });
        });
      });
    });
    return list;
  }, [data]);

  const totals = useMemo(() => {
    const byType = (type: TransactionType) =>
      allFlatItems.filter((entry) => entry.parentType === type).reduce((sum, e) => sum + e.item.totalAmount, 0);
    const debit = byType("DEBIT");
    const credit = byType("CREDIT");
    return { debit, credit, net: credit - debit };
  }, [allFlatItems]);

  return {
    data,
    categories,
    isLoading,
    error,
    reload: load,
    allFlatItems,
    totals,
    changeItemCategory,
    bulkChangeCategory,
    addLineItem,
    deleteLineItem,
    addCategory,
    saveRule,
  };
}

/* ============================================================================
 * SMALL PRESENTATIONAL PIECES
 * ==========================================================================*/

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-purple-950 text-purple-100 text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-purple-800"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}

function useToast(durationMs = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs]
  );
  return { toastMessage: message, showToast };
}

function DashboardHeader() {
  return (
    <header className="bg-purple-900 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-purple-600 p-2 rounded-xl text-white shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg leading-none truncate">Fawaz</h1>
            <p className="text-[10px] sm:text-xs text-purple-300">Email Budgeting Hub</p>
          </div>
        </div>

        <Link
          href="/sync"
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Mail</span>
        </Link>
      </div>
    </header>
  );
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function StatCards({
  totalDebit,
  totalCredit,
  netBalance,
}: {
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-purple-100 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
          Total Expenses (Debit)
        </span>
        <div className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
          {formatNaira(totalDebit)}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-purple-100 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
          Total Income (Credit)
        </span>
        <div className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
          {formatNaira(totalCredit)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-md sm:col-span-2 lg:col-span-1">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-purple-200 bg-purple-800/60 px-2.5 py-1 rounded-full">
          Net Balance
        </span>
        <div className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-extrabold font-mono">{formatNaira(netBalance)}</div>
      </div>
    </div>
  );
}

function ControlBar({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryFilter,
  onCategoryFilterChange,
  onOpenCategoryModal,
  selectedItemCount,
  bulkCategoryId,
  onBulkCategoryChange,
  onApplyBulkCategory,
}: {
  activeTab: TransactionType;
  onTabChange: (tab: TransactionType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: CategoryOption[];
  selectedCategoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onOpenCategoryModal: () => void;
  selectedItemCount: number;
  bulkCategoryId: string;
  onBulkCategoryChange: (value: string) => void;
  onApplyBulkCategory: () => void;
}) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-purple-100 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex bg-purple-50 p-1 rounded-xl border border-purple-100 self-start w-full sm:w-auto">
          <button
            onClick={() => onTabChange("DEBIT")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "DEBIT" ? "bg-purple-900 text-white shadow-xs" : "text-purple-700 hover:text-purple-900"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Debit</span>
          </button>
          <button
            onClick={() => onTabChange("CREDIT")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "CREDIT" ? "bg-purple-900 text-white shadow-xs" : "text-purple-700 hover:text-purple-900"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Credit</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange("tree")}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "tree" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600"
            }`}
            title="Tree View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tree</span>
          </button>
          <button
            onClick={() => onViewModeChange("kanban")}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "kanban" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600"
            }`}
            title="Kanban View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => onViewModeChange("calendar")}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "calendar" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600"
            }`}
            title="Calendar View"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
        <div className="relative w-full sm:flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search merchant or line items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-600 appearance-none truncate"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenCategoryModal}
            className="sm:hidden p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 shrink-0"
            title="Manage Categories"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCategoryModal}
            className="hidden sm:flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs px-3 py-2 rounded-xl border border-purple-100 transition-colors shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {selectedItemCount > 0 && (
        <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-purple-900">{selectedItemCount} items selected</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={bulkCategoryId}
              onChange={(e) => onBulkCategoryChange(e.target.value)}
              className="bg-white border border-purple-200 rounded px-2 py-1.5 text-xs outline-none flex-1 sm:flex-none"
            >
              <option value="">Re-assign Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={onApplyBulkCategory}
              disabled={!bulkCategoryId}
              className="px-3 py-1.5 bg-purple-700 text-white rounded font-medium hover:bg-purple-800 disabled:opacity-50 shrink-0"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TreeView({
  parents,
  categories,
  expandedNodes,
  onToggleNode,
  selectedItemIds,
  onToggleSelectItem,
  onToggleSelectAllItems,
  onItemCategoryChange,
  onAddItem,
  onDeleteItem,
}: {
  parents: ParentCategory[];
  categories: CategoryOption[];
  expandedNodes: Record<string, boolean>;
  onToggleNode: (id: string) => void;
  selectedItemIds: string[];
  onToggleSelectItem: (id: string) => void;
  onToggleSelectAllItems: (items: ReceiptItem[]) => void;
  onItemCategoryChange: (itemId: string, itemDescription: string, categoryId: string) => void;
  onAddItem: (transactionId: string) => void;
  onDeleteItem: (transactionId: string, itemId: string) => void;
}) {
  if (parents.length === 0) {
    return (
      <div className="bg-white border border-purple-100 rounded-2xl p-10 text-center text-slate-400 text-xs italic">
        No categories yet for this side of the ledger.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parents.map((parent) => {
        const isParentOpen = !!expandedNodes[parent.id];
        return (
          <div key={parent.id} className="border border-purple-100 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => onToggleNode(parent.id)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-purple-50/50 hover:bg-purple-50 text-left"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {isParentOpen ? (
                  <ChevronDown className="w-4 h-4 text-purple-700 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-purple-700 shrink-0" />
                )}
                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">📂 {parent.name}</span>
              </div>
            </button>

            {isParentOpen && (
              <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 border-t border-purple-100">
                {parent.subcategories.map((sub) => {
                  const isSubOpen = !!expandedNodes[sub.id];
                  return (
                    <div key={sub.id} className="pl-2 sm:pl-4 border-l-2 border-purple-200">
                      <button
                        onClick={() => onToggleNode(sub.id)}
                        className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-purple-50/60 text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSubOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-purple-950 truncate">📁 {sub.name}</span>
                        </div>
                      </button>

                      {isSubOpen && (
                        <div className="mt-2 space-y-3 pl-1 sm:pl-4">
                          {sub.transactions.map((tx) => {
                            const isTxOpen = !!expandedNodes[tx.id];
                            return (
                              <div key={tx.id} className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden">
                                <button
                                  onClick={() => onToggleNode(tx.id)}
                                  className="w-full p-3 bg-white flex items-center justify-between gap-2 hover:bg-purple-50/30 text-left"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isTxOpen ? (
                                      <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-purple-600 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-900 text-xs block truncate">
                                        💳 {tx.merchant}
                                      </span>
                                      <p className="text-[10px] text-purple-700 font-mono truncate">
                                        &quot;{tx.rawEmailSubject}&quot;
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm shrink-0">
                                    ₦{tx.amount.toLocaleString()}
                                  </span>
                                </button>

                                {isTxOpen && (
                                  <div className="p-2 sm:p-3 bg-purple-50/30 border-t border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                      <button
                                        onClick={() => onToggleSelectAllItems(tx.items)}
                                        className="text-[11px] text-purple-700 hover:underline font-medium py-1"
                                      >
                                        Select All Items
                                      </button>
                                      <button
                                        onClick={() => onAddItem(tx.id)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-purple-800 hover:text-purple-950 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded"
                                      >
                                        <Plus className="w-3 h-3" /> Add Line Item
                                      </button>
                                    </div>

                                    {tx.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-purple-100 rounded-lg text-xs gap-2"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <input
                                            type="checkbox"
                                            checked={selectedItemIds.includes(item.id)}
                                            onChange={() => onToggleSelectItem(item.id)}
                                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 shrink-0 w-4 h-4"
                                          />
                                          <span className="text-purple-950 font-medium truncate">
                                            🧾 {item.description}
                                          </span>
                                          <span className="text-slate-400 text-[10px] shrink-0">
                                            ({item.quantity}x @ ₦{item.unitPrice.toLocaleString()})
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-2 pl-6 sm:pl-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100">
                                          <select
                                            value={item.categoryId}
                                            onChange={(e) =>
                                              onItemCategoryChange(item.id, item.description, e.target.value)
                                            }
                                            className="bg-purple-50 border border-purple-200 text-purple-900 text-[11px] rounded px-2 py-1.5 outline-none truncate max-w-[150px]"
                                          >
                                            {categories.map((cat) => (
                                              <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                              </option>
                                            ))}
                                          </select>

                                          <span className="font-mono font-bold text-purple-950 text-xs shrink-0">
                                            ₦{item.totalAmount.toLocaleString()}
                                          </span>

                                          <button
                                            onClick={() => onDeleteItem(tx.id, item.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1.5 -m-1"
                                            title="Delete item"
                                            aria-label={`Delete ${item.description}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KanbanView({ categories, flatItems }: { categories: CategoryOption[]; flatItems: FlatItemEntry[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const categoryItems = flatItems.filter((entry) => entry.item.categoryId === cat.id);
        const colTotal = categoryItems.reduce((sum, entry) => sum + entry.item.totalAmount, 0);

        return (
          <div key={cat.id} className="bg-white border border-purple-100 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs text-purple-950 truncate">{cat.name}</h3>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                  {categoryItems.length}
                </span>
              </div>

              <div className="mt-3 space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {categoryItems.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6 italic">No items in this category</p>
                ) : (
                  categoryItems.map((entry) => (
                    <div
                      key={entry.item.id}
                      className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-semibold text-slate-800 truncate">{entry.item.description}</span>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          ₦{entry.item.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 gap-2">
                        <span className="truncate">💳 {entry.merchant}</span>
                        <span className="shrink-0">{entry.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-900">
              <span>Total</span>
              <span className="font-mono">₦{colTotal.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ flatItems, categories }: { flatItems: FlatItemEntry[]; categories: CategoryOption[] }) {
  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-purple-600" />
        <span>Transaction Activity Feed</span>
      </h3>

      <div className="space-y-3">
        {flatItems.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-10 italic">No matching entries found for this filter.</p>
        ) : (
          flatItems.map((entry) => (
            <div
              key={entry.item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl gap-2 hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="bg-purple-100 text-purple-800 p-2 rounded-lg font-mono text-[10px] font-bold text-center shrink-0">
                  {entry.date}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">{entry.item.description}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="truncate">💳 {entry.merchant}</span>
                    <span>•</span>
                    <span className="text-purple-700 font-medium truncate">{entry.subName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                <span className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 font-medium">
                  {categories.find((c) => c.id === entry.item.categoryId)?.name || "Uncategorized"}
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                  ₦{entry.item.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryModal({
  isOpen,
  onClose,
  categories,
  newCategoryName,
  onNewCategoryNameChange,
  onAddCategory,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  onAddCategory: () => void;
  isSaving: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-purple-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Manage Budget Categories</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 -m-1.5 rounded-lg" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-600 block">Create New Category</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Subscriptions & Tools"
              value={newCategoryName}
              onChange={(e) => onNewCategoryNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddCategory()}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={onAddCategory}
              disabled={!newCategoryName.trim() || isSaving}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-50"
            >
              {isSaving ? "Adding…" : "Add"}
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-slate-600 block">Existing Categories</label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs text-slate-700">
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleToast({
  pendingRuleItem,
  onSave,
  onDismiss,
}: {
  pendingRuleItem: PendingRuleItem | null;
  onSave: () => void;
  onDismiss: () => void;
}) {
  if (!pendingRuleItem) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 max-w-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Auto-Categorization Rule</span>
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white p-1 -m-1" aria-label="Dismiss">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-slate-300">
        Always automatically route future line items named{" "}
        <span className="font-semibold text-white">&quot;{pendingRuleItem.name}&quot;</span> to{" "}
        <span className="font-semibold text-purple-300">{pendingRuleItem.categoryName}</span>?
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Save Rule
        </button>
        <button onClick={onDismiss} className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg transition-colors">
          Skip
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * PAGE
 * ==========================================================================*/

export default function BudgetDashboard() {
  const {
    data,
    categories,
    isLoading,
    error,
    reload,
    allFlatItems,
    totals,
    changeItemCategory,
    bulkChangeCategory,
    addLineItem,
    deleteLineItem,
    addCategory,
    saveRule,
  } = useBudgetData();

  const { toastMessage, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TransactionType>("DEBIT");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "parent-1": true,
    "sub-1": true,
    "tx-1": true,
  });
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [pendingRuleItem, setPendingRuleItem] = useState<PendingRuleItem | null>(null);

  const toggleNode = (id: string) => setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleToggleSelectItem = (id: string) =>
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleToggleSelectAllItems = (items: ReceiptItem[]) => {
    const allIds = items.map((i) => i.id);
    const isAllSelected = allIds.every((id) => selectedItemIds.includes(id));
    setSelectedItemIds((prev) =>
      isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))
    );
  };

  const handleItemCategoryChange = async (itemId: string, itemDescription: string, categoryId: string) => {
    await changeItemCategory(itemId, categoryId);
    const targetCat = categories.find((c) => c.id === categoryId);
    showToast(`Updated "${itemDescription}" category.`);
    setPendingRuleItem({ id: itemId, name: itemDescription, categoryId, categoryName: targetCat?.name || "" });
  };

  const handleAddItem = async (transactionId: string) => {
    await addLineItem(transactionId, categories[0]?.id || "");
    showToast("Added new line item");
  };

  const handleDeleteItem = async (transactionId: string, itemId: string) => {
    await deleteLineItem(transactionId, itemId);
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
    showToast("Line item deleted");
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const created = await addCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
      showToast(`Created custom category "${created.name}"`);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleApplyBulkCategory = async () => {
    if (!bulkCategoryId || selectedItemIds.length === 0) return;
    await bulkChangeCategory(selectedItemIds, bulkCategoryId);
    showToast(`Updated ${selectedItemIds.length} items.`);
    setSelectedItemIds([]);
    setBulkCategoryId("");
  };

  const handleSaveRule = async () => {
    if (!pendingRuleItem) return;
    await saveRule(pendingRuleItem.name, pendingRuleItem.categoryId);
    showToast(`Rule saved for "${pendingRuleItem.name}"`);
    setPendingRuleItem(null);
  };

  const filteredFlatItems = useMemo(() => {
    return allFlatItems.filter((entry) => {
      const matchesType = entry.parentType === activeTab;
      const matchesSearch =
        entry.item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.merchant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategoryFilter === "ALL" || entry.item.categoryId === selectedCategoryFilter;
      return matchesType && matchesSearch && matchesCat;
    });
  }, [allFlatItems, activeTab, searchQuery, selectedCategoryFilter]);

  const treeParents = useMemo(() => data.filter((parent) => parent.type === activeTab), [data, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-purple-700 text-sm gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Loading your budget…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm text-slate-700">Couldn&apos;t load your budget data.</p>
        <p className="text-xs text-slate-400">{error}</p>
        <button onClick={reload} className="text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 overflow-x-hidden">
      <Toast message={toastMessage} />
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
        <StatCards totalDebit={totals.debit} totalCredit={totals.credit} netBalance={totals.net} />

        <ControlBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategoryFilter={selectedCategoryFilter}
          onCategoryFilterChange={setSelectedCategoryFilter}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          selectedItemCount={selectedItemIds.length}
          bulkCategoryId={bulkCategoryId}
          onBulkCategoryChange={setBulkCategoryId}
          onApplyBulkCategory={handleApplyBulkCategory}
        />

        {viewMode === "tree" && (
          <TreeView
            parents={treeParents}
            categories={categories}
            expandedNodes={expandedNodes}
            onToggleNode={toggleNode}
            selectedItemIds={selectedItemIds}
            onToggleSelectItem={handleToggleSelectItem}
            onToggleSelectAllItems={handleToggleSelectAllItems}
            onItemCategoryChange={handleItemCategoryChange}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {viewMode === "kanban" && <KanbanView categories={categories} flatItems={filteredFlatItems} />}

        {viewMode === "calendar" && <CalendarView flatItems={filteredFlatItems} categories={categories} />}
      </main>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        newCategoryName={newCategoryName}
        onNewCategoryNameChange={setNewCategoryName}
        onAddCategory={handleAddCategory}
        isSaving={isSavingCategory}
      />

      <RuleToast pendingRuleItem={pendingRuleItem} onSave={handleSaveRule} onDismiss={() => setPendingRuleItem(null)} />
    </div>
  );
}
