import { waContactUrl } from "../utils/whatsapp";

/** Bulle WhatsApp flottante — contact direct avec la boutique */
export default function WhatsAppButton() {
  return (
    <a
      href={waContactUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      title="Une question ? Écrivez-nous sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-2xl shadow-green-500/30 hover:scale-110 transition-transform"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.5-.7c.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.7a12 12 0 0 0 4.6 4.3c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0 0-.2-.1-.6-.3z" />
      </svg>
      {/* Halo pulsant */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 -z-10" />
    </a>
  );
}
