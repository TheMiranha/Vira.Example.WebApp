import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Star,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/arc/button/button'
import { Badge } from '@/components/arc/badge/badge'
import { BottomSheet } from '@/components/arc/bottom-sheet/bottom-sheet'
import { AvailabilityPicker } from '@/components/arc/blocks/availability-picker/availability-picker'
import { CheckoutLive } from '@/components/arc/blocks/checkout-live/checkout-live'
import styles from './MobileStore.module.css'

// ==========================================
// ÍCONES COM CORES ORIGINAIS DAS MARCAS
// ==========================================

const YoutubeBrandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-label="YouTube">
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill="#FF0000"
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
  </svg>
)

const TiktokBrandIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" aria-label="TikTok">
    <path
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.045.874.133V9.41a6.34 6.34 0 0 0-.874-.06A6.33 6.33 0 0 0 3.12 15.68a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.86-4.49V8.76a8.28 8.28 0 0 0 4.84 1.57v-3.46a4.85 4.85 0 0 1-1.05-.18z"
      fill="#000000"
    />
  </svg>
)

const TwitterXBrandIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-label="Twitter X">
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="#000000"
    />
  </svg>
)

const LinkedinBrandIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" aria-label="LinkedIn">
    <path
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
      fill="#0A66C2"
    />
  </svg>
)

const InstagramBrandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-label="Instagram">
    <defs>
      <radialGradient id="instaGrad" cx="0.2" cy="1" r="1">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#instaGrad)" />
    <path
      d="M12 7.03a4.97 4.97 0 1 0 0 9.94 4.97 4.97 0 0 0 0-9.94zm0 8.21a3.24 3.24 0 1 1 0-6.48 3.24 3.24 0 0 1 0 6.48zm6.41-8.45a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0zm-2.07-2.79H7.66c-2.01 0-3.66 1.65-3.66 3.66v8.68c0 2.01 1.65 3.66 3.66 3.66h8.68c2.01 0 3.66-1.65 3.66-3.66V7.66c0-2.01-1.65-3.66-3.66-3.66zm2.19 12.34c0 1.2-.99 2.19-2.19 2.19H7.66c-1.2 0-2.19-.99-2.19-2.19V7.66c0-1.2.99-2.19 2.19-2.19h8.68c1.2 0 2.19.99 2.19 2.19v8.68z"
      fill="#FFFFFF"
    />
  </svg>
)

// Ícone Oficial do Google Calendar
const GoogleCalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <path d="M3 8.5H21V6.5C21 5.12 19.88 4 18.5 4H5.5C4.12 4 3 5.12 3 6.5V8.5Z" fill="#1A73E8" />
    <path d="M7.5 2V5M16.5 2V5" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
    <text x="12" y="17.2" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8.5" fontWeight="800" fill="#1A73E8" textAnchor="middle">
      31
    </text>
    <rect x="18" y="18" width="3" height="3" rx="1" fill="#34A853" />
    <rect x="3" y="18" width="3" height="3" rx="1" fill="#EA4335" />
    <rect x="18" y="14" width="3" height="3" rx="1" fill="#FBBC04" />
  </svg>
)

// Ícone Oficial do Livro/Guia Digital
const RedBookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 0-2.5 1.5z" fill="#DC2626" />
    <path d="M6.5 2H20v3H6.5a2.5 2.5 0 0 0-2.5 1.5V5A2.5 2.5 0 0 1 6.5 2z" fill="#B91C1C" />
    <rect x="5" y="18" width="15" height="3" rx="1" fill="#FEF2F2" stroke="#DC2626" strokeWidth="0.8" />
    <path d="M12 2v8l3-2 3 2V2z" fill="#FEF08A" />
  </svg>
)

