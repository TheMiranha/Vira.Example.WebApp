"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useReducedMotion, useTransform, type Transition, type Variants } from "motion/react";
import {
  Calendar,
  ExternalLink,
  House,
  Receipt,
  Settings,
  Smartphone,
  UploadCloud,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Tooltip } from "@/components/arc/tooltip/tooltip";
import { Button } from "@/components/arc/button/button";
import { motionTokens } from "@/components/arc/lib/motion-tokens";

import { OverviewView } from "./views/OverviewView";
import { SettingsPage } from "@/components/arc/blocks/settings-page/settings-page";
import { ClientsView } from "./views/ClientsView";
import { UploadContentView } from "./views/UploadContentView";
import { BookingsView } from "./views/BookingsView";
import { OrdersView } from "./views/OrdersView";

import styles from "@/components/arc/blocks/sidebar-rail/sidebar-rail.module.css";

const FULL = 240;
const RAIL = 64;
const COMPACT = 480;
const FLOAT = 640;
const ROOMY = 1024;
const SETTLE_MS = 200;

export type DashboardTabId =
  | "visao-geral"
  | "clientes"
  | "subir-conteudo"
  | "agenda"
  | "vendas"
  | "conta";

interface NavEntry {
  id: DashboardTabId;
  label: string;
  icon: LucideIcon;
  count?: number;
}

const navSections: { id: string; heading?: string; items: NavEntry[] }[] = [
  {
    id: "main",
    items: [
      { id: "visao-geral", label: "Visão Geral", icon: House },
      { id: "clientes", label: "Clientes", icon: Users, count: 184 },
    ],
  },
  {
    id: "manage",
    heading: "Gestão do Negócio",
    items: [
      { id: "subir-conteudo", label: "Subir Conteúdos", icon: UploadCloud },
      { id: "agenda", label: "Agenda 1:1", icon: Calendar, count: 3 },
      { id: "vendas", label: "Vendas & Compras", icon: Receipt },
    ],
  },
];

const settingsEntry: NavEntry = {
  id: "conta",
  label: "Minha Conta & Pix",
  icon: Settings,
};

const tabTitles: Record<DashboardTabId, { title: string; category?: string }> = {
  "visao-geral": { title: "Visão Geral & Métricas", category: "Painel Principal" },
  "clientes": { title: "Base de Clientes", category: "Compradores" },
  "subir-conteudo": { title: "Subir Conteúdos Digitais", category: "Produtos" },
  "agenda": { title: "Agenda de Mentorias 1:1", category: "Consultorias" },
  "vendas": { title: "Vendas & Histórico Financeiro", category: "Financeiro" },
  "conta": { title: "Configurações da Conta & Pix", category: "Preferências" },
};

const curve = (points: readonly number[]) => [...points] as [number, number, number, number];
const instant: Transition = { duration: 0 };

function labelTiming(collapsed: boolean, reduce: boolean): Transition {
  if (reduce) return instant;
  return collapsed
    ? { duration: 0.14, ease: curve(motionTokens.ease.standard) }
    : { duration: 0.24, delay: 0.1, ease: curve(motionTokens.ease.enter) };
}

function markTiming(collapsed: boolean, reduce: boolean): Transition {
  if (reduce) return instant;
  return collapsed
    ? { duration: 0.2, delay: 0.16, ease: curve(motionTokens.ease.enter) }
    : { duration: 0.1, ease: curve(motionTokens.ease.standard) };
}

