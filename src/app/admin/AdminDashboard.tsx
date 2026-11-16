"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Bot, LogOut, RefreshCw, Search } from "lucide-react";

type Llm = { t: number; endpoint: string; input: string; output: string; ms: number; ok: boolean; extra: Record<string, unknown> };
type Session = {
  sid: string;
  vid: string;
  ip: string;
  ips: string[];
  country?: string;
  ua?: string;
  device: { browser: string; os: string; kind: string; bot: boolean };
  start: number;
  end: number;
  activeMs: number;
  entry?: Record<string, string>;
  sections: Record<string, number>;
  llm: Llm[];
  timeline: { t: number; type: string; text: string }[];
};
type Visitor = { vid: string; ips: string[]; country?: string; sessions: number; first: number; last: number; activeMs: number; llm: number; device: string };
type Data = {
  days: number;
  summary: { visitors: number; visitorsToday: number; sessions: number; llmCalls: number; avgActiveMs: number; sectionTotals: Record<string, number> };
  visitors: Visitor[];
  sessions: Session[];
};

const dur = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
};
const ago = (t: number) => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};
const clock = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const flag = (cc?: string) => (cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "");

const Bars = ({ values }: { values: Record<string, number> }) => {
  const rows = Object.entries(values).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, v]) => v));
  if (!rows.length) return <p className="text-sm bw-faint">No section time yet.</p>;
  return (
    <div className="space-y-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="font-mono text-xs truncate">{k}</span>
          <span className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
            <span className="block h-full rounded-full bg-[var(--accent-bright)]" style={{ width: `${(v / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono text-xs bw-muted">{dur(v)}</span>
        </div>
      ))}
    </div>
  );
};

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setBusy(false);
    if (res.ok) onDone();
    else setError((await res.json().catch(() => ({}))).error || "Login failed.");
  };
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bw-panel p-7 space-y-4">
        <div>
          <p className="font-mono text-xs bw-muted uppercase tracking-wider">binaryworks</p>
          <h1 className="text-2xl font-semibold mt-1">Visitor dashboard</h1>
        </div>
        <label className="block text-sm">
          Email
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border bw-rule bg-transparent outline-none focus:border-[var(--accent-bright)]" />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border bw-rule bg-transparent outline-none focus:border-[var(--accent-bright)]" />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full py-2.5 rounded-lg bw-accent-bg text-white font-medium cursor-pointer disabled:opacity-50">
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}

const AdminDashboard = () => {
  const [state, setState] = useState<"loading" | "login" | "ready">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [days, setDays] = useState(7);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showBots, setShowBots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const res = await fetch(`/api/admin/data?days=${days}`, { cache: "no-store" });
    setRefreshing(false);
    if (res.status === 401) return setState("login");
    if (!res.ok) return;
    setData(await res.json());
    setState("ready");
  }, [days]);

  useEffect(() => {
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  // "Visitor 1" is the earliest one seen in this range
  const number = useMemo(() => {
    const m = new Map<string, number>();
    [...(data?.visitors ?? [])].sort((a, b) => a.first - b.first).forEach((v, i) => m.set(v.vid, i + 1));
    return m;
  }, [data]);

  const sessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.sessions ?? []).filter(
      (s) =>
        (showBots || !s.device.bot) &&
        (!q || s.ips.join(" ").includes(q) || s.country?.toLowerCase() === q || s.llm.some((l) => l.input.toLowerCase().includes(q)) || `visitor ${number.get(s.vid)}` === q)
    );
  }, [data, query, showBots, number]);

  const current = sessions.find((s) => s.sid === selected) ?? sessions[0];
  const visitorOf = (vid: string) => data?.visitors.find((v) => v.vid === vid);

  if (state === "loading") return <main className="min-h-screen grid place-items-center font-mono text-sm bw-muted">loading…</main>;
  if (state === "login") return <Login onDone={load} />;
  if (!data) return null;

  const s = data.summary;
  const v = current && visitorOf(current.vid);

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-xs bw-muted uppercase tracking-wider">binaryworks · admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Visitors</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-2 rounded-lg border bw-rule bg-[var(--bg-card)] cursor-pointer">
            <option value={1}>Today + yesterday</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button onClick={load} aria-label="Refresh" className="grid place-items-center w-9 h-9 rounded-lg border bw-rule bw-chip cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              setState("login");
            }}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border bw-rule bw-chip cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </header>

      {/* summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border bw-rule bg-[var(--border-color)] mb-8">
        {[
          ["Visitors", `${s.visitors}`, `${s.visitorsToday} today`],
          ["Visits", `${s.sessions}`, `last ${data.days} days`],
          ["LLM calls", `${s.llmCalls}`, "Glitch + ScholarLens"],
          ["Avg time on site", dur(s.avgActiveMs), "per visit, tab visible"],
        ].map(([k, val, note]) => (
          <div key={k} className="bg-[var(--bg-card)] p-5">
            <p className="text-xs bw-muted">{k}</p>
            <p className="text-3xl font-semibold tracking-tight mt-1">{val}</p>
            <p className="text-xs bw-faint mt-1">{note}</p>
          </div>
        ))}
      </section>

      <section className="bw-panel p-5 mb-8">
        <h2 className="text-sm font-semibold mb-4">Where people spend time (all visits)</h2>
        <Bars values={s.sectionTotals} />
      </section>

      <div className="grid lg:grid-cols-[22rem_1fr] gap-6 items-start">
        {/* visit list */}
        <aside className="bw-panel overflow-hidden">
          <div className="p-3 border-b bw-rule space-y-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border bw-rule">
              <Search className="w-4 h-4 bw-faint" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="IP, country, question…" className="flex-1 bg-transparent outline-none text-sm" />
            </label>
            <label className="flex items-center gap-2 text-xs bw-muted cursor-pointer">
              <input type="checkbox" checked={showBots} onChange={(e) => setShowBots(e.target.checked)} /> show bots and scripts
            </label>
          </div>
          <ul data-scroll-box className="max-h-[70vh] overflow-y-auto divide-y divide-[var(--border-color)]">
            {sessions.length === 0 && <li className="p-4 text-sm bw-faint">No visits yet.</li>}
            {sessions.map((x) => (
              <li key={x.sid}>
                <button
                  onClick={() => setSelected(x.sid)}
                  className={`w-full text-left px-4 py-3 cursor-pointer transition-colors ${current?.sid === x.sid ? "bw-tint" : "hover:bg-[var(--bg-subtle)]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">
                      {flag(x.country)} {number.has(x.vid) ? `Visitor ${number.get(x.vid)}` : "Bot / script"}
                      {x.device.bot && <Bot className="inline w-3.5 h-3.5 ml-1 bw-faint" />}
                    </span>
                    <span className="text-xs bw-faint">{ago(x.end)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1 font-mono text-[11px] bw-muted">
                    <span className="truncate">{x.ip}</span>
                    <span className="shrink-0">
                      {dur(x.activeMs)}
                      {x.llm.length > 0 && <span className="ml-2 bw-accent">{x.llm.length} LLM</span>}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* one visit in detail */}
        {current ? (
          <div className="space-y-6 min-w-0">
            <section className="bw-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold">
                  {flag(current.country)} {number.has(current.vid) ? `Visitor ${number.get(current.vid)}` : "Bot / script"}
                </h2>
                <p className="text-sm bw-muted">
                  {new Date(current.start).toLocaleString()} · {dur(current.activeMs)} active
                </p>
              </div>
              <dl className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                {[
                  ["IP", current.ips.join(", ")],
                  ["Country", current.country || "unknown (only known through Cloudflare)"],
                  ["Device", `${current.device.kind} · ${current.device.os} · ${current.device.browser}`],
                  ["Screen", current.entry?.screen || "–"],
                  ["Language / time zone", `${current.entry?.lang || "–"} · ${current.entry?.tz || "–"}`],
                  ["Came from", current.entry?.referrer || "direct"],
                  ["Landed on", current.entry?.path || "–"],
                  ["Visits by this visitor", v ? `${v.sessions} (first ${ago(v.first)})` : "–"],
                  ["Visitor id", current.vid],
                ].map(([k, val]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs bw-faint">{k}</dt>
                    <dd className="truncate" title={val}>
                      {val}
                    </dd>
                  </div>
                ))}
              </dl>
              {current.ua && <p className="mt-4 font-mono text-[11px] bw-faint break-all">{current.ua}</p>}
            </section>

            <section className="bw-panel p-5">
              <h3 className="text-sm font-semibold mb-4">Time per section</h3>
              <Bars values={current.sections} />
            </section>

            <section className="bw-panel p-5">
              <h3 className="text-sm font-semibold mb-4">LLM calls ({current.llm.length})</h3>
              {current.llm.length === 0 && <p className="text-sm bw-faint">Didn&apos;t use the AI demos.</p>}
              <div className="space-y-3">
                {current.llm.map((l, i) => (
                  <details key={i} className="rounded-lg border bw-rule p-3 group" open={i === current.llm.length - 1}>
                    <summary className="cursor-pointer list-none flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${l.ok ? "bw-tint bw-accent" : "bg-red-500/10 text-red-500"}`}>{l.endpoint}</span>
                      <span className="font-medium flex-1 min-w-0 truncate">{l.input}</span>
                      <span className="font-mono text-[11px] bw-faint">
                        {clock(l.t)} · {(l.ms / 1000).toFixed(1)}s
                      </span>
                    </summary>
                    <p className="mt-3 text-sm bw-muted whitespace-pre-wrap leading-relaxed">{l.output}</p>
                    {Array.isArray(l.extra.actions) && l.extra.actions.length > 0 && (
                      <p className="mt-2 font-mono text-[11px] bw-faint break-all">actions: {JSON.stringify(l.extra.actions)}</p>
                    )}
                    {typeof l.extra.route === "string" && l.extra.route && <p className="mt-2 font-mono text-[11px] bw-faint">route: {l.extra.route}</p>}
                  </details>
                ))}
              </div>
            </section>

            <section className="bw-panel p-5">
              <h3 className="text-sm font-semibold mb-4">What they did</h3>
              <ol className="space-y-1.5 text-sm">
                {current.timeline.map((e, i) => (
                  <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-3">
                    <span className="font-mono text-[11px] bw-faint pt-0.5">{clock(e.t)}</span>
                    <span className={e.type === "llm" ? "bw-accent" : ""}>{e.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <p className="text-sm bw-faint">Pick a visit.</p>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
