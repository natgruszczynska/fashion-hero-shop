"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import posthog from "posthog-js";

const USER_ID = "seller_marta_handmade";
const DAILY_BUDGET = 25;
const CREDIT_TOTAL = 500;
const MLB_BENCHMARK_ROI = 6.2;
const LOW_CREDIT_THRESHOLD = 100;

type EventName =
  | "placement_started"
  | "roi_viewed"
  | "credit_warning_shown"
  | "payment_decision_continue"
  | "payment_decision_pause"
  | "payment_decision_cancel";

function logEvent(name: EventName, payload: Record<string, unknown> = {}) {
  posthog.capture(`mlb_${name}`, { user_id: USER_ID, ...payload });
}

type Scenario = "day1" | "day12" | "day18" | "exhausted" | "own_funds";

type State = {
  creditBalance: number;
  ownFunds: number;
  attributedSales: number;
  impressions: number;
  clicks: number;
  orders: number;
  daysActive: number;
  hoursSinceStart: number;
  payingFromOwn: boolean;
  roiTrend: number[];
};

const SCENARIOS: Record<Scenario, State> = {
  day1: { creditBalance: 480, ownFunds: 0, attributedSales: 0, impressions: 420, clicks: 6, orders: 0, daysActive: 1, hoursSinceStart: 18, payingFromOwn: false, roiTrend: [] },
  day12: { creditBalance: 200, ownFunds: 0, attributedSales: 2840, impressions: 14200, clicks: 412, orders: 12, daysActive: 12, hoursSinceStart: 12 * 24, payingFromOwn: false, roiTrend: [11.2, 12.4, 13.1, 14.0, 14.6, 15.2, 15.8] },
  day18: { creditBalance: 12, ownFunds: 0, attributedSales: 1260, impressions: 9100, clicks: 246, orders: 7, daysActive: 18, hoursSinceStart: 18 * 24, payingFromOwn: false, roiTrend: [6.1, 6.8, 7.4, 7.9, 8.1, 8.3, 8.4] },
  exhausted: { creditBalance: 0, ownFunds: 0, attributedSales: 6800, impressions: 28400, clicks: 870, orders: 24, daysActive: 21, hoursSinceStart: 21 * 24, payingFromOwn: false, roiTrend: [10.4, 11.1, 12.0, 12.6, 13.0, 13.3, 13.6] },
  own_funds: { creditBalance: 0, ownFunds: 75, attributedSales: 7400, impressions: 31200, clicks: 951, orders: 27, daysActive: 24, hoursSinceStart: 24 * 24, payingFromOwn: true, roiTrend: [11.0, 11.8, 12.4, 12.9, 13.2, 13.5, 13.7] },
};

