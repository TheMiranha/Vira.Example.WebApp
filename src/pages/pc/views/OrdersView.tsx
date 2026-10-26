import { useState, useMemo } from "react";
import { SortableDataTable, type DataColumn } from "@/components/arc/sortable-data-table/sortable-data-table";
import { Badge } from "@/components/arc/badge/badge";
import { Input } from "@/components/arc/input/input";
import { Button } from "@/components/arc/button/button";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { ArrowUpRight, CheckCircle2, Download, QrCode } from "lucide-react";
import styles from "./OrdersView.module.css";

interface OrderRecord extends Record<string, unknown> {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  product: string;
  paymentMethod: "Pix" | "Cartão 12x" | "Cartão à vista";
  grossValue: number;
  fee: number;
  netValue: number;
  status: "Pago no Pix" | "Aprovado no Cartão";
}

const mockOrders: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "#TRX-9482",
    date: "25/10/2026 18:32",
    customerName: "Beatriz Nogueira",
    customerEmail: "beatriz.nogueira@gmail.com",
    product: "Mentoria 1:1 Estratégica",
    paymentMethod: "Pix",
    grossValue: 497.00,
    fee: 0.00,
    netValue: 497.00,
    status: "Pago no Pix",
  },
  {
    id: "ord-2",
    orderNumber: "#TRX-9481",
    date: "25/10/2026 16:15",
    customerName: "Lucas Mendonça",
    customerEmail: "lucas.mendonca@yahoo.com.br",
    product: "Guia TikTok & Reels 2026",
    paymentMethod: "Pix",
    grossValue: 47.00,
    fee: 0.00,
    netValue: 47.00,
    status: "Pago no Pix",
  },
  {
    id: "ord-3",
    orderNumber: "#TRX-9480",
    date: "24/10/2026 21:04",
    customerName: "Mariana Alencar",
    customerEmail: "mariana.alencar@outlook.com",
    product: "Pack 50+ Notion Templates",
    paymentMethod: "Cartão à vista",
    grossValue: 67.00,
    fee: 0.00,
    netValue: 67.00,
    status: "Aprovado no Cartão",
  },
  {
    id: "ord-4",
    orderNumber: "#TRX-9479",
    date: "24/10/2026 14:50",
    customerName: "Rodrigo Fontes",
    customerEmail: "rodrigo.fontes@techbrand.io",
    product: "Mentoria 1:1 Estratégica",
    paymentMethod: "Pix",
    grossValue: 497.00,
    fee: 0.00,
    netValue: 497.00,
    status: "Pago no Pix",
  },
  {
    id: "ord-5",
    orderNumber: "#TRX-9478",
    date: "23/10/2026 19:22",
    customerName: "Camila Guimarães",
    customerEmail: "camila.creator@gmail.com",
    product: "Manual Prático de Monetização",
    paymentMethod: "Pix",
    grossValue: 39.00,
    fee: 0.00,
    netValue: 39.00,
    status: "Pago no Pix",
  },
  {
    id: "ord-6",
    orderNumber: "#TRX-9477",
    date: "22/10/2026 11:10",
    customerName: "Gabriel Siqueira",
    customerEmail: "gabriel.siqueira@gmail.com",
    product: "Comunidade VIP no Telegram",
    paymentMethod: "Cartão 12x",
    grossValue: 120.00,
    fee: 0.00,
    netValue: 120.00,
    status: "Aprovado no Cartão",
  },
  {
    id: "ord-7",
    orderNumber: "#TRX-9476",
    date: "21/10/2026 09:44",
    customerName: "Juliana Barreto",
    customerEmail: "juliana.barreto@design.br",
    product: "Guia TikTok & Reels 2026",
    paymentMethod: "Pix",
    grossValue: 47.00,
    fee: 0.00,
    netValue: 47.00,
    status: "Pago no Pix",
  },
  {
    id: "ord-8",
    orderNumber: "#TRX-9475",
    date: "20/10/2026 17:30",
    customerName: "Felipe Andrade",
    customerEmail: "felipe.andrade@agencia.com.br",
    product: "Mentoria 1:1 Estratégica",
    paymentMethod: "Pix",
    grossValue: 497.00,
    fee: 0.00,
    netValue: 497.00,
    status: "Pago no Pix",
  },
];

