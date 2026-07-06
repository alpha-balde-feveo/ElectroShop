export function buildImageUrl(raw?: string): string {
  if (!raw) {
    return "https://dummyimage.com/800x800/e5e7eb/111827.png&text=Electroshop";
  }
  if (raw.startsWith("http")) return raw;

  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return raw;

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${normalized}`;
}