function fmtPLN(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} PLN`;
}

export default function MLBDashboard() {
  const [scenario, setScenario] = useState<Scenario>("day12");
  const base = SCENARIOS[scenario];
  const [state, setState] = useState<State>(base);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<null | "continue" | "pause" | "cancel">(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(SCENARIOS[scenario]);
    setModalOpen(false);
    setActionError(null);
  }, [scenario]);

  useEffect(() => {
    if (state.creditBalance > 0 && state.creditBalance < DAILY_BUDGET && !state.payingFromOwn) {
      setModalOpen(true);
      logEvent("credit_warning_shown", { credit_remaining: state.creditBalance, roi: roiValue(state) });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.creditBalance, state.payingFromOwn]);

  useEffect(() => {
    logEvent("placement_started", { scenario });
    logEvent("roi_viewed", { scenario });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSpent = CREDIT_TOTAL - state.creditBalance + state.ownFunds;
  const hasROIData = state.hoursSinceStart >= 48 && totalSpent > 0;
  const roi = hasROIData ? state.attributedSales / totalSpent : null;
  const creditExhausted = state.creditBalance === 0;
  const daysOfCreditLeft = Math.floor(state.creditBalance / DAILY_BUDGET);
  const ctr = state.impressions > 0 ? state.clicks / state.impressions : 0;
  const showLowCreditBanner = !state.payingFromOwn && state.creditBalance > 0 && state.creditBalance < LOW_CREDIT_THRESHOLD;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDecision(decision: "continue" | "pause" | "cancel") {
    setActionLoading(decision);
    setActionError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const balanceBefore = { credit: state.creditBalance, own: state.ownFunds };
      logEvent(
        decision === "continue" ? "payment_decision_continue" : decision === "pause" ? "payment_decision_pause" : "payment_decision_cancel",
        { balance_before: balanceBefore, roi_at_decision: roi, credit_remaining: state.creditBalance }
      );
      if (decision === "continue") {
        setState((s) => ({ ...s, payingFromOwn: true, creditBalance: 0 }));
        showToast("You are now paying from your own funds.");
      } else if (decision === "pause") {
        showToast("Placement paused.");
      } else {
        showToast("Placement cancelled.");
      }
      setModalOpen(false);
    } catch {
      setActionError("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo scenario switcher */}
      <div className="bg-secondary border-b border-border">
        <div className="max-w-[1440px] mx-auto px-8 py-2 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "2px" }}>Demo scenario:</span>
          {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`text-[10px] uppercase px-2 py-1 border transition-colors ${scenario === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
              style={{ letterSpacing: "1.5px" }}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {showLowCreditBanner && (
        <div className="sticky top-0 z-40 w-full" style={{ background: "#0a0a0a", color: "#ffffff" }}>
          <div className="max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[12px] flex items-center gap-2 flex-wrap">
              <span className="uppercase font-medium px-2 py-0.5" style={{ fontSize: "10px", letterSpacing: "2px", background: "#ffffff", color: "#0a0a0a" }}>Credit ending</span>
              <span>Continue at ~{fmtPLN(DAILY_BUDGET)}/day from own funds?</span>
            </div>
            <a href="#payment-method" className="px-4 py-2 text-[11px] uppercase font-medium" style={{ letterSpacing: "2px", background: "#ffffff", color: "#0a0a0a" }}>Set up payment</a>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-background">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="text-[18px] font-medium" style={{ letterSpacing: "0.3px" }}>
            Most Lovable Brand <span className="text-muted-foreground font-normal">— FashionHero</span>
          </div>
          <div className="flex items-center gap-4">
            {state.payingFromOwn && (
              <span className="uppercase font-medium px-3 py-1.5 bg-foreground text-background" style={{ fontSize: "10px", letterSpacing: "2px" }}>Paying from your own funds</span>
            )}
            <span className="text-[13px]">Marta Handmade</span>
            <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-[12px] font-medium" style={{ letterSpacing: "1px" }}>MH</div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-8 py-12 space-y-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "3px" }}>Placement dashboard</div>
            <h1 className="text-[36px] font-normal leading-tight">Most Lovable Brand</h1>
            <p className="mt-3 text-[14px] text-muted-foreground max-w-[600px]">Your homepage placement on FashionHero. Track what you&apos;ve spent and what it&apos;s brought back — credit and your own money are kept separate.</p>
            <p className="mt-3 text-[14px] text-foreground max-w-[600px]">Welcome to the pilot of Most Lovable Brand visibility! We&apos;re happy that you decided to take this step and help us expand your brand and optimize your results.</p>
            <p className="mt-3 text-[14px] text-foreground max-w-[600px]">Upload your banner for the placement and track your results using your free credits first!</p>
          </div>
          <PlacementPreview />
        </div>

        <PilotTimeline daysActive={state.daysActive} creditBalance={state.creditBalance} payingFromOwn={state.payingFromOwn} />

        {creditExhausted && !state.payingFromOwn && (
          <div className="p-6 flex items-start gap-5 flex-wrap" style={{ background: "#0a0a0a", color: "#ffffff" }}>
            <div className="flex-1 min-w-[260px]">
              <div className="text-[10px] uppercase mb-2 opacity-70" style={{ letterSpacing: "2.5px" }}>Credit exhausted</div>
              <div className="text-[20px] font-normal">Your free 500 PLN credit is gone.</div>
              <div className="text-[13px] mt-2 opacity-80">
                Placement is paused. To keep appearing on the FashionHero homepage, continue with your own funds.
                {roi !== null && <> Your current ROI is <strong>{roi.toFixed(1)}x</strong>.</>}
              </div>
            </div>
            <div className="flex gap-3">
              <button disabled={actionLoading !== null} onClick={() => handleDecision("continue")} className="px-5 py-3 text-[11px] uppercase font-medium disabled:opacity-50" style={{ letterSpacing: "2px", background: "#ffffff", color: "#0a0a0a" }}>
                {actionLoading === "continue" ? "Working…" : "Continue with own funds"}
              </button>
              <button disabled={actionLoading !== null} onClick={() => handleDecision("cancel")} className="px-5 py-3 text-[11px] uppercase font-medium border border-white/40 disabled:opacity-50" style={{ letterSpacing: "2px", color: "#ffffff" }}>
                {actionLoading === "cancel" ? "…" : "Cancel placement"}
              </button>
            </div>
            {actionError && <div className="w-full text-[12px]" style={{ color: "#fca5a5" }}>{actionError}</div>}
          </div>
        )}

        <section className="grid md:grid-cols-2 gap-5">
          <BalanceCard
            label="FashionHero credit"
            sublabel={`of ${fmtPLN(CREDIT_TOTAL)} free credit`}
            value={fmtPLN(state.creditBalance)}
            footer={creditExhausted ? "Used up" : state.creditBalance < DAILY_BUDGET ? `Less than 1 day left at ${fmtPLN(DAILY_BUDGET)}/day` : `~${daysOfCreditLeft} days left at ${fmtPLN(DAILY_BUDGET)}/day`}
            tone={creditExhausted ? "muted" : "primary"}
            progress={state.creditBalance / CREDIT_TOTAL}
          />
          <BalanceCard
            label="Your funds"
            sublabel={state.payingFromOwn ? "Currently active" : "Not used yet"}
            value={fmtPLN(state.ownFunds)}
            footer={state.payingFromOwn ? `Spending ~${fmtPLN(DAILY_BUDGET)}/day from your wallet` : "Only used after credit runs out"}
            tone={state.payingFromOwn ? "primary" : "muted"}
          >
            <div id="payment-method" className="mt-5 pt-5 border-t border-border">
              <a href="#payment-method" onClick={() => showToast("Payment method setup — coming soon")} className="inline-block px-4 py-2.5 text-[11px] uppercase font-medium border border-foreground bg-background text-foreground" style={{ letterSpacing: "2px" }}>Set up payment method</a>
              <div className="mt-2 text-[11px] text-muted-foreground">Add it before credit ends to avoid placement pause.</div>
            </div>
          </BalanceCard>
        </section>

        <section className="border border-border bg-background p-8">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "3px" }}>Return on placement</div>
              <h2 className="text-[22px] font-normal">ROI</h2>
            </div>
            <div className="text-[11px] text-muted-foreground">Updated daily · <LastRefresh /></div>
          </div>

          {!hasROIData ? (
            <div className="border border-dashed border-border p-10 text-center">
              <div className="text-[10px] uppercase text-muted-foreground mb-3" style={{ letterSpacing: "2.5px" }}>Collecting data</div>
              <div className="text-[20px] font-normal mb-2">ROI appears after the first 48 hours.</div>
              <p className="text-[13px] text-muted-foreground max-w-[440px] mx-auto">We need a couple of days of impressions and attributed sales before showing a meaningful return number. Your placement is live.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10 items-stretch">
              <div className="md:border-r md:border-border md:pr-10 flex flex-col">
                <div className="text-[10px] uppercase text-muted-foreground mb-4 inline-flex items-center gap-1.5" style={{ letterSpacing: "2.5px" }}>
                  ROI <InfoTooltip text="Last-click attribution, 7-day window" />
                </div>
                <div className="font-normal leading-none" style={{ fontSize: 80 }}>{roi!.toFixed(1)}x</div>
                <div className="mt-6"><RoiBars data={state.roiTrend} benchmark={MLB_BENCHMARK_ROI} /></div>
                <div className="mt-auto pt-5 space-y-1">
                  <div className="text-[12px] text-muted-foreground">vs FashionHero MLB avg: <span className="text-foreground">{MLB_BENCHMARK_ROI.toFixed(1)}x</span></div>
                  <div className="text-[12px] text-muted-foreground"><strong className="font-semibold text-foreground">{fmtPLN(state.attributedSales)} from {fmtPLN(totalSpent)} spent</strong></div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <PerfRow label="Attributed sales" value={fmtPLN(state.attributedSales)} />
                <div className="border-t border-border" />
                <PerfRow label="Orders" value={state.orders.toLocaleString()} />
                <div className="border-t border-border" />
                <PerfRow label="CTR" value={`${(ctr * 100).toFixed(2)}%`} hint={`${state.clicks.toLocaleString("en-US")} clicks`} />
              </div>
            </div>
          )}
        </section>

        <ActivityLog daysActive={state.daysActive} payingFromOwn={state.payingFromOwn} creditBalance={state.creditBalance} attributedSales={state.attributedSales} />
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(10,10,10,0.55)" }}>
          <div className="bg-background border border-border max-w-[480px] w-full p-8">
            <div className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "3px" }}>Heads up</div>
            <h3 className="text-[22px] font-normal mb-4">Your free 500 PLN credit is almost gone.</h3>
            <p className="text-[13px] text-muted-foreground mb-6">
              You have {fmtPLN(state.creditBalance)} of credit left.
              {roi !== null && <> Current ROI: <strong className="text-foreground">{roi.toFixed(1)}x</strong> ({fmtPLN(state.attributedSales)} in attributed sales).</>}{" "}
              What would you like to do?
            </p>
            <div className="space-y-3">
              <button disabled={actionLoading !== null} onClick={() => handleDecision("continue")} className="w-full py-3 text-[11px] uppercase font-medium bg-foreground text-background disabled:opacity-50" style={{ letterSpacing: "2px" }}>
                {actionLoading === "continue" ? "Working…" : `Continue with own funds — ~${fmtPLN(DAILY_BUDGET)}/day`}
              </button>
              <button disabled={actionLoading !== null} onClick={() => handleDecision("pause")} className="w-full py-3 text-[11px] uppercase font-medium border border-foreground disabled:opacity-50" style={{ letterSpacing: "2px" }}>
                {actionLoading === "pause" ? "…" : "Pause placement"}
              </button>
              <button disabled={actionLoading !== null} onClick={() => handleDecision("cancel")} className="w-full py-3 text-[11px] uppercase font-medium text-muted-foreground disabled:opacity-50" style={{ letterSpacing: "2px" }}>
                {actionLoading === "cancel" ? "…" : "Cancel placement"}
              </button>
            </div>
            {actionError && <div className="mt-4 text-[12px]" style={{ color: "#b91c1c" }}>{actionError}</div>}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-[12px] uppercase font-medium bg-foreground text-background" style={{ letterSpacing: "2px" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function roiValue(s: State): number | null {
  const spent = CREDIT_TOTAL - s.creditBalance + s.ownFunds;
  if (s.hoursSinceStart < 48 || spent <= 0) return null;
  return s.attributedSales / spent;
}

