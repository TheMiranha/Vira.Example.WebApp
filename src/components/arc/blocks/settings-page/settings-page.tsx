"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Bell, CreditCard, Laptop, QrCode, ShieldCheck, Smartphone, Tablet, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "../../animated-counter/animated-counter";
import { Avatar } from "../../avatar/avatar";
import { Button } from "../../button/button";
import { Input } from "../../input/input";
import SegmentedControl from "../../segmented-control/segmented-control";
import { Select } from "../../select/select";
import { Switch } from "../../switch/switch";
import { TextMorph } from "../../text-morph/text-morph";
import { motionTokens } from "../../lib/motion-tokens";
import styles from "./settings-page.module.css";

export type SettingsSectionId = "profile" | "financial" | "notifications" | "security" | "plan";

export type SettingsData = {
  photo: string | null;
  name: string;
  title: string;
  email: string;
  phone: string;
  pixType: string;
  pixKey: string;
  bank: string;
  autoPayout: boolean;
  notifySaleWhatsapp: boolean;
  notifySaleEmail: boolean;
  notifyBooking: boolean;
  dailyDigest: boolean;
  twoStep: boolean;
  signedOut: string[];
  billingCycle: string;
};

type Key = keyof SettingsData;
type Shift = { direction: number; axis: "x" | "y"; reduce: boolean };

const sections: { id: SettingsSectionId; label: string; description: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Perfil da Criadora", description: "Como sua marca e bio aparecem na sua loja mobile e checkout.", icon: UserRound },
  { id: "financial", label: "Recebimento Pix", description: "Chave Pix para repasse automático das vendas e dados bancários.", icon: QrCode },
  { id: "notifications", label: "Notificações", description: "Alertas de vendas no WhatsApp, e-mail e lembretes de mentorias.", icon: Bell },
  { id: "security", label: "Segurança", description: "Proteção da sua conta e dispositivos conectados.", icon: ShieldCheck },
  { id: "plan", label: "Plano & Taxas", description: "Seu plano Pro Creator, benefícios de taxa 0% e faturas.", icon: CreditCard },
];

const initialData: SettingsData = {
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  name: "Alexandra Silva",
  title: "Mentora de Criadores & Estrategista de Conteúdo",
  email: "alexandra.silva@vira.app",
  phone: "+55 (11) 98765-4321",
  pixType: "email",
  pixKey: "alexandra.silva.pix@nubank.com.br",
  bank: "Nubank (260) · Agência 0001 · C/C 482910-3",
  autoPayout: true,
  notifySaleWhatsapp: true,
  notifySaleEmail: true,
  notifyBooking: true,
  dailyDigest: true,
  twoStep: true,
  signedOut: [],
  billingCycle: "monthly",
};


const pixTypeOptions = [
  { value: "email", label: "E-mail" },
  { value: "cpf", label: "CPF / CNPJ" },
  { value: "phone", label: "Telefone Celular" },
  { value: "random", label: "Chave Aleatória (EVP)" },
];

const sessions = [
  { id: "mac", device: "MacBook Pro 14\"", app: "Chrome · São Paulo, Brasil", seen: "Ativo agora", icon: Laptop, current: true },
  { id: "iphone", device: "iPhone 15 Pro", app: "Vira Mobile Store · São Paulo, Brasil", seen: "Há 40 minutos", icon: Smartphone },
  { id: "ipad", device: "iPad Pro", app: "Safari · São Paulo, Brasil", seen: "Ontem às 21:14", icon: Tablet },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validate(values: SettingsData) {
  const errors: Partial<Record<Key, string>> = {};
  if (!values.name.trim()) errors.name = "Informe seu nome completo";
  if (!emailPattern.test(values.email.trim())) errors.email = "Informe um e-mail válido";
  if (!values.pixKey.trim()) errors.pixKey = "Informe sua chave Pix para receber";
  return errors;
}

const blur = (px: number) => `blur(${px}px)`;
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const standardEase = [...motionTokens.ease.standard] as [number, number, number, number];

const pane: Variants = {
  enter: ({ direction, axis, reduce }: Shift) => reduce ? { opacity: 0 } : { opacity: 0, ...(axis === "x" ? { x: direction * 16 } : { y: direction * 14 }), filter: blur(motionTokens.blur.subtle) },
  center: ({ reduce }: Shift) => ({ opacity: 1, x: 0, y: 0, filter: blur(0), transition: reduce ? { duration: motionTokens.duration.instant } : { x: motionTokens.spring.smooth, y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enterEase }, filter: { duration: motionTokens.duration.standard, ease: enterEase } } }),
  exit: ({ direction, axis, reduce }: Shift) => reduce ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, ...(axis === "x" ? { x: direction * -10 } : { y: direction * -8 }), filter: blur(motionTokens.blur.subtle), transition: { duration: motionTokens.duration.fast, ease: standardEase } },
};

