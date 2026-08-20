/**
 * Validation des numéros de téléphone sénégalais côté client.
 * Format attendu : 9 chiffres commençant par 7 (70/75/76/77/78...),
 * avec ou sans l'indicatif 221. Les espaces/tirets sont ignorés.
 */

function localDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("221") ? digits.slice(3) : digits;
}

export function isValidSenegalPhone(phone: string): boolean {
  return /^7\d{8}$/.test(localDigits(phone));
}

/** Message d'erreur à afficher sous le champ, ou null si le numéro est valide. */
export function phoneErrorMessage(phone: string): string | null {
  const local = localDigits(phone);

  if (local.length === 0) return "Numéro de téléphone requis";
  if (!local.startsWith("7")) return "Le numéro doit commencer par 7 (ex. 77, 76, 78...)";
  if (local.length < 9) return `Numéro incomplet — ${local.length}/9 chiffres`;
  if (local.length > 9) return "Numéro trop long (9 chiffres attendus)";
  return null;
}