function BalanceCard({ label, sublabel, value, footer, tone, progress, children }: {
  label: string; sublabel: string; value: string; footer: string;
  tone: "primary" | "muted"; progress?: number; children?: ReactNode;
}) {
  const isPrimary = tone === "primary";
  return (
    <div className="p-7" style={{ background: isPrimary ? "#0a0a0a" : "transparent", color: isPrimary ? "#ffffff" : "#0a0a0a", border: isPrimary ? "1px solid #0a0a0a" : "1px solid var(--border)" }}>
      <div className="text-[10px] uppercase mb-2" style={{ letterSpacing: "2.5px", color: isPrimary ? "rgba(255,255,255,0.65)" : "var(--muted-foreground)" }}>{label}</div>
      <div className="text-[40px] font-normal leading-none mb-2">{value}</div>
      <div className="text-[12px] mb-4" style={{ color: isPrimary ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>{sublabel}</div>
      {progress !== undefined && (
        <div className="h-1 w-full mb-3" style={{ background: isPrimary ? "rgba(255,255,255,0.2)" : "var(--muted)" }}>
          <div className="h-full" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, background: isPrimary ? "#ffffff" : "#0a0a0a" }} />
        </div>
      )}
      <div className="text-[12px]" style={{ color: isPrimary ? "rgba(255,255,255,0.85)" : "#0a0a0a" }}>{footer}</div>
      {children}
    </div>
  );
}

function PerfRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "2.5px" }}>{label}</div>
        {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div className="font-normal leading-none" style={{ fontSize: 28 }}>{value}</div>
    </div>
  );
}

function ActivityLog({ daysActive, payingFromOwn, creditBalance, attributedSales }: {
  daysActive: number; payingFromOwn: boolean; creditBalance: number; attributedSales: number;
}) {
  const startDate = new Date(2026, 3, 18);
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmt = (d: Date) => `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;

  type Entry = { date: Date; tag: string; title: string; meta?: string };
  const entries: Entry[] = [{ date: startDate, tag: "Placement", title: "Placement started · 500 PLN credit issued", meta: "Pilot enrollment" }];

  if (daysActive >= 2 && attributedSales > 0) entries.push({ date: addDays(startDate, 2), tag: "ROI", title: "First attributed sale recorded", meta: "ROI tracking active" });
  if (creditBalance > 0 && creditBalance < LOW_CREDIT_THRESHOLD && !payingFromOwn) entries.push({ date: addDays(startDate, daysActive), tag: "Warning", title: `Credit-low warning shown · ${creditBalance} PLN left`, meta: "Decision pending" });
  if (creditBalance === 0 && !payingFromOwn) entries.push({ date: addDays(startDate, daysActive), tag: "Credit", title: "Free credit exhausted · placement paused", meta: "Awaiting seller decision" });
  if (payingFromOwn) entries.push({ date: addDays(startDate, Math.max(daysActive - 2, 1)), tag: "Decision", title: "Continued with own funds", meta: "Daily cap 25 PLN" });

  entries.sort((a, b) => b.date.getTime() - a.date.getTime());

  const tagColor: Record<string, string> = { Placement: "#0a0a0a", ROI: "#16a34a", Warning: "#b45309", Credit: "#b91c1c", Decision: "#0a0a0a" };

  return (
    <section className="border border-border bg-background p-8">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-[22px] font-normal">Activity</h2>
        <span className="text-[11px] text-muted-foreground">Audit trail · newest first</span>
      </div>
      <ol className="relative">
        <span aria-hidden className="absolute top-1 bottom-1 w-px" style={{ left: 6, background: "var(--border)" }} />
        {entries.map((e, i) => (
          <li key={i} className="relative pl-7 pb-6 last:pb-0">
            <span className="absolute w-3 h-3 rounded-full" style={{ left: 0, top: 4, background: "#ffffff", border: `2px solid ${tagColor[e.tag] ?? "#0a0a0a"}` }} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="uppercase font-medium px-2 py-0.5 border" style={{ fontSize: "9px", letterSpacing: "1.5px", borderColor: tagColor[e.tag] ?? "#0a0a0a", color: tagColor[e.tag] ?? "#0a0a0a" }}>{e.tag}</span>
              <span className="text-[11px] text-muted-foreground">{fmt(e.date)}</span>
            </div>
            <div className="mt-1 text-[14px] text-foreground">{e.title}</div>
            {e.meta && <div className="text-[12px] text-muted-foreground">{e.meta}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function PilotTimeline({ daysActive, creditBalance, payingFromOwn }: { daysActive: number; creditBalance: number; payingFromOwn: boolean }) {
  const startDate = new Date(2026, 3, 18);
  const today = new Date(startDate);
  today.setDate(today.getDate() + daysActive);
  const creditDaysLeft = Math.max(0, Math.ceil(creditBalance / DAILY_BUDGET));
  const creditEndDate = new Date(today);
  creditEndDate.setDate(creditEndDate.getDate() + creditDaysLeft);
  const paidPeriodEnd = new Date(creditEndDate);
  paidPeriodEnd.setDate(paidPeriodEnd.getDate() + 28);
  const reviewDate = new Date(paidPeriodEnd);
  reviewDate.setDate(reviewDate.getDate() + 3);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const creditExhausted = creditBalance === 0;
  const creditEnding = creditDaysLeft > 0 && creditDaysLeft <= 7 && !payingFromOwn;

  type NodeState = "done" | "current" | "upcoming" | "alert";
  const nodes: { label: string; date: string; state: NodeState }[] = [
    { label: "Pilot started", date: fmt(startDate), state: "done" },
    { label: `Day ${daysActive} — today`, date: fmt(today), state: "current" },
    { label: creditExhausted ? "Credit ended" : "Credit ends", date: creditExhausted ? fmt(today) : `~${fmt(creditEndDate)}`, state: creditExhausted ? "done" : creditEnding ? "alert" : "upcoming" },
    { label: "Paid period · day 28", date: `~${fmt(paidPeriodEnd)}`, state: payingFromOwn ? "current" : "upcoming" },
    { label: "Pilot review", date: `~${fmt(reviewDate)}`, state: "upcoming" },
  ];

  const lastDoneIdx = nodes.reduce((acc, n, i) => (n.state === "done" || n.state === "current" ? i : acc), 0);
  const fill = nodes.length > 1 ? lastDoneIdx / (nodes.length - 1) : 0;

  return (
    <section className="border border-border bg-background p-6">
      <div className="text-[10px] uppercase text-muted-foreground mb-5" style={{ letterSpacing: "2.5px" }}>Pilot timeline</div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-[7px] h-px" style={{ background: "var(--border)" }} />
        <div className="absolute left-0 top-[7px] h-px" style={{ background: "#0a0a0a", width: `${fill * 100}%` }} />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${nodes.length}, 1fr)` }}>
          {nodes.map((n, i) => {
            const isAlert = n.state === "alert";
            const isDoneOrCurrent = n.state === "done" || n.state === "current";
            const dotBg = isAlert ? "#b91c1c" : isDoneOrCurrent ? "#0a0a0a" : "#ffffff";
            const dotBorder = isAlert ? "#b91c1c" : isDoneOrCurrent ? "#0a0a0a" : "var(--border)";
            const align = i === 0 ? "items-start text-left" : i === nodes.length - 1 ? "items-end text-right" : "items-center text-center";
            return (
              <div key={i} className={`flex flex-col ${align} gap-2`}>
                <span className="w-3.5 h-3.5 rounded-full" style={{ background: dotBg, border: `1.5px solid ${dotBorder}`, boxShadow: n.state === "current" ? "0 0 0 4px rgba(10,10,10,0.08)" : undefined }} />
                <div className="text-[10px] uppercase" style={{ letterSpacing: "1.5px", color: isAlert ? "#b91c1c" : isDoneOrCurrent ? "#0a0a0a" : "var(--muted-foreground)", fontWeight: n.state === "current" || isAlert ? 600 : 400 }}>{n.label}</div>
                <div className="text-[11px]" style={{ color: isAlert ? "#b91c1c" : "var(--muted-foreground)" }}>{n.date}</div>
              </div>
            );
          })}
        </div>
      </div>
      {creditEnding && <div className="mt-5 text-[12px]" style={{ color: "#b91c1c" }}>Heads up: free credit ends in {creditDaysLeft} {creditDaysLeft === 1 ? "day" : "days"}. Set up a payment method to keep the placement live.</div>}
    </section>
  );
}

