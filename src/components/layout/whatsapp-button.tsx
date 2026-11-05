import { site } from "@/lib/site"
import { WhatsAppIcon } from "@/components/icons/social-icons"

export function WhatsAppButton() {
  return (
    <a
      href={site.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed right-4 bottom-4 z-30 flex items-center gap-2 md:right-6 md:bottom-6"
    >
      <span className="pointer-events-none hidden bg-white px-3 py-1.5 text-caption opacity-0 transition-opacity group-hover:opacity-100 md:block">
        ¿Dudas? Escríbenos
      </span>
      <span className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform group-hover:scale-105">
        <WhatsAppIcon className="size-7" color="currentColor" />
      </span>
    </a>
  )
}
