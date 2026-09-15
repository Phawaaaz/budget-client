import { categories, monthTransactions, totals, type Category, type FinanceData } from "./finance";

export type SpendCategory = Exclude<Category, "Income">;
export const spendCategories = categories.filter((c): c is SpendCategory => c !== "Income");
type Fmt = (amount: number) => string;

export function shiftMonth(month: string, delta: number) {
  const [year, index] = month.split("-").map(Number);
  const d = new Date(year, index - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export const monthsEnding = (end: string, count: number) => Array.from({ length: count }, (_, i) => shiftMonth(end, i - count + 1));
export const monthName = (month: string, style: "narrow" | "short" | "long" = "long") => new Date(`${month}-02T12:00:00`).toLocaleDateString("en-GB", { month: style });
const average = (values: number[]) => values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
const median = (values: number[]) => { const s = [...values].sort((a, b) => a - b); const mid = Math.floor(s.length / 2); return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2; };
const round100 = (amount: number) => Math.round(amount / 100) * 100;
export const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;

/** A window of months. Months before the first record, or after today, are not "recorded": no data is not the same as ₦0. */
export type Period = { months: string[]; recorded: boolean[]; inProgress: string | null; daysLeft: number | null };
export function buildPeriod(data: FinanceData, end: string, count: number, today: string | null): Period {
  const first = data.transactions.reduce<string | null>((min, t) => (!min || t.date < min ? t.date : min), null)?.slice(0, 7) ?? null;
  const current = today ? today.slice(0, 7) : null;
  const months = monthsEnding(end, count);
  const recorded = months.map(m => !!first && m >= first && (!current || m <= current));
  const inProgress = current && months.includes(current) ? current : null;
  const daysLeft = inProgress && today ? new Date(Number(inProgress.slice(0, 4)), Number(inProgress.slice(5)), 0).getDate() - Number(today.slice(8, 10)) : null;
  return { months, recorded, inProgress, daysLeft };
}
const completeMonths = (p: Period) => p.months.filter((m, i) => p.recorded[i] && m !== p.inProgress);

export type FlowPoint = { month: string; recorded: boolean; income: number; spending: number; net: number; kept: number | null };
export function cashFlow(data: FinanceData, period: Period): FlowPoint[] {
  return period.months.map((month, i) => { const t = totals(monthTransactions(data, month)); return { month, recorded: period.recorded[i], ...t, kept: t.income > 0 ? t.net / t.income : null }; });
}
export const fullMonths = (flow: FlowPoint[], period: Period) => flow.filter(p => p.recorded && p.month !== period.inProgress);

export type PatternKind = "growing" | "easing" | "steady" | "uneven" | "new" | "quiet" | "sparse";
export type CategoryTrend = { category: SpendCategory; values: number[]; current: number; usual: number | null; budget: number | null; kind: PatternKind; pattern: string; early: number; late: number };
export function categoryTrends(data: FinanceData, period: Period, fmt: Fmt): CategoryTrend[] {
  const end = period.months[period.months.length - 1];
  const done = completeMonths(period);
  return spendCategories.map(category => {
    const spentIn = (month: string) => monthTransactions(data, month).filter(t => t.type === "out" && t.category === category).reduce((s, t) => s + t.amount, 0);
    const values = period.months.map((m, i) => period.recorded[i] ? spentIn(m) : 0);
    const current = values[values.length - 1];
    const prior = done.filter(m => m < end).slice(-3);
    const usual = prior.length ? round100(average(prior.map(spentIn))) : null;
    const budget = data.budgets.find(b => b.month === end && b.category === category)?.limit ?? null;
    const series = done.map(spentIn);
    const half = Math.ceil(series.length / 2);
    const early = round100(average(series.slice(0, half))), late = round100(average(series.slice(half)));
    let kind: PatternKind, pattern: string;
    if (series.length < 3) { kind = "sparse"; pattern = "Three full months of records will show a pattern."; }
    else if (series.every(v => v === 0)) { kind = "quiet"; pattern = "Nothing spent here in these months."; }
    else if (early === 0) { kind = "new"; pattern = `New lately: about ${fmt(late)} a month.`; }
    else if (late === 0) { kind = "easing"; pattern = `Nothing in the last ${series.length - half} months. Last spent in ${monthName(done[series.findLastIndex(v => v > 0)])}.`; }
    else if (late >= early * 1.3) { kind = "growing"; pattern = `Up ${percent(late / early - 1)}: about ${fmt(late)} a month lately, ${fmt(early)} before.`; }
    else if (late <= early * 0.75) { kind = "easing"; pattern = `Down ${percent(1 - late / early)}: about ${fmt(late)} a month lately, ${fmt(early)} before.`; }
    else {
      const min = Math.min(...series), max = Math.max(...series);
      if ((max - min) / average(series) <= 0.35) { kind = "steady"; pattern = `Steady: ${fmt(min)} to ${fmt(max)} every month.`; }
      else { kind = "uneven"; pattern = `Uneven: ${fmt(min)} to ${fmt(max)}, highest in ${monthName(done[series.indexOf(max)])}.`; }
    }
    return { category, values, current, usual, budget, kind, pattern, early, late };
  });
}

/** Merchants paid in at least three recorded months. "Fixed" means most months land within 20% of the usual amount. */
export type Repeat = { merchant: string; category: Category; months: number; of: number; typical: number; fixed: boolean; last: string };
export function repeats(data: FinanceData, period: Period): Repeat[] {
  const window = period.months.filter((_, i) => period.recorded[i]);
  const groups = new Map<string, { name: string; category: Category; last: string; byMonth: Map<string, number> }>();
  for (const t of data.transactions) {
    const month = t.date.slice(0, 7);
    if (t.type !== "out" || !window.includes(month)) continue;
    const key = t.merchant.trim().toLowerCase();
    const group = groups.get(key) ?? { name: t.merchant, category: t.category, last: t.date, byMonth: new Map<string, number>() };
    if (t.date >= group.last) Object.assign(group, { name: t.merchant, category: t.category, last: t.date });
    group.byMonth.set(month, (group.byMonth.get(month) ?? 0) + t.amount);
    groups.set(key, group);
  }
  return [...groups.values()].filter(g => g.byMonth.size >= 3).map(g => {
    const amounts = [...g.byMonth.values()];
    const typical = median(amounts);
    const fixed = amounts.filter(v => Math.abs(v - typical) <= typical * 0.2).length / amounts.length >= 0.8;
    return { merchant: g.name, category: g.category, months: g.byMonth.size, of: window.length, typical, fixed, last: g.last };
  }).sort((a, b) => b.months - a.months || b.typical - a.typical);
}

export type GuideId = "irregular-income" | "rainy-day" | "category-creep" | "repeat-check" | "realistic-budget" | "sinking-funds";
export type Insight = { id: string; tone: "watch" | "info" | "good"; title: string; detail: string; action?: { label: string; view: "Transactions" | "Budgets" | "Inbox"; category?: Category }; guide?: GuideId };
export function insights(data: FinanceData, period: Period, trends: CategoryTrend[], flow: FlowPoint[], found: Repeat[], fmt: Fmt): Insight[] {
  const list: Insight[] = [];
  const end = period.months[period.months.length - 1];
  const live = period.inProgress === end;
  const growing = trends.filter(t => t.kind === "growing").sort((a, b) => (b.late - b.early) - (a.late - a.early)).slice(0, 2);
  for (const t of growing) {
    const budgetNote = t.budget ? ` Its ${monthName(end)} budget is ${percent(t.current / t.budget)} used${live && period.daysLeft ? ` with ${period.daysLeft} days to go` : ""}.` : "";
    list.push({ id: `growing-${t.category}`, tone: "watch", title: `${t.category} keeps growing`, detail: `${t.pattern}${budgetNote}`, action: { label: `See ${t.category.toLowerCase()}`, view: "Transactions", category: t.category }, guide: "category-creep" });
  }
  for (const t of trends) {
    if (!t.budget || growing.includes(t)) continue;
    const used = t.current / t.budget;
    if (used >= 1) list.push({ id: `over-${t.category}`, tone: "watch", title: `${t.category} is over budget`, detail: `${fmt(t.current)} spent against ${fmt(t.budget)} in ${monthName(end)}.${live && period.daysLeft ? ` ${period.daysLeft} days still to go.` : ""}`, action: { label: "Review budget", view: "Budgets" }, guide: "realistic-budget" });
    else if (used >= 0.85 && live) list.push({ id: `near-${t.category}`, tone: "watch", title: `${t.category} is at ${percent(used)} of its budget`, detail: `${fmt(t.budget - t.current)} left${period.daysLeft ? ` with ${period.daysLeft} days to go` : ""}.`, action: { label: "Review budget", view: "Budgets" }, guide: "realistic-budget" });
  }
  const full = fullMonths(flow, period).filter(p => p.income > 0);
  if (full.length >= 3) {
    const low = full.reduce((a, b) => (b.income < a.income ? b : a)), high = full.reduce((a, b) => (b.income > a.income ? b : a));
    if (high.income >= low.income * 1.3) list.push({ id: "income-range", tone: "info", title: "Your income moves around", detail: `From ${fmt(low.income)} in ${monthName(low.month)} to ${fmt(high.income)} in ${monthName(high.month)}. Planning around the lower end keeps a slow month from derailing the plan.`, guide: "irregular-income" });
  }
  const fixed = found.filter(r => r.fixed && r.category === "Bills & subscriptions");
  if (fixed.length) list.push({ id: "repeats", tone: "info", title: `About ${fmt(round100(fixed.reduce((s, r) => s + r.typical * r.months / r.of, 0)))} in a typical month goes to repeat bills and subscriptions`, detail: `${fixed.map(r => r.merchant).join(", ")}. Worth checking now and then that each one still earns its place.`, guide: "repeat-check" });
  const kept = full.filter(p => p.kept !== null);
  if (kept.length >= 3) {
    const avg = average(kept.map(p => p.kept ?? 0));
    const best = kept.reduce((a, b) => ((b.kept ?? 0) > (a.kept ?? 0) ? b : a)), worst = kept.reduce((a, b) => ((b.kept ?? 0) < (a.kept ?? 0) ? b : a));
    list.push({ id: "kept", tone: avg >= 0.15 ? "good" : "watch", title: avg >= 0 ? `You've kept ${percent(avg)} of what came in` : "More went out than came in", detail: `Averaged over ${kept.length} full months. Best: ${monthName(best.month)} at ${percent(best.kept ?? 0)}. Lowest: ${monthName(worst.month)} at ${percent(worst.kept ?? 0)}.`, guide: "rainy-day" });
  }
  const steady = trends.filter(t => t.kind === "steady").sort((a, b) => b.late - a.late)[0];
  if (steady) list.push({ id: "steady", tone: "good", title: `${steady.category} is your most predictable cost`, detail: `${steady.pattern} A steady cost is the easiest one to budget for exactly.`, action: { label: "Review budget", view: "Budgets" }, guide: "realistic-budget" });
  const pending = data.transactions.filter(t => !t.reviewed).length;
  if (pending) list.push({ id: "review", tone: "info", title: `${pending} transaction${pending === 1 ? "" : "s"} still need${pending === 1 ? "s" : ""} a look`, detail: "Patterns are only as good as the records under them. Confirm the category on each one.", action: { label: "Open inbox", view: "Inbox" } });
  const order = { watch: 0, info: 1, good: 2 };
  return list.sort((a, b) => order[a.tone] - order[b.tone]);
}

export const disclaimer = "General information to help you think things through, not personal financial advice. Folio only sees what is recorded here. For investment, tax, debt or legal decisions, speak to a qualified professional.";

export const guides: { id: GuideId; title: string; summary: string; body: string[] }[] = [
  { id: "irregular-income", title: "Budgeting on an irregular income", summary: "Plan from your leaner months, and give the good months a job.", body: [
    "When income arrives in uneven amounts, a budget built on an average month will come up short about half the time. Build the plan around a lower month you have actually had, not the best one.",
    "In a stronger month, decide where the extra goes before it arrives: topping up a buffer first, then a goal, then something you enjoy. Money without a job tends to drift into everyday spending.",
    "Some people with freelance income pay themselves a fixed amount each month from a holding account, so the everyday budget feels steady even when the work does not.",
  ] },
  { id: "rainy-day", title: "Building a rainy-day fund", summary: "A cushion for the month something goes wrong.", body: [
    "A rainy-day fund is money set aside for the unexpected: a repair, a gap between jobs, a family emergency. Its job is to stop a bad month from turning into debt.",
    "A common rule of thumb is three to six months of essential costs, but any amount helps. One month of essentials is a meaningful first milestone.",
    "Keep it separate from everyday spending so it is not quietly used up, and somewhere you can reach quickly when you need it.",
  ] },
  { id: "category-creep", title: "When a category keeps growing", summary: "Find out whether it is one big thing or many small ones.", body: [
    "Open the category's transactions and look for the shape of the increase. One large purchase is a decision you made once. Many small ones are a habit, and habits respond to different fixes.",
    "Then decide which should change: the spending or the budget. If the higher level is now part of your life, a realistic budget is more useful than one you break every month.",
    "For non-essential purchases, a short waiting period before buying, even a day or two, filters out a surprising number of impulse buys.",
  ] },
  { id: "repeat-check", title: "A quick repeat-charge check", summary: "Five minutes, once a quarter, on everything that renews.", body: [
    "List every charge that repeats: data plans, streaming, software, memberships. Seeing them together is often the surprise.",
    "For each one, ask when you last used it and whether you would sign up again today at this price. Cancel, downgrade or keep, deliberately.",
    "Note renewal dates for anything billed yearly, so the charge does not arrive unannounced.",
  ] },
  { id: "realistic-budget", title: "Setting a budget you will keep", summary: "Start from what you actually spend, then adjust.", body: [
    "The most useful starting point is your average over the last three months, not an ideal number. A budget far below reality gets abandoned by the second week.",
    "Adjust in small steps, a category at a time, and review at the end of each month. Tightening one category by a modest amount is easier to sustain than cutting everything at once.",
    "Leave a small unassigned margin. Something always comes up, and a plan with no slack breaks at the first surprise.",
  ] },
  { id: "sinking-funds", title: "Planning for costs that are not monthly", summary: "Turn big once-a-year bills into small monthly ones.", body: [
    "Some costs arrive once or twice a year: rent renewals, school fees, insurance, car servicing, festive season spending. They are predictable, even if they are not monthly.",
    "Estimate each one, divide by the months until it is due, and set that amount aside every month. When the bill comes, the money is already waiting.",
    "Your steady monthly costs are the easy part of a budget. Planning for the lumpy ones is what keeps a good month from being wiped out by a known expense.",
  ] },
];