function PlacementPreview() {
  const accent = "#7a3b5c";
  return (
    <div className="w-[260px]">
      <div className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "2.5px" }}>Live placement preview</div>
      <div className="border border-border bg-card relative">
        <span className="absolute top-2 right-2 z-10 bg-background uppercase font-semibold px-2 py-1 border" style={{ fontSize: "9px", letterSpacing: "1px", borderColor: "#e8d28a", color: "#8a6d1f" }}>PROMOTED</span>
        <div className="aspect-square flex items-center justify-center px-4" style={{ background: `linear-gradient(180deg, ${accent}10 0%, ${accent}22 100%)` }}>
          <div className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "22px", letterSpacing: "-0.5px", color: accent, lineHeight: 1.1 }}>Marta Handmade</div>
        </div>
        <div className="p-3">
          <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: "12px", color: "#6b6b6b", lineHeight: 1.4 }}>Soft luxury for every day</p>
        </div>
        <button type="button" onClick={(e) => e.preventDefault()} className="absolute bottom-2 right-2 z-10 px-3 py-1.5 text-[10px] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity" style={{ letterSpacing: "2px" }} aria-label="Edit placement creative">Edit</button>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>As shown on homepage</span>
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">View live →</Link>
      </div>
    </div>
  );
}

function LastRefresh() {
  const [label] = useState(() =>
    "Last refresh " + new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
  );
  return <>{label}</>;
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button type="button" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }} aria-label="More info" className="w-3.5 h-3.5 rounded-full border border-muted-foreground text-muted-foreground inline-flex items-center justify-center" style={{ fontSize: 9, lineHeight: 1 }}>i</button>
      {open && <span role="tooltip" className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 text-[11px] normal-case whitespace-nowrap z-30" style={{ background: "#0a0a0a", color: "#ffffff", letterSpacing: "0.3px" }}>{text}</span>}
    </span>
  );
}

