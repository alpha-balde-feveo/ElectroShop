/**
 * Lien de paiement Wave du marchand.
 * Configurez VITE_WAVE_LINK dans client/.env avec votre lien Wave Business,
 * ex : https://pay.wave.com/m/M_XXXXXXXX/c/sn/
 */
export function waveLink(amount: number): string {
  const base =
    (import.meta.env.VITE_WAVE_LINK as string | undefined) ||
    "https://pay.wave.com/m/M_CONFIGUREZ_MOI/c/sn/";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}amount=${amount}`;
}

/** QR code du lien Wave (généré via un service public de QR). */
export function waveQrUrl(amount: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    waveLink(amount)
  )}`;
}
