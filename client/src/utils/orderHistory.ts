/**
 * Mémorise localement (sur l'appareil du client) les dernières commandes
 * passées, pour qu'il puisse les retrouver sur /suivre-commande sans
 * ressaisir ni le numéro de commande ni le téléphone — utile s'il a
 * fermé/rafraîchi la page de confirmation et n'a pas gardé la facture.
 */

const STORAGE_KEY = "electroshop_recent_orders";
const MAX_ENTRIES = 5;

export type RecentOrder = {
  reference: string;
  phone: string;
  customerName: string;
  total: number;
  createdAt: string;
};

export function saveRecentOrder(entry: RecentOrder): void {
  try {
    const existing = loadRecentOrders().filter(
      (o) => o.reference !== entry.reference
    );
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) — tant pis
  }
}

export function loadRecentOrders(): RecentOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
