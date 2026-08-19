import type { Order } from "../types";
import { formatPrice } from "../utils/format";
import { SHOP_WHATSAPP_DISPLAY } from "../utils/whatsapp";

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

/**
 * Facture imprimable (visible uniquement à l'impression / export PDF).
 * Déclenchez window.print() : le navigateur propose « Enregistrer en PDF ».
 */
export default function InvoicePrint({ order }: { order: Order }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  return (
    <div className="print-only" style={{ color: "#111", background: "#fff", padding: 32, fontFamily: "Arial, sans-serif" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>
            GAYE<span style={{ color: "#f97316" }}>TECH</span> STORE
          </div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            Dakar, Sénégal · {SHOP_WHATSAPP_DISPLAY}
            <br />
            contact@gayetechstore.sn
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>FACTURE</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            N° {order._id.slice(-8).toUpperCase()}
            <br />
            {date}
          </div>
        </div>
      </div>

      {/* Client */}
      <div style={{ marginTop: 28, padding: 14, border: "1px solid #ddd", borderRadius: 8, fontSize: 13 }}>
        <strong>Client :</strong> {order.customerName} · {order.phone}
        {order.shippingMode !== "PICKUP" && order.address && (
          <>
            <br />
            <strong>Adresse :</strong> {order.address}, {order.city}
          </>
        )}
        <br />
        <strong>Réception :</strong>{" "}
        {SHIPPING_LABELS[order.shippingMode ?? "STANDARD"]}
        {" · "}
        <strong>Paiement :</strong>{" "}
        {PAYMENT_LABELS[order.paymentMethod ?? "ON_DELIVERY"]}
      </div>

      {/* Articles */}
      <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ textAlign: "left", padding: 10, borderBottom: "2px solid #111" }}>Article</th>
            <th style={{ textAlign: "center", padding: 10, borderBottom: "2px solid #111" }}>Qté</th>
            <th style={{ textAlign: "right", padding: 10, borderBottom: "2px solid #111" }}>Prix unitaire</th>
            <th style={{ textAlign: "right", padding: 10, borderBottom: "2px solid #111" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={i}>
              <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{it.nameSnapshot}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "center" }}>{it.qty}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>{formatPrice(it.priceSnapshot)}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>{formatPrice(it.priceSnapshot * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div style={{ marginTop: 20, marginLeft: "auto", width: 280, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>Sous-total</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#16a34a" }}>
            <span>Réduction {order.promoCode && `(${order.promoCode})`}</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>Livraison</span>
          <span>{formatPrice(order.shippingFee)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0 0",
            marginTop: 6,
            borderTop: "2px solid #111",
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          <span>TOTAL</span>
          <span style={{ color: "#f97316" }}>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#777" }}>
        Merci pour votre confiance ! · GayeTech Store — Tous droits réservés
      </div>
    </div>
  );
}
