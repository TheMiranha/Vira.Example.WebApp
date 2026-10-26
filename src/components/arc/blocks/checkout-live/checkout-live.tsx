"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Copy, Download, LoaderCircle, Lock, Plus, RotateCcw, X } from "lucide-react";
import { motionTokens } from "../../lib/motion-tokens";
import { addons as sampleAddons, countries as sampleCountries, defaults, plans as samplePlans, sampleCoupon, testCard } from "./checkout-live-data";
import type { Addon, Billing, Country, CouponResult, Plan, PlanId } from "./checkout-live-data";
import styles from "./checkout-live.module.css";

export type { Billing, CouponResult, PlanId } from "./checkout-live-data";

export interface CheckoutOrder {
  plan: PlanId;
  billing: Billing;
  addons: string[];
  coupon?: string;
  country: string;
  email: string;
  method: "card" | "Apple Pay" | "Google Pay" | "Pix";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CheckoutLiveProps {
  /** Planos ou produtos disponíveis */
  plans?: Plan[];
  /** Add-ons ou order bumps opcionais */
  addons?: Addon[];
  /** Países com regras de endereço/imposto */
  countries?: Country[];
  defaultPlan?: PlanId;
  defaultBilling?: Billing;
  defaultAddons?: string[];
  /** Código de moeda ISO (BRL) */
  currency?: string;
  /** Validador de cupons */
  validateCoupon?: (code: string) => CouponResult | Promise<CouponResult>;
  /** Callback acionado ao pagar */
  onPay?: (order: CheckoutOrder) => void | Promise<void>;
  /** Callback acionado no botão de download ou entrega */
  onDownloadReceipt?: () => void;
  className?: string;
  /** Título customizado do produto se for compra de item único */
  customItemTitle?: string;
  /** Remove bordas e elevações quando renderizado dentro de BottomSheet/Modal */
  borderless?: boolean;
}

type FieldName = "email" | "name" | "address" | "city" | "postal" | "card" | "expiry" | "cvc";
type Values = Record<FieldName, string> & { country: string };
type Phase = "edit" | "processing" | "pix_pending" | "paid";
type Method = CheckoutOrder["method"];

const fieldOrder: FieldName[] = ["email", "name", "address", "city", "postal", "card", "expiry", "cvc"];
const expressMethods: Exclude<Method, "card">[] = ["Apple Pay", "Google Pay", "Pix"];
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const collapse = { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 } };
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function cx(...names: (string | false | undefined | null)[]) {
  return names.filter(Boolean).join(" ");
}

function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function cardBrand(digits: string) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Elo";
  return "";
}

function formatCard(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(raw: string, previous: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (raw.length < previous.length && previous.endsWith("/")) return digits.slice(0, 1);
  if (digits.length === 1 && Number(digits) > 1) return `0${digits}/`;
  if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function validate(values: Values, country: Country | undefined): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = values.email.trim() ? "Insira um e-mail válido como nome@exemplo.com" : "Digite seu e-mail";
  }
  if (values.name.trim().length < 2) errors.name = "Digite o nome impresso no cartão";
  if (values.address.trim().length < 3) errors.address = "Digite o endereço completo";
  if (!values.city.trim()) errors.city = "Digite a cidade";
  if (!values.postal.trim()) errors.postal = "Digite o CEP";
  else if (country && !country.postal.test(values.postal.trim())) errors.postal = country.postalHint;

  const digits = values.card.replace(/\D/g, "");
  if (!digits) errors.card = "Digite o número do cartão";
  else if (digits.length < 16) errors.card = "Número do cartão incompleto";
  else if (!luhn(digits)) errors.card = "Número do cartão inválido";

  const expiry = /^(\d{2})\/(\d{2})$/.exec(values.expiry);
  if (!expiry) errors.expiry = "Use MM/AA";
  else {
    const month = Number(expiry[1]), year = 2000 + Number(expiry[2]);
    const now = new Date();
    if (month < 1 || month > 12) errors.expiry = "Mês inválido (01 a 12)";
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) errors.expiry = "Cartão expirado";
  }

  if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = "CVV com 3 ou 4 dígitos";
  return errors;
}