const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(ord => {
      const matchSearch =
        ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        ord.product.toLowerCase().includes(search.toLowerCase());

      const matchMethod =
        methodFilter === "all" ||
        (methodFilter === "pix" && ord.paymentMethod === "Pix") ||
        (methodFilter === "card" && ord.paymentMethod.startsWith("Cartão"));

      return matchSearch && matchMethod;
    });
  }, [search, methodFilter]);

  const handleTransfer = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3500);
  };

  const columns: DataColumn<OrderRecord>[] = [
    {
      key: "orderNumber",
      label: "Identificador",
      render: (val) => (
        <span style={{ fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>
          {String(val)}
        </span>
      ),
    },
    {
      key: "date",
      label: "Data & Hora",
    },
    {
      key: "customerName",
      label: "Cliente",
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontWeight: 500, fontSize: "13.5px" }}>{row.customerName}</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{row.customerEmail}</span>
        </div>
      ),
    },
    {
      key: "product",
      label: "Infoproduto",
    },
    {
      key: "paymentMethod",
      label: "Pagamento",
      render: (val) => (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          color: val === "Pix" ? "var(--success)" : "var(--text-secondary)",
          fontWeight: 500,
        }}>
          {val === "Pix" && <QrCode size={13} />}
          {String(val)}
        </span>
      ),
    },
    {
      key: "grossValue",
      label: "Valor Total",
      numeric: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
          {currencyFormat.format(Number(val))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge tone="success" size="sm">
          {String(val)}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Vendas & Histórico de Pedidos</h2>
          <p>Relatório completo de transações em tempo real com liquidação instantânea.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" size="md">
            <Download size={15} />
            <span>Exportar Relatório</span>
          </Button>
          <Button variant="primary" size="md" onClick={handleTransfer}>
            <ArrowUpRight size={15} />
            <span>Transferir Saldo Pix</span>
          </Button>
        </div>
      </header>

      {payoutSuccess && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderRadius: "10px",
          backgroundColor: "color-mix(in oklab, var(--success) 12%, var(--surface))",
          border: "1px solid color-mix(in oklab, var(--success) 35%, transparent)",
          color: "var(--foreground)",
          fontSize: "13.5px",
        }}>
          <CheckCircle2 size={16} color="var(--success)" />
          <span>Transferência Pix de <strong>R$ 4.280,00</strong> enviada com sucesso para sua conta Nubank!</span>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Saldo Disponível para Saque</span>
          <span className={styles.statValue}>R$ 4.280,00</span>
          <span className={styles.statHint}>Liquidação imediata via Pix</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Faturamento Total Acumulado</span>
          <span className={styles.statValue}>R$ 14.850,00</span>
          <span className={styles.statHint}>+28.4% vs mês anterior</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de Vendas Aprovadas</span>
          <span className={styles.statValue}>218 pedidos</span>
          <span className={styles.statHint}>99.2% aprovação no Pix</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Economia com Taxas (0%)</span>
          <span className={styles.statValue}>R$ 1.485,00</span>
          <span className={styles.statHint}>Benefício exclusivo Plano Pro</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchInput}>
            <Input
              label="Buscar transações"
              placeholder="ID (#TRX), cliente ou produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <SegmentedControl
            options={[
              { value: "all", label: "Todas as Formas" },
              { value: "pix", label: "Apenas Pix" },
              { value: "card", label: "Apenas Cartão" },
            ]}
            value={methodFilter}
            onValueChange={setMethodFilter}
          />
        </div>

        <SortableDataTable
          rows={filteredOrders}
          rowKey="id"
          caption="Histórico de Vendas e Pagamentos"
          columns={columns}
          defaultSort={{ key: "date", direction: "desc" }}
          itemName={{ one: "transação", other: "transações" }}
          emptyMessage="Nenhuma venda encontrada com os filtros selecionados."
        />
      </div>
    </div>
  );
}

export default OrdersView;