export function MobileStore() {
  const [activeSheet, setActiveSheet] = useState<'course' | 'booking' | 'guide' | null>(null)
  
  // Mentoria 1:1 Step flow
  const [bookingStep, setBookingStep] = useState<'calendar' | 'checkout'>('calendar')
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)

  // Acionamento de download real do arquivo simulado
  const handleDownloadPDF = () => {
    const content = 'Guia de Monetização e Audiência Digital 2026 - Alexandra Silva\n\nObrigado por sua compra! Seu acesso vitalício está liberado.'
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Guia-de-Monetizacao-AlexandraSilva.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetCheckout = () => {
    setBookingStep('calendar')
    setSelectedSlot(null)
  }

  return (
    <div className={styles.page}>
      <main className={styles.container}>

        {/* 1. Header do Perfil Otimizado com Foto e Redes Sociais */}
        <header className={styles.profileSection}>
          <div className={styles.coverMedia}>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=85" 
              alt="Alexandra Silva" 
              className={styles.coverImage}
            />
          </div>

          <div className={styles.profileMeta}>
            <h1 className={styles.creatorTitle}>Alexandra Silva</h1>
            <p className={styles.creatorBio}>
              Estrategista de negócios digitais & mentora. Produtos e mentorias para acelerar sua monetização online.
            </p>

            {/* Redes sociais com cores oficiais e área de toque expandida para 44px */}
            <nav className={styles.socialNav} aria-label="Canais e redes sociais">
              <a href="#youtube" className={styles.socialBtn} aria-label="Canal no YouTube">
                <YoutubeBrandIcon />
              </a>
              <a href="#tiktok" className={styles.socialBtn} aria-label="Perfil no TikTok">
                <TiktokBrandIcon />
              </a>
              <a href="#twitter" className={styles.socialBtn} aria-label="Conta no Twitter X">
                <TwitterXBrandIcon />
              </a>
              <a href="#linkedin" className={styles.socialBtn} aria-label="Conexão no LinkedIn">
                <LinkedinBrandIcon />
              </a>
              <a href="#instagram" className={styles.socialBtn} aria-label="Perfil no Instagram">
                <InstagramBrandIcon />
              </a>
            </nav>
          </div>
        </header>

        {/* 2. Produto em Destaque Principal (Visível Imediatamente Acima da Dobra) */}
        <section className={styles.featuredSection} aria-label="Produto principal">
          <article className={styles.featuredCard}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Curso Criador Digital</h2>
              <p className={styles.cardSubtitle}>
                Tudo o que você precisa saber para criar, validar e faturar com produtos digitais na internet.
              </p>
            </header>

            <div className={styles.priceRow}>
              <div className={styles.priceValue}>
                <div className={styles.priceNumbers}>
                  <span className={styles.currentPrice}>R$ 129</span>
                  <span className={styles.originalPrice}>
                    <span className={styles.srOnly}>Preço anterior: </span>
                    <del>R$ 249</del>
                  </span>
                </div>
                <span className={styles.installmentsLabel}>ou 12x de R$ 12,85</span>
              </div>
              <div className={styles.badgesWrap}>
                <span className={styles.ratingBadge} aria-label="Avaliação 4.7 de 5 estrelas">
                  <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" /> 4.7
                </span>
                <Badge tone="danger" size="sm">50% de desconto</Badge>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className={styles.fullWidthAction}
              onClick={() => {
                resetCheckout()
                setActiveSheet('course')
              }}
            >
              <span>Começar agora</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </article>
        </section>

        {/* 3. Compras Rápidas (com ícones coloridos: Google Calendar e Livro Vermelho) */}
        <section className={styles.quickSection} aria-label="Acesso rápido a serviços e materiais">
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>Acesso rápido</span>
          </div>

          <div className={styles.itemsGroup}>
            {/* Item 1: Mentoria 1:1 com Ícone Oficial do Google Calendar */}
            <motion.button 
              type="button" 
              className={styles.quickCard}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                resetCheckout()
                setActiveSheet('booking')
              }}
            >
              <div className={styles.cardIconWrap}>
                <GoogleCalendarIcon />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardItemTitle}>Sessão de Mentoria 1:1</span>
                <p className={styles.cardItemDesc}>Plano estratégico individual com Alexandra (45 min)</p>
              </div>
              <div className={styles.cardPricing}>
                <span className={styles.cardPrice}>R$ 49</span>
                <span className={styles.cardActionTag}>Agendar</span>
              </div>
            </motion.button>

            {/* Item 2: Download do Guia com Ícone do Livro Vermelho */}
            <motion.button 
              type="button" 
              className={styles.quickCard}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                resetCheckout()
                setActiveSheet('guide')
              }}
            >
              <div className={styles.cardIconWrap}>
                <RedBookIcon />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardItemTitle}>Download do Meu Guia</span>
                <p className={styles.cardItemDesc}>PDF de 48 páginas: Monetização e audiência digital</p>
              </div>
              <div className={styles.cardPricing}>
                <span className={styles.cardPrice}>R$ 25</span>
                <span className={styles.cardActionTag}>Comprar</span>
              </div>
            </motion.button>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 1: AGENDAMENTO 1:1 EM 2 ETAPAS (UIArc AvailabilityPicker)   */}
      {/* ========================================================================= */}
      <BottomSheet
        open={activeSheet === 'booking'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheet(null)
            resetCheckout()
          }
        }}
        title="Agendar Sessão 1:1"
        description="Mentoria individual estratégica com Alexandra Silva"
        hideTitle={bookingStep === 'checkout'}
        detents={[0.92]}
      >
        <div className={styles.sheetLayout}>
          <div className={styles.sessionHeader}>
            <div>
              <span className={styles.sessionLabel}>Investimento</span>
              <strong className={styles.sessionPrice}>R$ 49</strong>
            </div>
            <div className={styles.sessionPills}>
              <span className={styles.pillItem}><Clock size={12} aria-hidden="true" /> 45 min</span>
              <span className={styles.pillItem}>Google Meet</span>
            </div>
          </div>

          {bookingStep === 'calendar' ? (
            /* Etapa 1: Escolha do Horário */
            <AvailabilityPicker 
              title="Escolha seu horário"
              duration="45 minutos · Horário de Brasília"
              onConfirm={(selection) => {
                setSelectedSlot(selection)
                setBookingStep('checkout')
              }}
            />
          ) : (
            /* Etapa 2: Checkout Live Integrado (Apple Pay, Google Pay, Pix, Cartão) */
            <CheckoutLive
              defaultPlan="mentorship"
              customItemTitle={`Sessão 1:1 (${selectedSlot?.date || 'Dia Selecionado'} às ${selectedSlot?.time || '10:00'})`}
            />
          )}
        </div>
      </BottomSheet>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 2: CHECKOUT DO GUIA EM PDF (UIArc CheckoutLive Block)        */}
      {/* ========================================================================= */}
      <BottomSheet
        open={activeSheet === 'guide'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheet(null)
            resetCheckout()
          }
        }}
        title="Download do Meu Guia"
        description="Acesso imediato ao material completo em PDF"
        hideTitle
        detents={[0.92]}
      >
        <div className={styles.sheetLayout}>
          <CheckoutLive 
            defaultPlan="guide"
            customItemTitle="Download do Meu Guia (PDF 48 páginas)"
            onDownloadReceipt={handleDownloadPDF}
          />
        </div>
      </BottomSheet>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 3: CHECKOUT DO CURSO PRINCIPAL (UIArc CheckoutLive Block)     */}
      {/* ========================================================================= */}
      <BottomSheet
        open={activeSheet === 'course'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheet(null)
            resetCheckout()
          }
        }}
        title="Curso Criador Digital"
        description="Formação completa em infoprodutos e audiência"
        hideTitle
        detents={[0.94]}
      >
        <div className={styles.sheetLayout}>
          <CheckoutLive 
            defaultPlan="course"
            customItemTitle="Curso Criador Digital (Acesso Vitalício)"
          />
        </div>
      </BottomSheet>

    </div>
  )
}