function Group({ id, title, children, footer }: { id: string; title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className={styles.group} aria-labelledby={id}>
      <h4 id={id}>{title}</h4>
      <div className={styles.rows}>{children}</div>
      {footer}
    </section>
  );
}

function ToggleRow({ id, label, description, checked, onChange, children }: { id: string; label: string; description: string; checked: boolean; onChange: (value: boolean) => void; children?: ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <label htmlFor={id}>{label}</label>
        <p id={`${id}-hint`}>{description}</p>
        {children}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-hint`} />
    </div>
  );
}

function SaveBar({ state, count, onDiscard, onSave, barRef }: { state: "edit" | "saving" | "saved"; count: number; onDiscard: () => void; onSave: () => void; barRef: RefObject<HTMLDivElement | null> }) {
  const reduce = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const width = useMotionValue(60);
  const height = useMotionValue(52);

  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    const measure = () => {
      const next = { width: node.offsetWidth + 2, height: node.offsetHeight + 2 };
      if (reduce) { width.jump(next.width); height.jump(next.height); return; }
      animate(width, next.width, motionTokens.spring.morph);
      animate(height, next.height, motionTokens.spring.morph);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, reduce, width]);

  const phase = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : { initial: { opacity: 0, scale: .96, filter: blur(motionTokens.blur.soft) }, animate: { opacity: 1, scale: 1, filter: blur(0) }, exit: { opacity: 0, scale: .96, filter: blur(motionTokens.blur.soft) } };
  const phaseTransition = { duration: reduce ? motionTokens.duration.instant : motionTokens.duration.standard, ease: enterEase };

  return (
    <motion.div
      ref={barRef}
      className={styles.bar}
      role="group"
      aria-label={state === "saved" ? "Status da gravação" : "Alterações não salvas"}
      style={{ width, height }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: blur(motionTokens.blur.soft) }}
      animate={{ opacity: 1, y: 0, filter: blur(0) }}
      exit={reduce ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, y: 20, width: 60, height: 52, filter: blur(motionTokens.blur.soft), transition: { width: motionTokens.spring.smooth, height: motionTokens.spring.smooth, y: { ...motionTokens.spring.smooth, delay: .06 }, opacity: { duration: motionTokens.duration.exit, delay: .1 }, filter: { duration: motionTokens.duration.exit, delay: .1 } } }}
      transition={reduce ? { duration: motionTokens.duration.instant } : { y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.standard } }}
    >
      <div ref={content} className={styles.barContent}>
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "saved" ? (
            <motion.div key="saved" className={styles.barSaved} {...phase} transition={phaseTransition}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <motion.path d="M5 12.5 9.5 17 19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : .34, delay: reduce ? 0 : .08, ease: enterEase }} />
              </svg>
              <span>Alterações salvas com sucesso</span>
            </motion.div>
          ) : (
            <motion.div key="edit" className={styles.barEdit} {...phase} transition={phaseTransition}>
              <span className={styles.barCount}>
                <span className={styles.inherit}><AnimatedCounter value={count} /></span>
                <span className={styles.unsaved}>&nbsp;item</span>&nbsp;<TextMorph>{count === 1 ? "não salvo" : "não salvos"}</TextMorph>
              </span>
              <Button type="button" variant="ghost" size="sm" disabled={state === "saving"} onClick={onDiscard}>Descartar</Button>
              <Button type="button" size="sm" loading={state === "saving"} onClick={onSave}>
                {state === "saving" ? "Salvando..." : <span>Salvar<span className={styles.long}>&nbsp;alterações</span></span>}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function SettingsPage() {
  const id = useId();
  const reduce = useReducedMotion();
  const [section, setSection] = useState<SettingsSectionId>("profile");
  const [shift, setShift] = useState<Omit<Shift, "reduce">>({ direction: 1, axis: "y" });
  const [baseline, setBaseline] = useState(initialData);
  const [draft, setDraft] = useState(initialData);
  const [phase, setPhase] = useState<"idle" | "saving" | "saved">("idle");
  const bar = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const changed = (Object.keys(baseline) as Key[]).filter(key => key !== "signedOut" && baseline[key] !== draft[key]);
  const sessionChanges = draft.signedOut.filter(item => !baseline.signedOut.includes(item)).length;
  const count = changed.length + sessionChanges;
  const errors = validate(draft);
  const barState = phase === "saving" ? "saving" : count ? "edit" : phase === "saved" ? "saved" : null;
  const current = sections.find(item => item.id === section) ?? sections[0];
  const custom: Shift = { ...shift, reduce: !!reduce };

  function switchSection(target: SettingsSectionId) {
    const curIdx = sections.findIndex(s => s.id === section);
    const targetIdx = sections.findIndex(s => s.id === target);
    setShift({ direction: targetIdx > curIdx ? 1 : -1, axis: "y" });
    setSection(target);
  }

  function handleDiscard() {
    setDraft(baseline);
  }

  function handleSave() {
    if (Object.keys(errors).length > 0) return;
    setPhase("saving");
    setTimeout(() => {
      setBaseline(draft);
      setPhase("saved");
      setTimeout(() => setPhase("idle"), 2400);
    }, 600);
  }

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDraft(prev => ({ ...prev, photo: url }));
  }

  return (
    <div className={styles.root}>
      <div className={styles.settings}>
        <aside className={styles.sidebar} aria-label="Navegação de configurações">
          <div className={styles.sidebarHead}>
            <h2>Configurações</h2>
            <div className={styles.headAvatar}>
              <Avatar name={draft.name} src={draft.photo ?? undefined} size="sm" />
            </div>
          </div>
          <ul className={styles.navList} role="list">
            {sections.map(s => {
              const Icon = s.icon;
              const isActive = section === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={styles.navItem}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => switchSection(s.id)}
                  >
                    {isActive && <motion.span layoutId={`${id}-settings-highlight`} className={styles.highlight} transition={reduce ? { duration: 0 } : motionTokens.spring.morph} />}
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                    <span className={styles.navLabel}>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.account}>
            <Avatar name={draft.name} src={draft.photo ?? undefined} size="sm" status="online" />
            <span>
              <strong>{draft.name}</strong>
              <small>{draft.email}</small>
            </span>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.scroller}>
            <div className={styles.pane}>
              <header className={styles.paneHead}>
                <h3>{current.label}</h3>
                <p>{current.description}</p>
              </header>

              <AnimatePresence mode="popLayout" initial={false} custom={custom}>
                <motion.div key={section} custom={custom} variants={pane} initial="enter" animate="center" exit="exit">
                  {section === "profile" && (
                    <div>
                      <div className={styles.identity}>
                        <div className={styles.photo}>
                          <div className={styles.photoFrame}>
                            <Avatar name={draft.name} src={draft.photo ?? undefined} size="lg" />
                          </div>
                        </div>
                        <div className={styles.identityText}>
                          <strong>{draft.name}</strong>
                          <span>{draft.title}</span>
                          <div className={styles.photoActions}>
                            <input ref={fileInput} type="file" accept="image/*" className={styles.srOnly} onChange={handlePhotoUpload} />
                            <Button type="button" variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>Alterar Foto</Button>
                            {draft.photo && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(prev => ({ ...prev, photo: null }))}>Remover</Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.fields}>
                        <Input
                          label="Nome Completo"
                          value={draft.name}
                          error={errors.name}
                          onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          label="E-mail Comercial"
                          type="email"
                          value={draft.email}
                          error={errors.email}
                          onChange={(e) => setDraft(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <Input
                          label="Título / Especialidade"
                          value={draft.title}
                          onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Input
                          label="WhatsApp Comercial"
                          value={draft.phone}
                          onChange={(e) => setDraft(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {section === "financial" && (
                    <div>
                      <Group id="pix-config" title="Chave Pix para Recebimento Instantâneo">
                        <div style={{ display: "grid", gap: "16px", marginBottom: "16px" }}>
                          <Select
                            label="Tipo de Chave Pix"
                            options={pixTypeOptions}
                            value={draft.pixType}
                            onValueChange={(val) => setDraft(prev => ({ ...prev, pixType: val }))}
                          />
                          <Input
                            label="Chave Pix Cadastrada"
                            value={draft.pixKey}
                            error={errors.pixKey}
                            description="Os valores de cada venda aprovada são direcionados para esta chave."
                            onChange={(e) => setDraft(prev => ({ ...prev, pixKey: e.target.value }))}
                          />
                          <Input
                            label="Dados da Conta Bancária / Instituição"
                            value={draft.bank}
                            onChange={(e) => setDraft(prev => ({ ...prev, bank: e.target.value }))}
                          />
                        </div>
                        <ToggleRow
                          id="auto-payout"
                          label="Repasse Automático Imediato (Pix D+0)"
                          description="Transfere o saldo líquido das compras diretamente para sua conta em até 2 minutos após a confirmação."
                          checked={draft.autoPayout}
                          onChange={(val) => setDraft(prev => ({ ...prev, autoPayout: val }))}
                        />
                      </Group>
                    </div>
                  )}

                  {section === "notifications" && (
                    <div>
                      <Group id="sales-notifications" title="Canais de Notificação">
                        <ToggleRow
                          id="notif-wa"
                          label="Notificações Instantâneas no WhatsApp"
                          description="Receba um alerta no seu celular toda vez que um cliente pagar um Pix ou Cartão."
                          checked={draft.notifySaleWhatsapp}
                          onChange={(val) => setDraft(prev => ({ ...prev, notifySaleWhatsapp: val }))}
                        />
                        <ToggleRow
                          id="notif-booking"
                          label="Avisos de Novas Mentorias Agendadas"
                          description="Notifica quando um cliente reservar um novo horário na sua agenda com link do Google Meet."
                          checked={draft.notifyBooking}
                          onChange={(val) => setDraft(prev => ({ ...prev, notifyBooking: val }))}
                        />
                        <ToggleRow
                          id="notif-email"
                          label="Comprovante de Venda por E-mail"
                          description="Envia recibo detalhado da transação para o e-mail cadastrado."
                          checked={draft.notifySaleEmail}
                          onChange={(val) => setDraft(prev => ({ ...prev, notifySaleEmail: val }))}
                        />
                        <ToggleRow
                          id="notif-digest"
                          label="Relatório Diário de Faturamento"
                          description="Resumo enviado às 21h com o total faturado no dia e novos clientes."
                          checked={draft.dailyDigest}
                          onChange={(val) => setDraft(prev => ({ ...prev, dailyDigest: val }))}
                        />
                      </Group>
                    </div>
                  )}

                  {section === "security" && (
                    <div>
                      <Group id="sec-config" title="Autenticação e Acesso">
                        <ToggleRow
                          id="sec-2fa"
                          label="Autenticação em Dois Fatores (2FA)"
                          description="Exige confirmação via código SMS ou app autenticador ao entrar de novos navegadores."
                          checked={draft.twoStep}
                          onChange={(val) => setDraft(prev => ({ ...prev, twoStep: val }))}
                        />
                      </Group>

                      <Group id="sec-sessions" title="Dispositivos Ativos">
                        <ul className={styles.sessions} role="list">
                          {sessions.map(sess => {
                            const Icon = sess.icon;
                            const isOut = draft.signedOut.includes(sess.id);
                            if (isOut) return null;
                            return (
                              <li key={sess.id} className={styles.session}>
                                <div className={styles.sessionInner}>
                                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                                  <div className={styles.sessionText}>
                                    <strong>{sess.device}</strong>
                                    <span>{sess.app} · {sess.seen}</span>
                                  </div>
                                  {sess.current ? (
                                    <span className={styles.thisDevice}>Este dispositivo</span>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDraft(prev => ({ ...prev, signedOut: [...prev.signedOut, sess.id] }))}
                                    >
                                      Desconectar
                                    </Button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </Group>
                    </div>
                  )}

                  {section === "plan" && (
                    <div>
                      <div className={styles.plan}>
                        <div className={styles.planText}>
                          <strong>Plano Pro Creator</strong>
                          <span>Taxa de intermediação: <strong>0% por venda</strong></span>
                          <span>Saque Pix instantâneo gratuito e suporte prioritário</span>
                        </div>
                        <div className={styles.price}>
                          <div className={styles.priceValue}>
                            <span>R$ 97,00</span>
                            <span className={styles.priceUnit}> / mês</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.cycle}>
                        <SegmentedControl
                          options={[
                            { value: "monthly", label: "Cobrança Mensal" },
                            { value: "yearly", label: "Anual (20% OFF)" },
                          ]}
                          value={draft.billingCycle}
                          onValueChange={(val) => setDraft(prev => ({ ...prev, billingCycle: val }))}
                        />
                        <span className={styles.cycleNote}>
                          <span>Próxima renovação em 15 de Novembro de 2026</span>
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.dock}>
            <AnimatePresence>
              {barState && (
                <SaveBar
                  barRef={bar}
                  state={barState}
                  count={count}
                  onDiscard={handleDiscard}
                  onSave={handleSave}
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