/** Roll numérico animado */
function Roll({ value, className }: { value: string; className?: string }) {
  const reduced = useReducedMotion();
  const chars = Array.from(value);
  const transition = reduced ? { duration: 0 } : motionTokens.spring.snappy;
  return (
    <span className={cx(styles.roll, className)}>
      <span className={styles.srOnly}>{value}</span>
      <span className={styles.rollTrack} aria-hidden="true">
        {chars.map((char, index) => {
          const place = chars.length - index;
          if (!/\d/.test(char)) return <span key={`s${place}`} className={styles.rollGlyph}>{char}</span>;
          return (
            <span key={`d${place}`} className={styles.rollDigit}>
              <motion.span className={styles.rollStrip} initial={false} animate={{ y: `${Number(char) * -10}%` }} transition={transition}>
                {DIGITS.map(digit => <span key={digit}>{digit}</span>)}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/** Logos oficiais para Apple Pay, Google Pay e Pix */
function WalletMark({ name }: { name: Exclude<Method, "card"> }) {
  if (name === "Apple Pay") {
    return (
      <span className={styles.walletMark} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M16.37 1.43c0 1.14-.5 2.27-1.18 3.08-.74.9-1.99 1.57-2.99 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.57-2.27 1.21-2.98.8-.94 2.14-1.64 3.25-1.68.03.13.05.28.05.43zm4.56 15.71c-.03.07-.46 1.58-1.52 3.12-.94 1.34-1.94 2.71-3.43 2.71-1.52 0-1.9-.88-3.63-.88-1.7 0-2.3.91-3.67.91-1.38 0-2.33-1.26-3.43-2.8-1.29-1.82-2.32-4.63-2.32-7.28 0-4.28 2.8-6.55 5.55-6.55 1.45 0 2.68.95 3.6.95.87 0 2.22-1.01 3.9-1.01.61 0 2.89.06 4.37 2.19-.13.09-2.38 1.37-2.38 4.19 0 3.26 2.85 4.42 2.96 4.45z" />
        </svg>
        Pay
      </span>
    );
  }
  if (name === "Google Pay") {
    return (
      <span className={styles.walletMark} aria-hidden="true">
        <svg viewBox="0 0 48 48" width="16" height="16">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Pay
      </span>
    );
  }
  // Pix Oficial
  return (
    <span className={styles.pixMark} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 2.5L2.5 12 12 21.5 21.5 12 12 2.5zm0 3.8l5.7 5.7-5.7 5.7-5.7-5.7 5.7-5.7z"/>
      </svg>
      Pix
    </span>
  );
}

function Collapse({ children, className, instant }: { children: ReactNode; className?: string; instant?: boolean }) {
  return (
    <motion.div className={cx(styles.collapse, className)} {...collapse} exit={instant ? { opacity: 0, transition: { duration: 0 } } : collapse.exit} transition={motionTokens.spring.smooth}>
      {children}
    </motion.div>
  );
}

export function CheckoutLive({
  plans = samplePlans,
  addons = sampleAddons,
  countries = sampleCountries,
  defaultPlan = "course",
  defaultBilling = "single",
  defaultAddons = [],
  currency = "BRL",
  validateCoupon = sampleCoupon,
  onPay,
  onDownloadReceipt,
  className,
  customItemTitle,
  borderless = true,
}: CheckoutLiveProps) {
  const uid = useId();
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});
  const couponRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const [plan] = useState<PlanId>(defaultPlan);
  const [chosen, setChosen] = useState<string[]>(defaultAddons);
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponDraft, setCouponDraft] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [values, setValues] = useState<Values>({ ...defaults, card: "", expiry: "", cvc: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [phase, setPhase] = useState<Phase>("edit");
  const [method, setMethod] = useState<Method>("card");
  const [payError, setPayError] = useState("");
  const [receipt, setReceipt] = useState<{ number: string; date: string; last4: string; brand: string } | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const country = countries.find(item => item.code === values.country) ?? countries[0];
  const currentPlan = plans.find(item => item.id === plan) ?? plans[0];
  const planAmount = currentPlan.seat;
  const addonLines = addons.filter(addon => chosen.includes(addon.id)).map(addon => ({ ...addon, amount: addon.monthly }));
  const subtotal = planAmount + addonLines.reduce((sum, line) => sum + line.amount, 0);
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const tax = Math.round((subtotal - discount) * country.rate);
  const total = subtotal - discount + tax;

  const format = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);

  const errors = validate(values, country);
  const digits = values.card.replace(/\D/g, "");
  const brand = cardBrand(digits);
  const paid = phase === "paid";
  const busy = phase === "processing";
  const spring = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  const setField = (name: FieldName | "country", value: string) => {
    setValues(current => ({ ...current, [name]: value }));
    setPayError("");
  };
  const showError = (name: FieldName) => (touched[name] ? errors[name] : undefined);

  const applyCoupon = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!couponDraft.trim() || couponBusy) return;
    setCouponBusy(true);
    setCouponError("");
    const [result] = await Promise.all([validateCoupon(couponDraft), wait(400)]);
    setCouponBusy(false);
    if (result.ok) {
      setCoupon({ code: result.code, percent: result.percent });
      setCouponOpen(false);
      setCouponDraft("");
    } else {
      setCouponError(result.message);
      couponRef.current?.focus();
    }
  };

  const order = (payMethod: Method): CheckoutOrder => ({
    plan,
    billing: defaultBilling,
    addons: chosen,
    coupon: coupon?.code,
    country: country.code,
    email: values.email.trim(),
    method: payMethod,
    subtotal,
    discount,
    tax,
    total,
  });

  const charge = async (payMethod: Method) => {
    setMethod(payMethod);
    setPayError("");

    if (payMethod === "Pix") {
      setPhase("pix_pending");
      return;
    }

    setPhase("processing");
    try {
      if (onPay) await onPay(order(payMethod));
      else {
        await wait(payMethod === "card" ? 1200 : 900);
      }
      const now = new Date();
      const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(now);
      setReceipt({
        number: `VIRA-${Math.floor(100000 + Math.random() * 899999)}`,
        date,
        last4: digits.slice(-4) || "8821",
        brand: brand || (payMethod === "Apple Pay" ? "Apple Pay" : payMethod === "Google Pay" ? "Google Pay" : "Pix"),
      });
      setPhase("paid");
      requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    } catch (error) {
      setPhase("edit");
      setPayError(error instanceof Error ? error.message : "Falha no pagamento. Tente novamente.");
    }
  };

  const confirmPixPayment = async () => {
    setPhase("processing");
    await wait(800);
    const now = new Date();
    const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(now);
    setReceipt({
      number: `VIRA-PIX-${Math.floor(100000 + Math.random() * 899999)}`,
      date,
      last4: "PIX",
      brand: "Pix (Banco Central)",
    });
    setPhase("paid");
    if (onPay) await onPay(order("Pix"));
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setTouched(Object.fromEntries(fieldOrder.map(name => [name, true])));
    const first = fieldOrder.find(name => errors[name]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    void charge("card");
  };

  const reset = () => {
    setPhase("edit");
    setReceipt(null);
    setDownloaded(false);
    setTouched({});
    setCoupon(null);
    setPayError("");
    setValues(current => ({ ...current, card: "", expiry: "", cvc: "" }));
  };

  const input = (name: FieldName, label: string, props: Partial<InputHTMLAttributes<HTMLInputElement>> = {}, extra?: ReactNode) => {
    const error = showError(name);
    const valid = touched[name] && !errors[name];
    return (
      <div className={styles.field} data-invalid={error ? "" : undefined}>
        <div className={styles.labelRow}>
          <label htmlFor={`${uid}-${name}`}>{label}</label>
          {extra}
        </div>
        <div className={styles.inputWrap}>
          <input
            ref={node => { refs.current[name] = node; }}
            id={`${uid}-${name}`}
            className={styles.input}
            value={values[name]}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${uid}-${name}-error` : undefined}
            disabled={busy}
            onChange={event => setField(name, event.target.value)}
            onBlur={() => values[name] && setTouched(current => ({ ...current, [name]: true }))}
            {...props}
          />
          <AnimatePresence initial={false}>
            {valid ? (
              <motion.span key="ok" className={styles.valid} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={motionTokens.spring.snappy} aria-hidden="true">
                <Check size={14} strokeWidth={2.5} />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false}>
          {error ? (
            <Collapse key={error}>
              <p id={`${uid}-${name}-error`} className={styles.error}>{error}</p>
            </Collapse>
          ) : null}
        </AnimatePresence>
      </div>
    );
  };

  const handleCopyPix = () => {
    const pixCode = "00020126580014br.gov.bcb.pix0136vira-pay-99214758-alexandra5204000053039865406129.005802BR5920ALEXANDRA SILVA6009SAO PAULO62070503***6304E8A2";
    navigator.clipboard?.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleDownload = () => {
    setDownloaded(true);
    if (onDownloadReceipt) {
      onDownloadReceipt();
    } else {
      const content = `COMPROVANTE DE PAGAMENTO VIRA\n\nPedido: ${receipt?.number || 'VIRA-99214'}\nData: ${receipt?.date}\nProduto: ${customItemTitle || currentPlan.name}\nValor Total: ${format(total)}\nMétodo: ${method}\nCliente: ${values.email}\nStatus: PAGO COM SUCESSO`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo-${receipt?.number || "Vira"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const summaryBody = (
    <>
      <ul className={styles.lines} aria-label="Linhas do pedido">
        <li className={styles.line}>
          <div className={styles.lineText}>
            <span>{customItemTitle || currentPlan.name}</span>
            <small>Acesso imediato e vitalício</small>
          </div>
          <Roll value={format(planAmount)} className={styles.amount} />
        </li>
        <AnimatePresence initial={false}>
          {addonLines.map(line => (
            <motion.li key={line.id} className={styles.lineOuter} {...collapse} transition={spring}>
              <div className={styles.line}>
                <div className={styles.lineText}>
                  <span>{line.name}</span>
                  <small>Oferta complementar adicionada</small>
                </div>
                <Roll value={format(line.amount)} className={styles.amount} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence initial={false}>
        {!paid ? (
          <Collapse key="coupon" instant>
            <div className={styles.coupon}>
              <div className={styles.couponSlot}>
                <AnimatePresence initial={false} mode="popLayout">
                  {coupon ? (
                    <motion.div key="chip" className={styles.couponChip} initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }} transition={motionTokens.spring.morph}>
                      <span className={styles.couponCode}>{coupon.code}</span>
                      <span className={styles.couponOff}>{coupon.percent}% OFF</span>
                      <button type="button" className={styles.chipRemove} aria-label={`Remover ${coupon.code}`} onClick={() => setCoupon(null)}>
                        <X size={13} />
                      </button>
                    </motion.div>
                  ) : !couponOpen ? (
                    <motion.button key="add" type="button" className={styles.textButton} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }} onClick={() => { setCouponOpen(true); requestAnimationFrame(() => couponRef.current?.focus()); }}>
                      <Plus size={14} /> Adicionar cupom
                    </motion.button>
                  ) : (
                    <motion.form key="form" className={styles.couponForm} onSubmit={applyCoupon} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={motionTokens.spring.snappy}>
                      <input ref={couponRef} className={cx(styles.input, styles.couponInput)} value={couponDraft} placeholder="Código" aria-label="Código do cupom" aria-invalid={couponError ? true : undefined} aria-describedby={couponError ? `${uid}-coupon-error` : undefined} onChange={event => { setCouponDraft(event.target.value.toUpperCase()); setCouponError(""); }} onKeyDown={event => { if (event.key === "Escape") { setCouponOpen(false); setCouponError(""); } }} />
                      <button type="submit" className={styles.secondary} disabled={!couponDraft.trim() || couponBusy}>
                        {couponBusy ? <LoaderCircle size={15} className={styles.spin} aria-label="Validando cupom" /> : "Aplicar"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence initial={false}>
                {couponError ? (
                  <Collapse key={couponError}>
                    <p id={`${uid}-coupon-error`} className={styles.error}>{couponError}</p>
                  </Collapse>
                ) : null}
              </AnimatePresence>
            </div>
          </Collapse>
        ) : null}
      </AnimatePresence>

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Subtotal</dt>
          <dd><Roll value={format(subtotal)} /></dd>
        </div>
        <AnimatePresence initial={false}>
          {coupon ? (
            <motion.div key="discount" className={styles.lineOuter} {...collapse} transition={spring}>
              <div className={styles.totalRow}>
                <dt>Desconto <span className={styles.muted}>({coupon.code})</span></dt>
                <dd className={styles.discount}>−<Roll value={format(discount)} /></dd>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className={styles.totalRow}>
          <dt>{country.taxLabel}</dt>
          <dd><span className={styles.muted}>Incluso</span></dd>
        </div>
        <div className={cx(styles.totalRow, styles.grand)}>
          <dt>{paid ? "Total pago" : "Total a pagar"}</dt>
          <dd><Roll value={format(total)} /></dd>
        </div>
      </dl>

      <AnimatePresence initial={false}>
        {paid && receipt ? (
          <motion.div key="receipt" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.standard }, delay: 0.16 }}>
            <dl className={styles.meta}>
              <div><dt>Código do pedido</dt><dd>{receipt.number}</dd></div>
              <div><dt>Método de pagamento</dt><dd>{receipt.brand}</dd></div>
              <div><dt>Data e hora</dt><dd>{receipt.date}</dd></div>
              <div><dt>Comprovante enviado para</dt><dd>{values.email}</dd></div>
            </dl>
            <div className={styles.receiptActions}>
              <button type="button" className={cx(styles.secondary, styles.stack)} onClick={handleDownload} aria-live="polite">
                <span className={styles.sizer} aria-hidden="true"><Download size={15} /> Baixar Comprovante (PDF)</span>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span key={downloaded ? "done" : "idle"} className={styles.buttonLabel} initial={{ opacity: 0, y: 6, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(3px)" }} transition={motionTokens.spring.snappy}>
                    {downloaded ? <><Check size={15} /> Acesso Liberado</> : <><Download size={15} /> Baixar Comprovante</>}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button type="button" className={styles.ghost} onClick={reset}>
                <RotateCcw size={15} /> Novo pedido
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx(styles.frame, className)} data-borderless={borderless || undefined}>
        <LayoutGroup id={uid}>
          <div className={styles.shell} data-paid={paid || undefined}>
            <AnimatePresence initial={false} mode="popLayout">
              {phase === "pix_pending" ? (
                <motion.div key="pix-step" className={styles.form} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}>
                  <div className={styles.sectionHead}>
                    <h2>Pagamento via Pix</h2>
                    <button type="button" className={styles.textButton} onClick={() => setPhase("edit")}>
                      Voltar às opções
                    </button>
                  </div>
                  <div className={styles.pixBox}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie a chave Pix:
                    </p>
                    <div className={styles.pixQrWrap}>
                      <svg width="130" height="130" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="30" height="30" fill="black" />
                        <rect x="15" y="15" width="20" height="20" fill="white" />
                        <rect x="20" y="20" width="10" height="10" fill="black" />
                        <rect x="60" y="10" width="30" height="30" fill="black" />
                        <rect x="65" y="15" width="20" height="20" fill="white" />
                        <rect x="70" y="20" width="10" height="10" fill="black" />
                        <rect x="10" y="60" width="30" height="30" fill="black" />
                        <rect x="15" y="65" width="20" height="20" fill="white" />
                        <rect x="20" y="70" width="10" height="10" fill="black" />
                        <rect x="50" y="50" width="10" height="10" fill="#0d6b63" />
                        <rect x="70" y="70" width="20" height="20" fill="black" />
                        <rect x="50" y="70" width="10" height="10" fill="black" />
                        <rect x="70" y="50" width="10" height="10" fill="black" />
                      </svg>
                    </div>
                    <div className={styles.pixCodeRow}>
                      <input readOnly value="00020126580014br.gov.bcb.pix0136vira-pay-99214758-alexandra..." className={styles.pixInput} />
                      <button type="button" className={styles.secondary} onClick={handleCopyPix}>
                        {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.payArea}>
                    <button type="button" className={styles.pay} onClick={confirmPixPayment} disabled={busy}>
                      {busy ? (
                        <span className={styles.buttonLabel}><LoaderCircle size={16} className={styles.spin} /> Confirmando...</span>
                      ) : (
                        <span className={styles.buttonLabel}>Já realizei o Pix (Confirmar)</span>
                      )}
                    </button>
                    <p className={styles.secure}>
                      <Lock size={13} aria-hidden="true" /> Aprovação imediata pelo Banco Central
                    </p>
                  </div>
                </motion.div>
              ) : !paid ? (
                <motion.form key="form" className={styles.form} onSubmit={submit} noValidate exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -24, transition: { duration: motionTokens.duration.standard, ease: motionTokens.ease.exit } }} aria-label="Pagamento">
                  {/* Pagamento Rápido Express: Apple Pay + Google Pay + Pix */}
                  <section className={styles.section} aria-labelledby={`${uid}-express`}>
                    <div className={styles.sectionHead}>
                      <h2 id={`${uid}-express`}>Pagamento Rápido em 1 Clique</h2>
                    </div>
                    <div className={styles.express}>
                      {expressMethods.map(name => (
                        <button
                          key={name}
                          type="button"
                          className={styles.expressButton}
                          data-brand={name === "Apple Pay" ? "apple" : name === "Google Pay" ? "google" : "pix"}
                          aria-label={`Pagar com ${name}`}
                          disabled={busy}
                          onClick={() => void charge(name)}
                        >
                          {busy && method === name ? (
                            <LoaderCircle size={16} className={styles.spin} aria-label={`Processando ${name}`} />
                          ) : (
                            <WalletMark name={name} />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className={styles.or}><span>Ou pague com cartão de crédito</span></p>
                  </section>

                  {/* Add-on opcional (Order Bump) */}
                  {addons.length > 0 && (
                    <section className={styles.section} aria-labelledby={`${uid}-addons`}>
                      <div className={styles.sectionHead}>
                        <h2 id={`${uid}-addons`}>Aproveite e adicione junto:</h2>
                      </div>
                      <ul className={styles.addons}>
                        {addons.map(addon => {
                          const on = chosen.includes(addon.id);
                          return (
                            <li key={addon.id}>
                              <label className={styles.addon} data-on={on || undefined}>
                                <input type="checkbox" className={styles.srOnly} checked={on} disabled={busy} onChange={() => setChosen(current => (on ? current.filter(id => id !== addon.id) : [...current, addon.id]))} />
                                <span className={styles.check} aria-hidden="true">
                                  <motion.svg viewBox="0 0 16 16" width="12" height="12">
                                    <motion.path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={motionTokens.spring.snappy} />
                                  </motion.svg>
                                </span>
                                <span className={styles.addonText}>
                                  <span>{addon.name}</span>
                                  <small>{addon.detail}</small>
                                </span>
                                <span className={styles.addonPrice}>+{format(addon.monthly)}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {/* Dados de Entrega e Cobrança */}
                  <section className={styles.section} aria-labelledby={`${uid}-billing-details`}>
                    <div className={styles.sectionHead}>
                      <h2 id={`${uid}-billing-details`}>Dados para envio do produto</h2>
                    </div>
                    <div className={styles.grid}>
                      <div className={styles.span2}>
                        {input("email", "E-mail onde receberá o acesso", { type: "email", autoComplete: "email", placeholder: "seu.email@exemplo.com" })}
                      </div>
                      <div className={styles.span2}>
                        {input("name", "Nome completo", { autoComplete: "name", placeholder: "Mariana Souza" })}
                      </div>
                      <div className={styles.span2}>
                        {input("postal", "CEP", { autoComplete: "postal-code", placeholder: "01310-100" })}
                      </div>
                    </div>
                  </section>

                  {/* Cartão de Crédito */}
                  <section className={styles.section} aria-labelledby={`${uid}-card-title`}>
                    <div className={styles.sectionHead}>
                      <h2 id={`${uid}-card-title`}>Cartão de crédito</h2>
                      <button type="button" className={styles.textButton} disabled={busy} onClick={() => { setValues(current => ({ ...current, card: testCard.number, expiry: testCard.expiry, cvc: testCard.cvc })); setTouched(current => ({ ...current, card: true, expiry: true, cvc: true })); setPayError(""); }}>
                        Preencher cartão de teste
                      </button>
                    </div>
                    <div className={styles.grid3}>
                      <div className={styles.span3}>
                        {input("card", "Número do cartão", {
                          inputMode: "numeric",
                          autoComplete: "cc-number",
                          placeholder: "1234 1234 1234 1234",
                          onChange: event => setField("card", formatCard(event.target.value)),
                        }, (
                          <AnimatePresence initial={false} mode="popLayout">
                            {brand ? (
                              <motion.span key={brand} className={styles.brand} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={motionTokens.spring.snappy}>
                                {brand}
                              </motion.span>
                            ) : null}
                          </AnimatePresence>
                        ))}
                      </div>
                      <div>
                        {input("expiry", "Validade", {
                          inputMode: "numeric",
                          autoComplete: "cc-exp",
                          placeholder: "MM/AA",
                          onChange: event => setField("expiry", formatExpiry(event.target.value, values.expiry)),
                        })}
                      </div>
                      <div>
                        {input("cvc", "CVV", {
                          inputMode: "numeric",
                          autoComplete: "cc-csc",
                          placeholder: "123",
                          onChange: event => setField("cvc", event.target.value.replace(/\D/g, "").slice(0, 4)),
                        })}
                      </div>
                    </div>
                  </section>

                  <div className={styles.payArea}>
                    <AnimatePresence initial={false}>
                      {payError ? (
                        <Collapse key={payError}>
                          <p className={styles.payError} role="alert">{payError}</p>
                        </Collapse>
                      ) : null}
                    </AnimatePresence>
                    <button type="submit" className={styles.pay} disabled={busy} aria-live="polite">
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span key={busy && method === "card" ? "busy" : "idle"} className={styles.buttonLabel} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={motionTokens.spring.snappy}>
                          {busy && method === "card" ? (
                            <><LoaderCircle size={16} className={styles.spin} /> Processando...</>
                          ) : (
                            <>Pagar <Roll value={format(total)} /></>
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                    <p className={styles.secure}>
                      <Lock size={13} aria-hidden="true" /> Ambiente criptografado & compra segura
                    </p>
                  </div>
                </motion.form>
              ) : null}
            </AnimatePresence>

            {/* Resumo Lateral (ou Topo no mobile) com acordeão dobrável */}
            <motion.aside layout="position" className={styles.summary} data-paid={paid || undefined} data-borderless={borderless || undefined} transition={spring} aria-labelledby={`${uid}-summary-title`}>
              <div className={styles.summaryHead}>
                <AnimatePresence initial={false} mode="popLayout">
                  {paid ? (
                    <motion.div key="paid" className={styles.paidHead} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.standard }, delay: 0.06 }}>
                      <span className={styles.paidMark} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.considered, delay: 0.25, ease: motionTokens.ease.enter }} />
                        </svg>
                      </span>
                      <h2 id={`${uid}-summary-title`} ref={headingRef} tabIndex={-1} className={styles.summaryTitle}>
                        Pagamento aprovado!
                      </h2>
                      <p className={styles.summaryNote}>
                        Seu acesso a <strong>{customItemTitle || currentPlan.name}</strong> foi liberado.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="edit" className={styles.summaryHead} exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionTokens.duration.fast } }}>
                      <h2 id={`${uid}-summary-title`} className={cx(styles.summaryTitle, styles.wideOnly)}>
                        Resumo do pedido
                      </h2>
                      <button type="button" className={cx(styles.summaryToggle, styles.narrowOnly)} aria-expanded={summaryOpen} aria-controls={`${uid}-summary-body`} onClick={() => setSummaryOpen(open => !open)}>
                        <span className={styles.summaryTitleSmall}>
                          {summaryOpen ? "Ocultar resumo" : "Ver resumo do pedido"}
                          <motion.span initial={false} animate={{ rotate: summaryOpen ? 180 : 0 }} transition={motionTokens.spring.snappy} className={styles.chevron}>
                            <ChevronDown size={15} />
                          </motion.span>
                        </span>
                        <Roll value={format(total)} className={styles.toggleTotal} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div id={`${uid}-summary-body`} className={styles.summaryBodyWrap} data-open={summaryOpen || undefined}>
                <div className={styles.summaryBodyClip}>
                  <div className={styles.summaryBody}>{summaryBody}</div>
                </div>
              </div>
            </motion.aside>
          </div>
        </LayoutGroup>
      </div>
    </MotionConfig>
  );
}

export default CheckoutLive;
