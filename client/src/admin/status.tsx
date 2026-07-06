import type { Order } from "../types";

export const STATUS_LABELS: Record<Order["status"], string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELED: "Annulée",
};

const STATUS_STYLES: Record<Order["status"], string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  SHIPPED: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-green-500/15 text-green-400 border-green-500/30",
  CANCELED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
