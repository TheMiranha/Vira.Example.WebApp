"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Check, Download } from "lucide-react";
import { motionTokens } from "../../lib/motion-tokens";
import styles from "./metrics-dashboard.module.css";

export type Range = "7d" | "30d" | "90d";
export type MetricKey = "revenue" | "conversion" | "orders" | "averageTicket";
export type Metric = { key: MetricKey; label: string; unit: "currency" | "percent" | "count"; lowerIsBetter?: boolean };

const metrics: Metric[] = [
  { key: "revenue", label: "Faturamento Total", unit: "currency" },
  { key: "conversion", label: "Taxa de Conversão", unit: "percent" },
  { key: "orders", label: "Vendas Concluídas", unit: "count" },
  { key: "averageTicket", label: "Ticket Médio", unit: "currency" },
];

const ranges: { value: Range; label: string; long: string; days: number; step: number }[] = [
  { value: "7d", label: "7D", long: "Últimos 7 dias", days: 7, step: 1 },
  { value: "30d", label: "30D", long: "Últimos 30 dias", days: 30, step: 1 },
  { value: "90d", label: "90D", long: "Últimos 90 dias", days: 90, step: 7 },
];

/* Deterministic daily series calibrated for a successful digital creator */
const END = new Date(2026, 9, 25);
const TOTAL_DAYS = 180;
function wave(i: number, seed: number) {
  return Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.23 + seed * 2) * 0.35 + Math.sin(i * 2.1 + seed * 3) * 0.15;
}

const daily = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const weekday = new Date(END.getTime() - (TOTAL_DAYS - 1 - i) * 864e5).getDay();
  const weekend = weekday === 0 || weekday === 6 ? 1.25 : 1; // creators sell more on weekends
  const visitors = Math.round((280 + i * 2.8) * weekend * (1 + wave(i, 1) * 0.15));
  const conversion = 4.2 + i * 0.005 + wave(i, 4) * 0.4;
  const orders = Math.max(1, Math.round((visitors * conversion) / 100));
  const averageTicket = 68 + wave(i, 8) * 8;
  const revenue = Math.round(orders * averageTicket);
  return { visitors, conversion, orders, revenue, averageTicket };
});

type Point = { date: Date; value: number; previous: number };
type Day = (typeof daily)[number];

function aggregate(days: Day[], key: MetricKey) {
  if (key === "revenue" || key === "orders") {
    return days.reduce((sum, d) => sum + d[key], 0);
  }
  if (key === "conversion") {
    const totalOrders = days.reduce((s, d) => s + d.orders, 0);
    const totalVisitors = days.reduce((s, d) => s + d.visitors, 0);
    return totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
  }
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = days.reduce((s, d) => s + d.orders, 0);
  return totalOrders > 0 ? totalRevenue / totalOrders : 0;
}

function buildRange(range: Range) {
  const { days, step } = ranges.find((r) => r.value === range)!;
  const current = daily.slice(TOTAL_DAYS - days);
  const previous = daily.slice(TOTAL_DAYS - days * 2, TOTAL_DAYS - days);
  const series = {} as Record<MetricKey, Point[]>;
  for (const metric of metrics) {
    const points: Point[] = [];
    for (let i = 0; i < days; i += step) {
      const date = new Date(END.getTime() - (days - 1 - i) * 864e5);
      points.push({
        date,
        value: aggregate(current.slice(i, i + step), metric.key),
        previous: aggregate(previous.slice(i, i + step), metric.key),
      });
    }
    series[metric.key] = points;
  }
  const totals = Object.fromEntries(
    metrics.map((m) => {
      const now = aggregate(current, m.key);
      const before = aggregate(previous, m.key);
      return [m.key, { value: now, delta: m.unit === "percent" ? now - before : before > 0 ? ((now - before) / before) * 100 : 0 }];
    })
  ) as Record<MetricKey, { value: number; delta: number }>;
  return { series, totals, step, revenue: totals.revenue.value };
}

