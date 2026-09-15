"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Info, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { buildPeriod, cashFlow, categoryTrends, disclaimer, fullMonths, guides, insights, monthName, percent, repeats, type GuideId } from "../lib/advice";
import { categoryColors, categoryIcons, shortMoney, type Category, type FinanceData } from "../lib/finance";

type Go = (view: "Transactions" | "Budgets" | "Inbox", category?: Category) => void;
const toneLabel = { watch: "Worth watching", info: "Worth knowing", good: "Going well" } as const;

function MonthBars({ label, months, values, recorded, inProgress, format, short, budget, showValues, max }: { label: string; months: string[]; values: number[]; recorded: boolean[]; inProgress: string | null; format: (n: number) => string; short: (n: number) => string; budget?: number | null; showValues: boolean; max?: number }) {
  const lo = Math.min(0, ...values);
  const span = Math.max(max ?? 0, budget ?? 0, ...values, 1) - lo;
  const zero = -lo / span * 100;
  const described = months.map((m, i) => `${monthName(m)}${m === inProgress ? " so far" : ""}: ${recorded[i] ? format(values[i]) : "no records"}`).join("; ");
  return <figure className="month-bars">
    <div className="month-plot" role="img" aria-label={`${label}. ${described}${budget ? `. Budget ${format(budget)}` : ""}.`}>
      {lo < 0 && <span className="zero-line" style={{ bottom: `${zero}%` }} />}
      {budget ? <span className="budget-line" style={{ bottom: `${zero + budget / span * 100}%` }} /> : null}
      {months.map((m, i) => {
        const v = recorded[i] ? values[i] : 0, h = Math.abs(v) / span * 100;
        return <span key={m} className={`month-bar${m === inProgress ? " in-progress" : ""}${recorded[i] ? "" : " unrecorded"}${budget && i === months.length - 1 && v > budget ? " over" : ""}${v < 0 ? " below" : ""}`}><i style={{ bottom: `${v >= 0 ? zero : zero - h}%`, height: `${v ? Math.max(h, 1.5) : 0}%` }} /></span>;
      })}
    </div>
    <div className="month-axis" aria-hidden="true">{months.map((m, i) => <span key={m} className={m === inProgress ? "in-progress" : undefined}><b>{monthName(m, months.length > 6 ? "narrow" : "short")}</b>{showValues && <small>{recorded[i] ? short(values[i]) : "–"}</small>}</span>)}</div>
  </figure>;
}

