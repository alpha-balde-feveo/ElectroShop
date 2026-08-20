import type { Order } from "../types";
import { formatPrice } from "./format";

/** Numéro WhatsApp de la boutique (configurable via client/.env) */
export const SHOP_WHATSAPP =
  (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) || "221773672275";

/** Numéro formaté pour l'affichage : +221 77 367 22 75 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("221") ? digits.slice(3) : digits;
  if (local.length !== 9) return `+${digits}`;
  return `+221 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}

/** Numéro de la boutique, formaté pour l'affichage (footer, factures, etc.) */
export const SHOP_WHATSAPP_DISPLAY = formatPhoneDisplay(SHOP_WHATSAPP);

/** Numéro de la boutique, pour un lien tel: */
export const SHOP_WHATSAPP_TEL = `+${SHOP_WHATSAPP}`;

/** Normalise un numéro sénégalais vers le format international wa.me */
export function toWaPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // 771234567 → 221771234567
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  return digits;
}

/** Lien WhatsApp : vers un numéro précis, ou choix du contact si omis */
export function waUrl(text: string, phone?: string): string {
  const encoded = encodeURIComponent(text);
  return phone
    ? `https://wa.me/${toWaPhone(phone)}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

/** Message de contact standard de la boutique */
export function waContactUrl(): string {
  return waUrl(
    "Bonjour GayeTech Store 👋 J'ai une question sur vos produits.",
    SHOP_WHATSAPP
  );
}

const SHIPPING_LABELS: Record<string, string> = {
  STANDARD: "Livraison standard",
  EXPRESS: "Livraison express (24h)",
  PICKUP: "Retrait en boutique",
};

const PAYMENT_LABELS: Record<string, string> = {
  ON_DELIVERY: "Paiement à la livraison",
  WAVE: "Wave (QR code)",
  CASH_ON_SITE: "Espèces sur place",
};

/** Facture au format texte WhatsApp (gras avec *...*) */
export function buildInvoiceText(order: Order): string {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  const lines: string[] = [
    "🧾 *FACTURE — GayeTech Store*",
    `N° ${order._id.slice(-8).toUpperCase()} · ${date}`,
    "",
    `Client : ${order.customerName}`,
    `Tél : ${order.phone}`,
  ];

  if (order.shippingMode)
    lines.push(`Réception : ${SHIPPING_LABELS[order.shippingMode] ?? ""}`);
  if (order.paymentMethod)
    lines.push(`Paiement : ${PAYMENT_LABELS[order.paymentMethod] ?? ""}`);
  if (order.shippingMode === "PICKUP" && order.pickupCode)
    lines.push("", `🔑 Code de retrait : *${order.pickupCode}*`);

  lines.push("", "— — — — — — — — — —");
  for (const it of order.items) {
    lines.push(
      `${it.qty}× ${it.nameSnapshot}`,
      `   ${formatPrice(it.priceSnapshot * it.qty)}`
    );
  }
  lines.push("— — — — — — — — — —", "");

  lines.push(`Sous-total : ${formatPrice(order.subtotal)}`);
  if (order.discount > 0)
    lines.push(
      `Réduction${order.promoCode ? ` (${order.promoCode})` : ""} : -${formatPrice(order.discount)}`
    );
  lines.push(`Livraison : ${formatPrice(order.shippingFee)}`);
  lines.push("", `💰 *TOTAL : ${formatPrice(order.total)}*`, "");
  lines.push(
    "Merci pour votre confiance ! 🙏",
    `GayeTech Store — Dakar · ${SHOP_WHATSAPP_DISPLAY}`
  );

  return lines.join("\n");
}