const defaultProducts = [
  { name: "Guia Definitivo de Criação no TikTok & Reels", share: 0.34 },
  { name: "Mentoria 1:1 Estratégica de Posicionamento", share: 0.28 },
  { name: "Pack de 50 Templates Editáveis Notion", share: 0.18 },
  { name: "Manual Prático de Monetização para Creators", share: 0.12 },
  { name: "Comunidade VIP no Telegram (Acesso Anual)", share: 0.08 },
];

const defaultSources = [
  { name: "Instagram (Link na Bio)", share: 0.46 },
  { name: "WhatsApp & Direct", share: 0.24 },
  { name: "TikTok Profile", share: 0.16 },
  { name: "YouTube Shorts / Descrição", share: 0.09 },
  { name: "Tráfego Direto & Outros", share: 0.05 },
];

const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const currencyFullFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const countFormat = new Intl.NumberFormat("pt-BR");
const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

const formatValue = (metric: Metric, value: number) => {
  if (metric.unit === "currency") return currencyFullFormat.format(value);
  if (metric.unit === "percent") return value.toFixed(1) + "%";
  return countFormat.format(Math.round(value));
};

const formatAxis = (metric: Metric, value: number) => {
  if (metric.unit === "currency") return currencyFormat.format(value);
  if (metric.unit === "percent") return value.toFixed(value < 10 ? 1 : 0) + "%";
  return countFormat.format(value);
};

function niceScale(min: number, max: number, percent: boolean) {
  const lo = percent ? Math.max(0, min - (max - min) * 0.6) : 0;
  const span = max - lo || 1;
  const raw = span / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(lo / step) * step;
  return { min: start, max: start + step * 3, ticks: [0, 1, 2, 3].map((i) => start + step * i) };
}

