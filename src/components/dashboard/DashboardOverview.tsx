import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/arc/button/button'
import styles from './DashboardOverview.module.css'

export function DashboardOverview() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.subTitle}>Painel Administrativo do Criador</span>
          <h1 className={styles.title}>Visão Geral & Métricas</h1>
        </div>
        <Link to="/mobile">
          <Button variant="secondary" size="md">
            <Smartphone size={16} />
            <span>Ver Loja Mobile</span>
          </Button>
        </Link>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Faturamento Total</span>
            <div className={styles.kpiIcon}><DollarSign size={18} color="#16a34a" /></div>
          </div>
          <div className={styles.kpiValue}>$8,420.00</div>
          <span className={styles.kpiTrend}><TrendingUp size={14} /> +24% este mês</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Vendas Rápidas (PDFs)</span>
            <div className={styles.kpiIcon}><ShoppingCart size={18} color="#2563eb" /></div>
          </div>
          <div className={styles.kpiValue}>142 vendas</div>
          <span className={styles.kpiTrend}>Download My Guide ($25)</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Consultorias Agendadas</span>
            <div className={styles.kpiIcon}><Calendar size={18} color="#9333ea" /></div>
          </div>
          <div className={styles.kpiValue}>18 sessões</div>
          <span className={styles.kpiTrend}>1:1 Coaching ($49)</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Leads Capturados</span>
            <div className={styles.kpiIcon}><Users size={18} color="#ea580c" /></div>
          </div>
          <div className={styles.kpiValue}>840 contatos</div>
          <span className={styles.kpiTrend}>Template Notion Grátis</span>
        </div>
      </div>

      <div className={styles.placeholderBanner}>
        <h3>Próxima Etapa: Construção do Dashboard Completo</h3>
        <p>A visão mobile do comprador (Linktree + Stan Store) já está 100% pronta com compras rápidas e agendamento! Na sequência, vamos estruturar a Sidebar expansível, gráficos de faturamento com UIArc e gestão de produtos.</p>
        <Link to="/mobile">
          <Button variant="primary">Explorar Tela Mobile do Comprador</Button>
        </Link>
      </div>
    </div>
  )
}
