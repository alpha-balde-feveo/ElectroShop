import type { Order } from "../types";

export const STATUS_LABELS: Record<Order["status"], string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELED: "Annulée",
};

const STATUS_STYLES: Record<Order["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