function CountValue({ value, format }: { value: number; format: (value: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const formatRef = useRef(format);
  const [initial] = useState(() => format(value));
  const reduce = useReducedMotion();
  useEffect(() => { formatRef.current = format; });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) { shown.current = value; node.textContent = formatRef.current(value); return; }
    const controls = animate(shown.current, value, {
      duration: motionTokens.duration.considered,
      ease: motionTokens.ease.standard,
      onUpdate: (v) => { shown.current = v; node.textContent = formatRef.current(v); },
    });
    return () => controls.stop();
  }, [value, reduce]);
  return <span ref={ref}>{initial}</span>;
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 3) return pts.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const n = pts.length;
  const slope = pts.slice(1).map(([x, y], i) => (y - pts[i][1]) / (x - pts[i][0]));
  const tangent = pts.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    const a = slope[i - 1], b = slope[i];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = (x1 - x0) / 3;
    d += ` C${(x0 + h).toFixed(1)} ${(y0 + tangent[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)} ${(y1 - tangent[i + 1] * h).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

const W = 600;
const H = 180;

export interface MetricsDashboardProps {
  storeName?: string;
  storeUrl?: string;
}

export function MetricsDashboard({ storeName = "Loja da Alexandra Silva", storeUrl = "vira.app/alexandra" }: MetricsDashboardProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [range, setRange] = useState<Range>("30d");
  const [metricKey, setMetricKey] = useState<MetricKey>("revenue");
  const [compare, setCompare] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [exported, setExported] = useState(false);
  const exportTimer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<"lg" | "md" | "sm">("lg");

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = (width: number) => setSize(width < 480 ? "sm" : width < 780 ? "md" : "lg");
    measure(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => buildRange(range), [range]);
  const metric = metrics.find((m) => m.key === metricKey)!;
  const points = data.series[metricKey];
  const rangeInfo = ranges.find((r) => r.value === range)!;

  const chart = useMemo(() => {
    const values = points.flatMap((p) => (compare ? [p.value, p.previous] : [p.value]));
    const scale = niceScale(Math.min(...values), Math.max(...values), metric.unit === "percent");
    const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * W);
    const y = (v: number) => H - ((v - scale.min) / (scale.max - scale.min)) * H;
    const line = (key: "value" | "previous") => smoothPath(points.map((p, i) => [x(i), y(p[key])]));
    const current = line("value");
    return { scale, x, y, current, previous: line("previous"), area: current + ` L${W} ${H} L0 ${H} Z` };
  }, [points, compare, metric.unit]);

  const labelEvery = Math.ceil(points.length / (size === "sm" ? 3 : size === "md" ? 4 : 6));
  const focus = active === null ? null : points[active];

  useEffect(() => () => window.clearTimeout(exportTimer.current), []);

  function selectRange(value: Range) { setRange(value); setActive(null); }
  function inspect(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setActive(Math.round(ratio * (points.length - 1)));
  }
  function onChartKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const last = points.length - 1;
    setActive((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return last;
      const from = current ?? last;
      return Math.min(last, Math.max(0, from + (event.key === "ArrowRight" ? 1 : -1)));
    });
  }
  function runExport() {
    setExported(true);
    window.clearTimeout(exportTimer.current);
    exportTimer.current = window.setTimeout(() => setExported(false), 1800);
  }

  const swap = reduce ? { duration: 0 } : { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard };
  const rescale = reduce ? { duration: 0 } : motionTokens.spring.smooth;
  const tooltipLeft = focus ? Math.min(88, Math.max(12, (chart.x(active!) / W) * 100)) : 0;

  return (
    <section ref={rootRef} className={styles.dashboard} data-size={size} aria-label="Painel de métricas da criadora">
      <header className={styles.header}>
        <div className={styles.title}>
          <h2>{storeName}</h2>
          <p>{storeUrl} · {rangeInfo.long}</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.segmented} role="group" aria-label="Período do relatório">
            {ranges.map((r) => (
              <button key={r.value} type="button" aria-pressed={range === r.value} aria-label={r.long} onClick={() => selectRange(r.value)}>
                {range === r.value && <motion.span layoutId={`${uid}-range`} className={styles.segmentThumb} transition={reduce ? { duration: 0 } : motionTokens.spring.snappy} />}
                <span className={styles.segmentLabel}>{r.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className={styles.exportButton} onClick={runExport} aria-live="polite">
            <span className={styles.exportIcon}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={exported ? "done" : "idle"} initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }} transition={swap}>
                  {exported ? <Check size={14} /> : <Download size={14} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.exportLabel}>
              <span aria-hidden={exported} data-hidden={exported}>Exportar</span>
              <span aria-hidden={!exported} data-hidden={!exported}>Exportado!</span>
            </span>
          </button>
        </div>
      </header>

      <div className={styles.kpis} role="tablist" aria-label="Métrica selecionada">
        {metrics.map((m) => {
          const total = data.totals[m.key];
          const good = m.lowerIsBetter ? total.delta < 0 : total.delta > 0;
          const selected = metricKey === m.key;
          const deltaText = m.unit === "percent" ? Math.abs(total.delta).toFixed(1) + " pts" : Math.abs(total.delta).toFixed(1) + "%";
          return (
            <button key={m.key} type="button" role="tab" aria-selected={selected} className={styles.kpi} onClick={() => { setMetricKey(m.key); setActive(null); }}>
              {selected && <motion.span layoutId={`${uid}-kpi`} className={styles.kpiIndicator} transition={reduce ? { duration: 0 } : motionTokens.spring.smooth} />}
              <span className={styles.kpiLabel}>{m.label}</span>
              <span className={styles.kpiValue}><CountValue value={total.value} format={(v) => formatValue(m, v)} /></span>
              <span className={`${styles.delta} ${good ? styles.good : styles.bad}`}>
                {total.delta >= 0 ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownRight size={13} aria-hidden />}
                <span>{deltaText}</span>
                <span className={styles.srOnly}>{total.delta >= 0 ? "acima" : "abaixo"} em relação ao período anterior</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartBar}>
          <div className={styles.legend} aria-hidden>
            <span><i className={styles.swatch} />{metric.label}</span>
            {compare && <span><i className={styles.swatchPrevious} />Período anterior</span>}
          </div>
          <label className={styles.compare}>
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            <span className={styles.check} aria-hidden><Check size={11} strokeWidth={2.5} /></span>
            Comparar período anterior
          </label>
        </div>

        <div className={styles.plot}>
          <div className={styles.yAxis} aria-hidden>
            {[...chart.scale.ticks].reverse().map((t) => <span key={t}>{formatAxis(metric, t)}</span>)}
          </div>
          <div
            className={styles.chartArea}
            tabIndex={0}
            role="img"
            aria-label={`${metric.label}, ${rangeInfo.long.toLowerCase()}. Use as setas para inspecionar valores diários.`}
            onPointerMove={inspect}
            onPointerDown={inspect}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }}
            onKeyDown={onChartKey}
            onBlur={() => setActive(null)}
          >
            <div className={styles.grid} aria-hidden>{chart.scale.ticks.map((t) => <span key={t} />)}</div>
            <AnimatePresence initial={false}>
              <motion.svg
                key={range + metricKey}
                className={styles.svg}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                aria-hidden
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : motionTokens.duration.standard, ease: motionTokens.ease.standard }}
              >
                <motion.path className={styles.area} initial={false} animate={{ d: chart.area }} transition={rescale} />
                <motion.path className={styles.previous} initial={false} animate={{ d: chart.previous, opacity: compare ? 1 : 0 }} transition={rescale} />
                <motion.path className={styles.line} initial={false} animate={{ d: chart.current }} transition={rescale} />
              </motion.svg>
            </AnimatePresence>
            {focus && (
              <>
                <span className={styles.crosshair} style={{ left: `${(chart.x(active!) / W) * 100}%` }} aria-hidden />
                <span className={styles.dot} style={{ left: `${(chart.x(active!) / W) * 100}%`, top: `${(chart.y(focus.value) / H) * 100}%` }} aria-hidden />
                <div className={styles.tooltip} style={{ left: `${tooltipLeft}%`, ...(chart.y(focus.value) / H < 0.5 ? { top: "auto", bottom: 6 } : null) }} role="status">
                  <span className={styles.tooltipDate}>{data.step > 1 ? "Semana de " : ""}{dayFormat.format(focus.date)}</span>
                  <strong>{formatValue(metric, focus.value)}</strong>
                  {compare && <span className={styles.tooltipPrevious}>{formatValue(metric, focus.previous)} anterior</span>}
                </div>
              </>
            )}
          </div>
          <div className={styles.xAxis} aria-hidden>
            {points.map((p, i) => {
              if (i % labelEvery !== 0) return null;
              const pct = (chart.x(i) / W) * 100;
              return <span key={i} style={{ left: `${pct}%`, transform: `translateX(${i === 0 ? 0 : pct > 92 ? -100 : -50}%)` }}>{dayFormat.format(p.date)}</span>;
            })}
          </div>
        </div>
      </div>

      <div className={styles.breakdowns}>
        <Breakdown title="Top Produtos Vendidos" column="Faturamento" rows={defaultProducts} total={data.revenue} isCurrency reduce={!!reduce} />
        <Breakdown title="Canais de Tráfego & Origem" column="Participação" rows={defaultSources} total={100} isPercent reduce={!!reduce} />
      </div>
    </section>
  );
}

function Breakdown({ title, column, rows, total, isCurrency, isPercent, reduce }: { title: string; column: string; rows: { name: string; share: number }[]; total: number; isCurrency?: boolean; isPercent?: boolean; reduce: boolean }) {
  const max = Math.max(...rows.map((r) => r.share));
  return (
    <section className={styles.breakdown} aria-label={title}>
      <div className={styles.breakdownHead}><h3>{title}</h3><span>{column}</span></div>
      <ul>
        {rows.map((row) => (
          <li key={row.name}>
            <span className={styles.bar} style={{ clipPath: `inset(0 ${(100 - (row.share / max) * 100).toFixed(2)}% 0 0 round 6px)`, transitionDuration: reduce ? "0ms" : undefined }} aria-hidden />
            <span className={styles.rowName} title={row.name}>{row.name}</span>
            <span className={styles.rowValue}>
              {isCurrency ? (
                <CountValue value={total * row.share} format={(v) => currencyFormat.format(Math.round(v))} />
              ) : isPercent ? (
                <span>{(row.share * 100).toFixed(0)}%</span>
              ) : (
                <CountValue value={total * row.share} format={(v) => countFormat.format(Math.round(v))} />
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MetricsDashboard;
