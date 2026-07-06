export function formatPrice(n: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}