export default function AdviceView({ data, month, range, today, hidden, money, go }: { data: FinanceData; month: string; range: number; today: string | null; hidden: boolean; money: (n: number) => string; go: Go }) {
  const [shared, setShared] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const short = (n: number) => hidden ? "•••" : shortMoney(n);
  const period = buildPeriod(data, month, range, today);
  const flow = cashFlow(data, period);
  const trends = categoryTrends(data, period, money);
  const found = repeats(data, period);
  const notes = insights(data, period, trends, flow, found, money);
  const full = fullMonths(flow, period);
  const recordedCount = period.recorded.filter(Boolean).length;
  const average = (key: "income" | "spending") => Math.round(full.reduce((s, p) => s + p[key], 0) / full.length);
  const keptMonths = full.filter(p => p.kept !== null);
  const keptAverage = keptMonths.length ? keptMonths.reduce((s, p) => s + (p.kept ?? 0), 0) / keptMonths.length : null;
  const flowMax = Math.max(1, ...flow.map(p => Math.max(p.income, p.spending)));
  const sharedMax = Math.max(1, ...trends.flatMap(t => [...t.values, t.budget ?? 0]));
  const suggested = new Map<GuideId, string>();
  for (const n of notes) if (n.guide && n.tone !== "good" && !suggested.has(n.guide)) suggested.set(n.guide, n.title);
  const orderedGuides = [...guides].sort((a, b) => Number(suggested.has(b.id)) - Number(suggested.has(a.id)));
  const showValues = range <= 6;
  const live = period.inProgress === month;

  function openGuide(id: GuideId) {
    const el = document.getElementById(`guide-${id}`);
    if (!(el instanceof HTMLDetailsElement)) return;
    el.open = true;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.querySelector("summary")?.focus({ preventScroll: true });
  }

  return <>
    {recordedCount < 3 && <p className="advice-note" role="status"><Info size={17} />Only {recordedCount} month{recordedCount === 1 ? "" : "s"} of records in this range. Patterns need at least three, and the charts fill in as records arrive.</p>}

    <section className="advice-flow" aria-labelledby="advice-flow-title">
      <div className="section-heading"><div><h2 id="advice-flow-title">Money in, money out, what you kept</h2><p className="section-intro">Averages count full months only.{period.inProgress && period.daysLeft !== null ? ` Striped bars are ${monthName(period.inProgress)} so far, with ${period.daysLeft} days to go.` : ""}</p></div></div>
      <div className="flow-multiples">
        <div className="flow-multiple" style={{ "--bar": "var(--green)" } as CSSProperties}>
          <div className="multiple-label"><span className="flow-icon income"><ArrowDownLeft size={16} /></span>Money in</div>
          <div className="multiple-figure"><strong>{full.length ? money(average("income")) : "–"}</strong><span>a month on average</span></div>
          <MonthBars label="Money in by month" months={period.months} values={flow.map(p => p.income)} recorded={period.recorded} inProgress={period.inProgress} format={money} short={short} showValues={showValues} max={flowMax} />
        </div>
        <div className="flow-multiple" style={{ "--bar": "var(--coral-strong)" } as CSSProperties}>
          <div className="multiple-label"><span className="flow-icon expense"><ArrowUpRight size={16} /></span>Money out</div>
          <div className="multiple-figure"><strong>{full.length ? money(average("spending")) : "–"}</strong><span>a month on average</span></div>
          <MonthBars label="Money out by month" months={period.months} values={flow.map(p => p.spending)} recorded={period.recorded} inProgress={period.inProgress} format={money} short={short} showValues={showValues} max={flowMax} />
        </div>
        <div className="flow-multiple" style={{ "--bar": "var(--ink)" } as CSSProperties}>
          <div className="multiple-label"><span className="flow-icon kept"><Wallet size={16} /></span>What you kept</div>
          <div className="multiple-figure"><strong>{keptAverage === null ? "–" : percent(keptAverage)}</strong><span>of money in, on average</span></div>
          <MonthBars label="Share of money in that you kept, by month" months={period.months} values={flow.map(p => p.kept ?? 0)} recorded={flow.map((p, i) => period.recorded[i] && p.kept !== null)} inProgress={period.inProgress} format={percent} short={percent} showValues={showValues} />
        </div>
      </div>
    </section>

    <section className="advice-patterns" aria-labelledby="advice-patterns-title">
      <div className="section-heading">
        <div><h2 id="advice-patterns-title">Where the patterns are</h2><p className="section-intro">Every spending category on the same months. Dashed lines mark the budget for {monthName(month)}.</p></div>
        <div className="segmented" role="group" aria-label="Chart scale"><button aria-pressed={!shared} className={shared ? "" : "selected"} onClick={() => setShared(false)}>Own scale</button><button aria-pressed={shared} className={shared ? "selected" : ""} onClick={() => setShared(true)}>Shared scale</button></div>
      </div>
      <div className="pattern-grid">{trends.map(t => {
        const Icon = categoryIcons[t.category];
        const used = t.budget ? t.current / t.budget : 0;
        const status = used > 1 ? <b className="negative"> · Over budget</b> : used >= 0.9 ? <b className="warning"> · Getting close</b> : null;
        let change: ReactNode = null;
        if (t.usual) {
          const ratio = t.current / t.usual, delta = ratio - 1;
          change = live
            ? <span className="pattern-change">{t.current ? `${percent(ratio)} of usual so far` : "None yet this month"}</span>
            : <span className={`pattern-change ${delta > 0.05 ? "negative" : delta < -0.05 ? "positive" : ""}`}>{delta > 0.05 ? <TrendingUp size={15} /> : delta < -0.05 ? <TrendingDown size={15} /> : null}{Math.abs(delta) <= 0.05 ? "In line with usual" : `${percent(Math.abs(delta))} ${delta > 0 ? "above" : "below"} usual`}</span>;
        }
        return <article key={t.category} className="pattern-cell" style={{ "--category": categoryColors[t.category], "--bar": "color-mix(in srgb, var(--category) 66%, var(--ink))" } as CSSProperties}>
          <div className="pattern-head"><h3><span className="merchant-icon small"><Icon size={14} /></span>{t.category}</h3>{change}</div>
          <div className="multiple-figure"><strong>{money(t.current)}</strong><span>{[live ? `in ${monthName(month)} so far` : `in ${monthName(month)}`, t.usual !== null && `usually ${money(t.usual)}`, t.budget && `budget ${money(t.budget)}`].filter(Boolean).join(" · ")}{status}</span></div>
          <MonthBars label={`${t.category} spending by month`} months={period.months} values={t.values} recorded={period.recorded} inProgress={period.inProgress} format={money} short={short} budget={t.budget} showValues={showValues} max={shared ? sharedMax : undefined} />
          <p className="pattern-note">{t.pattern}</p>
          <button className="text-button" onClick={() => go("Transactions", t.category)}>See {monthName(month)} transactions <ArrowRight size={14} /></button>
        </article>;
      })}</div>
    </section>

    <div className="advice-lower">
      <section aria-labelledby="advice-notes-title">
        <div className="section-heading"><h2 id="advice-notes-title">What stands out</h2><div className="tone-legend" aria-hidden="true">{(["watch", "info", "good"] as const).map(tone => <span key={tone} className={`tone-${tone}`}><i className="tone-dot" />{toneLabel[tone]}</span>)}</div></div>
        <p className="section-intro">Observations from your own records, with general next steps. Not financial advice.</p>
        {notes.length ? <ol className="insight-list">{notes.map(({ id, tone, title, detail, action, guide }) => <li key={id} className={`insight tone-${tone}`}>
          <h3><i className="tone-dot" aria-hidden="true" /><span className="sr-only">{toneLabel[tone]}: </span>{title}</h3>
          <p>{detail}</p>
          {(action || guide) && <div className="insight-actions">
            {action && <button className="text-button" onClick={() => go(action.view, action.category)}>{action.label} <ArrowRight size={14} /></button>}
            {guide && <button className="text-button" onClick={() => openGuide(guide)}><BookOpen size={14} /> {guides.find(g => g.id === guide)?.title}</button>}
          </div>}
        </li>)}</ol> : <p className="empty-small">Nothing stands out yet. Observations appear once there are a few months of records.</p>}
      </section>
      <section aria-labelledby="advice-repeats-title">
        <div className="section-heading"><h2 id="advice-repeats-title">What repeats</h2></div>
        <p className="section-intro">Places you paid in three or more of these months.</p>
        {found.length ? <table className="repeat-table">
          <thead><tr><th scope="col">Paid to</th><th scope="col" className="seen">Months</th><th scope="col">Usual month</th></tr></thead>
          <tbody>{found.slice(0, showAll ? undefined : 8).map(r => { const Icon = categoryIcons[r.category]; return <tr key={r.merchant}><td><strong><span className="merchant-icon small" style={{ "--category": categoryColors[r.category] } as CSSProperties}><Icon size={14} /></span>{r.merchant}</strong><small>{r.category}, {r.fixed ? "about the same each time" : "amount varies"}</small></td><td className="seen">{r.months} of {r.of}</td><td className="amount">{money(r.typical)}</td></tr>; })}</tbody>
        </table> : <p className="empty-small">No repeat payments in this range yet.</p>}
        {found.length > 8 && <button className="text-button table-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `Show ${found.length - 8} more`}</button>}
      </section>
    </div>

    <section className="field-notes" aria-labelledby="advice-guides-title">
      <div className="field-notes-intro">
        <h2 id="advice-guides-title">Field notes</h2>
        <p>Short, general guides on managing money. The suggested ones connect to something in your numbers above.</p>
        <p className="field-disclaimer"><Info size={16} />{disclaimer}</p>
      </div>
      <div className="guide-list">{orderedGuides.map(g => <details key={g.id} id={`guide-${g.id}`} className="guide">
        <summary><span><strong>{g.title}</strong><small>{g.summary}</small>{suggested.has(g.id) && <em className="guide-reason">Suggested: {suggested.get(g.id)}</em>}</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="guide-body">{g.body.map(p => <p key={p.slice(0, 24)}>{p}</p>)}</div>
      </details>)}</div>
    </section>
  </>;
}