const rise: Variants = {
  hidden: { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
  gone: { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.subtle}px)` },
};

function RailTip({ enabled, label, note, children }: { enabled: boolean; label: string; note?: string; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  if (!enabled && open) setOpen(false);
  return (
    <TooltipPrimitive.Root open={enabled && open} onOpenChange={next => setOpen(next && enabled)}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className={styles.tip} side="right" sideOffset={14} collisionPadding={8}>
          {label}
          {note && <span className={styles.tipNote}>{note}</span>}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

function NavRow({
  entry,
  current,
  lit,
  collapsed,
  tips,
  layoutId,
  reduce,
  onClick,
}: {
  entry: NavEntry;
  current: boolean;
  lit: boolean;
  collapsed: boolean;
  tips: boolean;
  layoutId: string;
  reduce: boolean;
  onClick: () => void;
}) {
  const Icon = entry.icon;
  const fade = labelTiming(collapsed, reduce);
  const mark = markTiming(collapsed, reduce);

  return (
    <RailTip enabled={tips} label={entry.label} note={entry.count ? `${entry.count} itens` : undefined}>
      <button
        type="button"
        className={[styles.item, lit ? styles.lit : ""].join(" ")}
        aria-current={current ? "page" : undefined}
        onClick={onClick}
      >
        {lit && (
          <motion.span
            layoutId={layoutId}
            className={styles.highlight}
            style={{ borderRadius: 8 }}
            transition={reduce ? instant : motionTokens.spring.morph}
          />
        )}
        <Icon className={styles.icon} size={18} strokeWidth={1.75} aria-hidden />
        <motion.span
          className={styles.label}
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }}
          transition={fade}
        >
          {entry.label}
        </motion.span>
        {entry.count ? (
          <>
            <motion.span
              className={styles.count}
              aria-hidden
              initial={false}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={fade}
            >
              {entry.count}
            </motion.span>
            <motion.span
              className={styles.dot}
              aria-hidden
              initial={false}
              animate={{ opacity: collapsed ? 1 : 0, scale: collapsed ? 1 : 0.3 }}
              transition={collapsed && !reduce ? { ...motionTokens.spring.snappy, delay: 0.16 } : mark}
            />
          </>
        ) : null}
      </button>
    </RailTip>
  );
}

function Navigation({
  variant,
  baseId,
  collapsed,
  active,
  reduce,
  onSelect,
}: {
  variant: "side" | "sheet";
  baseId: string;
  collapsed: boolean;
  active: DashboardTabId;
  reduce: boolean;
  onSelect: (id: DashboardTabId) => void;
}) {
  const tips = variant === "side" && collapsed;
  const layoutId = `${variant}-active-nav`;
  const fade = labelTiming(collapsed, reduce);
  const height = reduce ? instant : motionTokens.spring.smooth;
  const shared = { collapsed, tips, layoutId, reduce };

  return (
    <motion.nav className={styles.nav} aria-label="Painel de Navegação" layoutScroll>
      {navSections.map(section => {
        const headingId = `${baseId}-${variant}-${section.id}`;
        return (
          <div key={section.id} className={styles.section} role={section.heading ? "group" : undefined} aria-labelledby={section.heading ? headingId : undefined}>
            {section.heading && (
              <motion.div className={styles.heading} initial={false} animate={{ height: collapsed ? 17 : 28 }} transition={height}>
                <motion.span id={headingId} className={styles.headingText} initial={false} animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }} transition={fade}>
                  {section.heading}
                </motion.span>
                <motion.span className={styles.divider} aria-hidden initial={false} animate={{ opacity: collapsed ? 1 : 0, scaleX: collapsed ? 1 : 0.3 }} transition={markTiming(collapsed, reduce)} />
              </motion.div>
            )}
            <ul className={styles.list} role="list">
              {section.items.map(entry => (
                <li key={entry.id}>
                  <NavRow entry={entry} current={active === entry.id} lit={active === entry.id} onClick={() => onSelect(entry.id)} {...shared} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <ul className={`${styles.list} ${styles.footerList}`} role="list">
        <li>
          <NavRow entry={settingsEntry} current={active === "conta"} lit={active === "conta"} onClick={() => onSelect("conta")} {...shared} />
        </li>
      </ul>
    </motion.nav>
  );
}

function Brand({ collapsed, reduce }: { collapsed: boolean; reduce: boolean }) {
  return (
    <div className={styles.brand}>
      <span className={styles.mark} data-logo aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M12 3.5 5.5 19.5 12 15.6z" fill="currentColor" />
          <path d="M12 3.5l6.5 16-6.5-3.9z" fill="currentColor" opacity=".55" />
        </svg>
      </span>
      <motion.span
        className={styles.stack}
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }}
        transition={labelTiming(collapsed, reduce)}
      >
        <strong>Vira Creator</strong>
        <span>Painel do Criador</span>
      </motion.span>
    </div>
  );
}

function Profile({ collapsed, reduce }: { collapsed: boolean; reduce: boolean }) {
  return (
    <div className={styles.profile}>
      <Avatar
        name="Alexandra Silva"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        size="sm"
        status="online"
      />
      <motion.span
        className={styles.stack}
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }}
        transition={labelTiming(collapsed, reduce)}
      >
        <strong>Alexandra Silva</strong>
        <span>Plano Pro · 0% Taxa</span>
      </motion.span>
    </div>
  );
}

function PanelGlyph({ collapsed, reduce }: { collapsed: boolean; reduce: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="3.5" />
      <motion.path d="M8.25 4.25v11.5" initial={false} animate={{ x: collapsed ? -2.5 : 0 }} transition={reduce ? instant : motionTokens.spring.smooth} />
    </svg>
  );
}

export function DashboardPage() {
  const baseId = useId();
  const prefersReduced = !!useReducedMotion();
  const [settling, setSettling] = useState(true);
  const reduce = prefersReduced || settling;
  const [collapsed, setCollapsed] = useState(false);
  const [floating, setFloating] = useState(false);
  const [active, setActive] = useState<DashboardTabId>("visao-geral");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const closeTimer = useRef(0);
  const sidebarId = `${baseId}-sidebar`;

  useEffect(() => {
    if (!frame) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "[" || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented || !frame) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      if (frame.clientWidth < COMPACT) { setSheetOpen(!sheetOpen); return; }
      setCollapsed(!collapsed);
      setStatus(collapsed ? "Sidebar expandida" : "Sidebar recolhida");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frame, collapsed, sheetOpen]);

  const roomy = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (!frame) return;
    const fit = () => {
      const width = frame.clientWidth;
      if (width >= COMPACT) setSheetOpen(false);
      const floats = width >= COMPACT && width < FLOAT;
      setFloating(floats);
      const next = width >= ROOMY;
      if (roomy.current !== next) { roomy.current = next; setCollapsed(!next); }
      else if (floats) setCollapsed(true);
    };
    fit();
    const settle = requestAnimationFrame(() => setSettling(false));
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => { observer.disconnect(); cancelAnimationFrame(settle); };
  }, [frame]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function toggleRail() {
    setCollapsed(!collapsed);
    setStatus(collapsed ? "Sidebar expandida" : "Sidebar recolhida");
  }

  const overlaid = floating && !collapsed;

  function fold() {
    setCollapsed(true);
    setStatus("Sidebar recolhida");
  }

  function handleSelect(id: DashboardTabId, fromSheet = false) {
    if (fromSheet && dragging.current) return;
    setActive(id);
    setStatus(`${tabTitles[id].title} aberto`);
    if (!fromSheet && !overlaid) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => (fromSheet ? setSheetOpen(false) : setCollapsed(true)), reduce ? 0 : SETTLE_MS);
  }

  const sheetX = useMotionValue<number | string>("-100%");
  const scrimOpacity = useTransform(sheetX, value => {
    const width = sheet.current?.offsetWidth || 288;
    const shift = typeof value === "number" ? value / width : value.endsWith("%") ? parseFloat(value) / 100 : parseFloat(value) / width;
    return Math.min(1, Math.max(0, 1 + (Number.isFinite(shift) ? shift : -1)));
  });

  const swap = reduce ? instant : { duration: motionTokens.duration.standard, ease: curve(motionTokens.ease.enter) };

  return (
    <LayoutGroup id={baseId}>
      <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={300}>
        <div ref={setFrame} className={styles.shell} aria-label="Painel Desktop Vira" onKeyDown={e => { if (e.key === "Escape" && overlaid && !e.defaultPrevented) { e.preventDefault(); fold(); } }}>
          <motion.div className={styles.slot} initial={false} animate={{ width: floating || collapsed ? RAIL : FULL }} transition={reduce ? instant : motionTokens.spring.smooth}>
            <aside id={sidebarId} className={styles.sidebar} data-collapsed={collapsed || undefined} data-floating={overlaid || undefined}>
              <Brand collapsed={collapsed} reduce={reduce} />
              <Navigation
                variant="side"
                baseId={baseId}
                collapsed={collapsed}
                active={active}
                reduce={reduce}
                onSelect={id => handleSelect(id)}
              />
              <Profile collapsed={collapsed} reduce={reduce} />
            </aside>
          </motion.div>

          <AnimatePresence>
            {overlaid && (
              <motion.div
                key="float-scrim"
                className={`${styles.scrim} ${styles.floatScrim}`}
                aria-hidden
                onClick={fold}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? instant : { duration: motionTokens.duration.standard, ease: curve(motionTokens.ease.standard) }}
              />
            )}
          </AnimatePresence>

          <main className={styles.main}>
            <header className={styles.topbar}>
              <Tooltip side="bottom" content={<span className={styles.shortcut}>{collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}<kbd>[</kbd></span>}>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.railToggle}`}
                  aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                  aria-expanded={!collapsed}
                  aria-controls={sidebarId}
                  aria-keyshortcuts="["
                  onClick={toggleRail}
                >
                  <PanelGlyph collapsed={collapsed} reduce={reduce} />
                </button>
              </Tooltip>

              <button
                ref={menuButton}
                type="button"
                className={`${styles.iconButton} ${styles.menuButton}`}
                aria-label="Abrir menu de navegação"
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                aria-keyshortcuts="["
                onClick={() => setSheetOpen(true)}
              >
                <PanelGlyph collapsed={false} reduce={reduce} />
              </button>

              <nav className={styles.crumbs} aria-label="Trilha de navegação">
                <ol>
                  <li className={styles.crumbRoot}>Vira App</li>
                  {tabTitles[active].category && (
                    <li>{tabTitles[active].category}</li>
                  )}
                  <li className={styles.crumbCurrent} aria-current="page">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={active} variants={rise} initial="hidden" animate="shown" exit="gone" transition={swap}>
                        {tabTitles[active].title}
                      </motion.span>
                    </AnimatePresence>
                  </li>
                </ol>
              </nav>

              <div className={styles.topActions}>
                <Link to="/mobile" style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="sm">
                    <Smartphone size={15} />
                    <span className={styles.mobileButtonText}>Ver Loja Mobile</span>
                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </Button>
                </Link>
              </div>
            </header>

            <div className={styles.content}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  variants={rise}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                  transition={swap}
                  style={{ width: "100%" }}
                >
                  {active === "visao-geral" && <OverviewView />}
                  {active === "clientes" && <ClientsView />}
                  {active === "subir-conteudo" && <UploadContentView />}
                  {active === "agenda" && <BookingsView />}
                  {active === "vendas" && <OrdersView />}
                  {active === "conta" && <SettingsPage />}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className={styles.srOnly} role="status" aria-live="polite">{status}</p>
          </main>

          <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
            <AnimatePresence>
              {sheetOpen && frame && (
                <Dialog.Portal forceMount container={frame}>
                  <Dialog.Overlay asChild forceMount>
                    <motion.div className={styles.scrim} style={{ opacity: scrimOpacity }} />
                  </Dialog.Overlay>
                  <Dialog.Content
                    asChild
                    forceMount
                    aria-describedby={undefined}
                    onCloseAutoFocus={e => { e.preventDefault(); menuButton.current?.focus({ preventScroll: true }); }}
                    onOpenAutoFocus={e => {
                      const cur = sheet.current?.querySelector<HTMLElement>("[aria-current='page']");
                      if (cur && !cur.closest("[inert]")) { e.preventDefault(); cur.focus(); }
                    }}
                  >
                    <motion.div
                      ref={sheet}
                      className={styles.sheet}
                      style={{ x: sheetX }}
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={reduce ? instant : motionTokens.spring.smooth}
                      drag={prefersReduced ? false : "x"}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={{ left: 0.9, right: 0.04 }}
                      dragMomentum={false}
                      onDragStart={() => { dragging.current = true; sheet.current?.setAttribute("data-dragging", ""); }}
                      onDragEnd={(_, info) => {
                        sheet.current?.removeAttribute("data-dragging");
                        window.setTimeout(() => { dragging.current = false; }, 0);
                        if (info.offset.x < -72 || info.velocity.x < -480) setSheetOpen(false);
                      }}
                    >
                      <Dialog.Title className={styles.srOnly}>Navegação</Dialog.Title>
                      <div className={styles.sheetHead}>
                        <Brand collapsed={false} reduce={reduce} />
                        <Dialog.Close asChild>
                          <button type="button" className={styles.iconButton} aria-label="Fechar navegação">
                            <X size={18} strokeWidth={1.75} aria-hidden />
                          </button>
                        </Dialog.Close>
                      </div>
                      <Navigation
                        variant="sheet"
                        baseId={baseId}
                        collapsed={false}
                        active={active}
                        reduce={reduce}
                        onSelect={id => handleSelect(id, true)}
                      />
                      <Profile collapsed={false} reduce={reduce} />
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </TooltipPrimitive.Provider>
    </LayoutGroup>
  );
}

export default DashboardPage;
