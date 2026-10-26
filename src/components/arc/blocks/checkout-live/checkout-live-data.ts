/** Catalog and presets for the Vira Live Checkout. Prices are in cents (BRL). */

export type PlanId = "course" | "mentorship" | "guide";
export type Billing = "single" | "installments";

export interface Plan {
  id: PlanId;
  name: string;
  seat: number; // base price in cents
  blurb: string;
}

export interface Addon {
  id: string;
  name: string;
  detail: string;
  monthly: number; // addon price in cents
}

export interface Country {
  code: string;
  name: string;
  rate: number;
  taxLabel: string;
  postal: RegExp;
  postalHint: string;
}

export type CouponResult = { ok: true; code: string; percent: number } | { ok: false; message: string };

export const plans: Plan[] = [
  { id: "course", name: "Curso Criador Digital", seat: 12900, blurb: "Acesso vitalício + atualizações 2026" },
  { id: "mentorship", name: "Sessão de Mentoria 1:1", seat: 4900, blurb: "60min individual com Alexandra Silva" },
  { id: "guide", name: "Download do Meu Guia", seat: 2500, blurb: "E-book PDF completo com 48 páginas" },
];

export const addons: Addon[] = [
  { id: "community", name: "Comunidade VIP de Criadores", detail: "Acesso por 30 dias ao grupo de networking", monthly: 2900 },
  { id: "templates", name: "Pack de 50+ Templates Notion & Canva", detail: "Modelos validados prontos para uso", monthly: 1900 },
];

export const countries: Country[] = [
  { code: "BR", name: "Brasil", rate: 0, taxLabel: "Impostos inclusos", postal: /^\d{5}-?\d{3}$/, postalHint: "Use um CEP válido: 00000-000" },
  { code: "PT", name: "Portugal", rate: 0.23, taxLabel: "IVA 23%", postal: /^\d{4}-\d{3}$/, postalHint: "Use o código postal: 0000-000" },
  { code: "US", name: "Estados Unidos", rate: 0, taxLabel: "Sales tax", postal: /^\d{5}(-\d{4})?$/, postalHint: "Use um ZIP de 5 dígitos" },
];

/** Regras de validação de cupom de desconto. */
export function sampleCoupon(code: string): CouponResult {
  const key = code.trim().toUpperCase();
  if (key === "VIRA10") return { ok: true, code: key, percent: 10 };
  if (key === "ALEXANDRA20") return { ok: true, code: key, percent: 20 };
  if (key === "BLACK50") return { ok: true, code: key, percent: 50 };
  return { ok: false, message: `Cupom "${key || "informado"}" não encontrado ou expirado.` };
}

export const defaults = {
  email: "comprador@exemplo.com.br",
  name: "Mariana Souza",
  address: "Av. Paulista, 1000",
  city: "São Paulo",
  postal: "01310-100",
  country: "BR",
};

export const testCard = { number: "4242 4242 4242 4242", expiry: "12/28", cvc: "789" };
