export function buildImageUrl(raw?: string): string {
  if (!raw) {
    return "https://dummyimage.com/800x800/0b0d14/f97316.png&text=GayeTech%20Store";
  }
  if (raw.startsWith("http") || raw.startsWith("data:")) return raw;

  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return raw;

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${normalized}`;
}
