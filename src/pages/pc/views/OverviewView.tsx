"use client";

import { useMemo, useState } from "react";
import { MetricsDashboard } from "@/components/arc/blocks/metrics-dashboard/metrics-dashboard";
import { FunnelChart } from "@/components/arc/funnel-chart/funnel-chart";
import { DonutChart } from "@/components/arc/donut-chart/donut-chart";
import { BarChart } from "@/components/arc/bar-chart/bar-chart";
import { ActivityHeatmap } from "@/components/arc/activity-heatmap/activity-heatmap";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import styles from "./OverviewView.module.css";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const countFormatter = new Intl.NumberFormat("pt-BR");

export function OverviewView() {
  const [funnelView, setFunnelView] = useState<string>("total");
  const [donutDataset, setDonutDataset] = useState<"product" | "payment">("product");

  // 1. Dados do Funil de Conversão (FunnelChart)
  const funnelStages = useMemo(() => [
    { key: "bio", label: "1. Visitas no Link da Bio", values: { mobile: 12000, desktop: 2280 } },
    { key: "product", label: "2. Visualização de Oferta", values: { mobile: 3490, desktop: 660 } },
    { key: "checkout", label: "3. Checkout Iniciado", values: { mobile: 860, desktop: 160 } },
    { key: "paid", label: "4. Venda Concluída", values: { mobile: 184, desktop: 34 } },
  ], []);

  const funnelSegments = useMemo(() => [
    { key: "mobile", label: "Mobile (84%)" },
    { key: "desktop", label: "Desktop (16%)" },
  ], []);

  // 2. Dados do Gráfico de Rosca (DonutChart)
  const productData = useMemo(() => [
    { key: "courses", label: "Cursos Online", value: 8613, color: "#2563eb" },
    { key: "mentorship", label: "Mentorias 1:1", value: 4158, color: "#0d9488" },
    { key: "guides", label: "E-books & PDFs", value: 2079, color: "#f59e0b" },
  ], []);

  const paymentData = useMemo(() => [
    { key: "pix", label: "Pix Instantâneo", value: 10989, color: "#0d6b63" },
    { key: "card", label: "Cartão de Crédito", value: 3861, color: "#6366f1" },
  ], []);

  // 3. Dados do Gráfico de Barras Diário (BarChart)
  const barChartData = useMemo(() => [
    { key: "2026-10-19", label: "Segunda-feira, 19 de out.", axisLabel: "Seg", value: 18 },
    { key: "2026-10-20", label: "Terça-feira, 20 de out.", axisLabel: "Ter", value: 22 },
    { key: "2026-10-21", label: "Quarta-feira, 21 de out.", axisLabel: "Qua", value: 35 },
    { key: "2026-10-22", label: "Quinta-feira, 22 de out.", axisLabel: "Qui", value: 26 },
    { key: "2026-10-23", label: "Sexta-feira, 23 de out.", axisLabel: "Sex", value: 31 },
    { key: "2026-10-24", label: "Sábado, 24 de out.", axisLabel: "Sáb", value: 42 },
    { key: "2026-10-25", label: "Domingo, 25 de out.", axisLabel: "Dom", value: 48 },
  ], []);

  // 4. Dados do Mapa de Atividade Anual (ActivityHeatmap)
  const heatmapDays = useMemo(() => {
    const list = [];
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 9, 25);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      // Criadores vendem mais nos finais de semana e lançamentos
      const base = dayOfWeek === 0 || dayOfWeek === 6 ? 6 : 3;
      const noise = (d.getDate() * 7 + d.getMonth() * 13) % 7;
      list.push({
        date: d.toISOString().split("T")[0]!,
        count: base + noise,
      });
    }
    return list;
  }, []);

  return (
    <div className={styles.container}>
      {/* 1. Dashboard Principal com KPIs e Gráfico Crosshair */}
      <MetricsDashboard />

      {/* 2. Funil de Conversão Ponta a Ponta (UIArc FunnelChart) */}
      <section className={styles.fullWidthCard} aria-labelledby="funnel-title">
        <div className={styles.cardHead}>
          <div className={styles.cardHeadText}>
            <h3 id="funnel-title" className={styles.cardTitle}>Funil de Conversão do Link da Bio</h3>
            <p className={styles.cardDesc}>
              Acompanhe a retenção dos visitantes desde o clique na rede social até o pagamento aprovado.
            </p>
          </div>
          <div className={styles.funnelControls}>
            <SegmentedControl
              options={[
                { value: "total", label: "Visão Geral" },
                { value: "split", label: "Por Dispositivo" },
              ]}
              value={funnelView}
              onValueChange={setFunnelView}
            />
          </div>
        </div>

        <FunnelChart
          stages={funnelStages}
          segments={funnelSegments}
          view={funnelView}
          label="Funil de Conversão Vira"
          unit="sessões"
          height={200}
          flow={true}
          formatValue={v => countFormatter.format(v)}
        />
      </section>

      {/* 3. Grid com DonutChart e BarChart lado a lado */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Rosca: Mix de Receita */}
        <section className={styles.chartCard} aria-labelledby="donut-title">
          <div className={styles.cardHead}>
            <div className={styles.cardHeadText}>
              <h3 id="donut-title" className={styles.cardTitle}>Mix de Receita & Vendas</h3>
              <p className={styles.cardDesc}>Participação por categoria de infoproduto ou método de recebimento.</p>
            </div>
            <div className={styles.segmentedWrap}>
              <SegmentedControl
                options={[
                  { value: "product", label: "Produto" },
                  { value: "payment", label: "Pagamento" },
                ]}
                value={donutDataset}
                onValueChange={(v: string) => setDonutDataset(v as "product" | "payment")}
              />
            </div>
          </div>

          <div className={styles.donutWrapper}>
            <DonutChart
              data={donutDataset === "product" ? productData : paymentData}
              label={donutDataset === "product" ? "Receita por Produto" : "Receita por Método"}
              totalLabel="Receita Total"
              formatValue={v => currencyFormatter.format(v)}
              size={240}
              thickness={28}
              legend={true}
            />
          </div>
        </section>

        {/* Gráfico de Barras: Volume de Vendas dos Últimos 7 Dias */}
        <section className={styles.chartCard} aria-labelledby="bar-title">
          <div className={styles.cardHead}>
            <div className={styles.cardHeadText}>
              <h3 id="bar-title" className={styles.cardTitle}>Vendas dos Últimos 7 Dias</h3>
              <p className={styles.cardDesc}>Volume diário de pedidos com comparação contra a média móvel.</p>
            </div>
          </div>

          <BarChart
            data={barChartData}
            label="Vendas nos últimos 7 dias"
            period="19 a 25 de Outubro de 2026"
            unit="vendas"
            averageLabel="Média diária"
            valueLabel="Vendas no dia"
            showAverage={true}
            height={200}
            formatValue={v => countFormatter.format(v)}
          />
        </section>
      </div>

      {/* 4. Calendário de Calor Anual (ActivityHeatmap) */}
      <section className={styles.fullWidthCard} aria-labelledby="heatmap-title">
        <div className={styles.cardHead}>
          <div className={styles.cardHeadText}>
            <h3 id="heatmap-title" className={styles.cardTitle}>Consistência Anual de Vendas (2026)</h3>
            <p className={styles.cardDesc}>
              Frequência e volume diário de infoprodutos e mentorias vendidos ao longo do ano.
            </p>
          </div>
        </div>

        <div className={styles.heatmapWrap}>
          <ActivityHeatmap
            days={heatmapDays}
            label="Vendas diárias em 2026"
            period="2026"
            unit={{ one: "venda", other: "vendas" }}
            weekStartsOn={1}
            locale="pt-BR"
          />
        </div>
      </section>
    </div>
  );
}

export default OverviewView;