function RoiBars({ data, benchmark }: { data: number[]; benchmark: number }) {
  const [compare, setCompare] = useState(false);
  if (!data || data.length === 0) {
    return <div className="border border-dashed border-border h-20 flex items-center justify-center text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "2px" }}>No trend yet — collecting data</div>;
  }
  const days = data.slice(-7);
  const previous = days.map((v, i) => { const factor = 0.62 + (i / (days.length - 1 || 1)) * 0.12; const jitter = ((i * 37) % 11) / 100 - 0.05; return Math.max(0, v * (factor + jitter)); });
  const max = Math.max(benchmark, ...days, ...(compare ? previous : [])) * 1.1;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = labels.length - 1;
  const currAvg = days.reduce((a, b) => a + b, 0) / days.length;
  const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
  const delta = prevAvg > 0 ? ((currAvg - prevAvg) / prevAvg) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "1.5px" }}>Daily ROI · last 7 days</div>
        <button type="button" onClick={() => setCompare((c) => !c)} className="text-[10px] uppercase tracking-wider border border-border px-2 py-1 hover:bg-foreground hover:text-background transition-colors" style={{ letterSpacing: "1.5px" }} aria-pressed={compare}>{compare ? "Hide" : "Compare"} prev 7d</button>
      </div>
      <div className="relative h-24">
        <div className="absolute left-0 right-0" style={{ bottom: `${(benchmark / max) * 100}%`, borderTop: "1px dashed #888580" }} />
        <div className="absolute inset-0 flex items-end gap-1.5">
          {days.map((v, i) => {
            const isToday = i === days.length - 1;
            const beats = v >= benchmark;
            const prev = previous[i];
            return (
              <div key={i} className="flex-1 flex flex-row items-end justify-center gap-0.5 h-full" title={`${labels[(todayIdx - (days.length - 1 - i) + 7) % 7]}: ${v.toFixed(1)}x`}>
                {compare && <div className="w-1/2" style={{ height: `${(prev / max) * 100}%`, background: "transparent", border: "1px solid #888580" }} title={`Prev week: ${prev.toFixed(1)}x`} />}
                <div className={compare ? "w-1/2" : "w-full"} style={{ height: `${(v / max) * 100}%`, background: isToday ? "#0a0a0a" : beats ? "#0a0a0a" : "#cfcfcf", opacity: isToday ? 1 : beats ? 0.55 : 1 }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {days.map((_, i) => {
          const dayLabel = labels[(todayIdx - (days.length - 1 - i) + 7) % 7];
          const isToday = i === days.length - 1;
          return <div key={i} className="flex-1 text-center text-[9px] uppercase" style={{ letterSpacing: "1px", color: isToday ? "#0a0a0a" : "#888580", fontWeight: isToday ? 600 : 400 }}>{dayLabel}</div>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "1.5px" }}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5" style={{ background: "#0a0a0a" }} />This week</span>
          {compare && <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5" style={{ background: "transparent", border: "1px solid #888580" }} />Prev week</span>}
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-px" style={{ borderTop: "1px dashed #888580" }} />Benchmark {benchmark.toFixed(1)}x</span>
        </div>
        {compare && <div className="text-foreground" style={{ letterSpacing: "1.5px" }}>Avg {currAvg.toFixed(1)}x vs {prevAvg.toFixed(1)}x <span style={{ color: delta >= 0 ? "#16a34a" : "#dc2626" }}>({delta >= 0 ? "+" : ""}{delta.toFixed(0)}%)</span></div>}
      </div>
    </div>
  );
}
