import { useState, useMemo } from "react";
import { SortableDataTable, type DataColumn } from "@/components/arc/sortable-data-table/sortable-data-table";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Badge, type BadgeTone } from "@/components/arc/badge/badge";
import { Input } from "@/components/arc/input/input";
import { Button } from "@/components/arc/button/button";
import { Download } from "lucide-react";
import styles from "./ClientsView.module.css";

interface ClientRecord extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  product: string;
  productTone: BadgeTone;
  totalSpent: number;
  paymentMethod: "Pix" | "Cartão 12x" | "Cartão à vista";
  date: string;
  status: "Concluído" | "Agendado" | "Acesso Enviado";
  statusTone: BadgeTone;
}

const mockClients: ClientRecord[] = [
  {
    id: "cli-1",
    name: "Beatriz Nogueira",
    email: "beatriz.nogueira@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    product: "Mentoria 1:1 Estratégica",
    productTone: "info",
    totalSpent: 497,
    paymentMethod: "Pix",
    date: "25/10/2026",
    status: "Agendado",
    statusTone: "info",
  },
  {
    id: "cli-2",
    name: "Lucas Mendonça",
    email: "lucas.mendonca@yahoo.com.br",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    product: "Guia TikTok & Reels 2026",
    productTone: "neutral",
    totalSpent: 47,
    paymentMethod: "Pix",
    date: "25/10/2026",
    status: "Concluído",
    statusTone: "success",
  },
  {
    id: "cli-3",
    name: "Mariana Alencar",
    email: "mariana.alencar@outlook.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    product: "Pack 50+ Notion Templates",
    productTone: "neutral",
    totalSpent: 67,
    paymentMethod: "Cartão à vista",
    date: "24/10/2026",
    status: "Acesso Enviado",
    statusTone: "success",
  },
  {
    id: "cli-4",
    name: "Rodrigo Fontes",
    email: "rodrigo.fontes@techbrand.io",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    product: "Mentoria 1:1 Estratégica",
    productTone: "info",
    totalSpent: 497,
    paymentMethod: "Pix",
    date: "24/10/2026",
    status: "Agendado",
    statusTone: "info",
  },
  {
    id: "cli-5",
    name: "Camila Guimarães",
    email: "camila.creator@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    product: "Manual Prático de Monetização",
    productTone: "neutral",
    totalSpent: 39,
    paymentMethod: "Pix",
    date: "23/10/2026",
    status: "Concluído",
    statusTone: "success",
  },
  {
    id: "cli-6",
    name: "Gabriel Siqueira",
    email: "gabriel.siqueira@gmail.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    product: "Comunidade VIP no Telegram",
    productTone: "warning",
    totalSpent: 120,
    paymentMethod: "Cartão 12x",
    date: "22/10/2026",
    status: "Acesso Enviado",
    statusTone: "success",
  },
  {
    id: "cli-7",
    name: "Juliana Barreto",
    email: "juliana.barreto@design.br",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    product: "Guia TikTok & Reels 2026",
    productTone: "neutral",
    totalSpent: 47,
    paymentMethod: "Pix",
    date: "21/10/2026",
    status: "Concluído",
    statusTone: "success",
  },
  {
    id: "cli-8",
    name: "Felipe Andrade",
    email: "felipe.andrade@agencia.com.br",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    product: "Mentoria 1:1 Estratégica",
    productTone: "info",
    totalSpent: 497,
    paymentMethod: "Pix",
    date: "20/10/2026",
    status: "Concluído",
    statusTone: "success",
  },
];

const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ClientsView() {
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return mockClients;
    const q = search.toLowerCase();
    return mockClients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.product.toLowerCase().includes(q)
    );
  }, [search]);

  const columns: DataColumn<ClientRecord>[] = [
    {
      key: "name",
      label: "Cliente Comprador",
      render: (_, row) => (
        <div className={styles.clientCell}>
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <div className={styles.clientInfo}>
            <span className={styles.clientName}>{row.name}</span>
            <span className={styles.clientEmail}>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Infoproduto",
      render: (_, row) => (
        <Badge tone={row.productTone} size="sm">
          {row.product}
        </Badge>
      ),
    },
    {
      key: "totalSpent",
      label: "Valor Investido",
      numeric: true,
      render: (val) => (
        <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          {currencyFormat.format(Number(val))}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Método",
      render: (val) => (
        <span style={{ color: val === "Pix" ? "var(--success)" : "var(--text-secondary)", fontWeight: 500 }}>
          {String(val)}
        </span>
      ),
    },
    {
      key: "date",
      label: "Data da Compra",
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <Badge tone={row.statusTone} size="sm">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Base de Clientes</h2>
          <p>Acompanhe todos os compradores dos seus infoprodutos e mentorias 1:1.</p>
        </div>
        <Button variant="secondary" size="md">
          <Download size={15} />
          <span>Exportar CSV</span>
        </Button>
      </header>

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de Clientes</span>
          <span className={styles.statValue}>184 compradores</span>
          <span className={styles.statHint}>+18 novos esta semana</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>LTV Médio (Valor por Cliente)</span>
          <span className={styles.statValue}>R$ 138,40</span>
          <span className={styles.statHint}>Taxa de recompra: 22.4%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Mentorados Ativos</span>
          <span className={styles.statValue}>14 mentorias</span>
          <span className={styles.statHint}>100% sessões realizadas</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.searchToolbar}>
          <div className={styles.searchInput}>
            <Input
              label="Buscar clientes"
              placeholder="Nome, e-mail ou produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <SortableDataTable
          rows={filteredClients}
          rowKey="id"
          caption="Tabela de Clientes Compradores"
          columns={columns}
          defaultSort={{ key: "date", direction: "desc" }}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          itemName={{ one: "cliente", other: "clientes" }}
          emptyMessage="Nenhum cliente encontrado com estes critérios."
        />
      </div>
    </div>
  );
}

export default ClientsView;
