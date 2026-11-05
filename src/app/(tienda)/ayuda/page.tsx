import type { Metadata } from "next"
import Link from "next/link"

import { site } from "@/lib/site"
import { WhatsAppIcon } from "@/components/icons/social-icons"
import { PageHeader } from "@/components/product/shop-view"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Ayuda",
  description: "Envíos vía Shalom, precios por volumen, cambios y preguntas frecuentes.",
}

// TODO: confirmar políticas reales de cambios y tiempos de envío con RIVIBE
const faqs = [
  {
    q: "¿Cómo funcionan los precios especiales desde 3 y 5 unidades?",
    a: "Al llevar 3 o más unidades del mismo producto (por ejemplo, 3 Polos Boxy Fit) el precio por unidad baja; desde 5 baja aún más. Puedes combinar colores y tallas libremente. El descuento se aplica automáticamente en tu carrito.",
  },
  {
    q: "¿Puedo combinar productos distintos para llegar a 3 unidades?",
    a: "El precio por volumen se calcula por producto. Por ejemplo, 2 polos boxy fit + 1 jogger no activan el precio especial, pero 3 polos boxy fit de distintos colores sí.",
  },
  {
    q: "¿Qué tallas manejan?",
    a: "S, M y L. Revisa la guía de tallas de cada prenda: los fits oversized y boxy fit son amplios a propósito.",
  },
  {
    q: "¿Puedo elegir tallas distintas en un conjunto u oferta?",
    a: "Sí. En conjuntos y packs Shopping Days eliges la talla de cada prenda por separado.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Yape, Plin y transferencia bancaria. El pago con tarjeta estará disponible pronto.",
  },
]

export default function HelpPage() {
  return (
    <div className="page-container">
      <PageHeader title="Ayuda" crumbs={[{ label: "Ayuda" }]} />
      <div className="grid gap-12 md:grid-cols-12">
        <nav aria-label="Temas" className="md:col-span-3">
          <ul className="space-y-2 text-caption md:sticky md:top-[calc(var(--header-h)+24px)]">
            <li><a href="#envios" className="hover:underline">Envíos vía Shalom</a></li>
            <li><a href="#cambios" className="hover:underline">Cambios y devoluciones</a></li>
            <li><a href="#preguntas" className="hover:underline">Preguntas frecuentes</a></li>
            <li><Link href="/guia-de-tallas" className="hover:underline">Guía de tallas</Link></li>
          </ul>
        </nav>
        <div className="space-y-14 md:col-span-9">
          <section id="envios" className="scroll-mt-28">
            <h2 className="text-heading font-bold">Envíos vía Shalom</h2>
            <div className="mt-4 max-w-2xl space-y-3 text-body text-smoke-charcoal">
              <p>Enviamos a todo el Perú a través de Shalom. En el checkout eliges tu departamento, provincia, distrito y la agencia Shalom donde recogerás el pedido.</p>
              <p>Para recoger necesitas presentar el DNI registrado en tu pedido. Te enviamos la clave y el código de seguimiento por WhatsApp.</p>
            </div>
          </section>
          <section id="cambios" className="scroll-mt-28">
            <h2 className="text-heading font-bold">Cambios y devoluciones</h2>
            <div className="mt-4 max-w-2xl space-y-3 text-body text-smoke-charcoal">
              <p>Si necesitas cambiar una talla, escríbenos por WhatsApp con tu número de pedido. La prenda debe estar sin uso, con etiquetas y en su empaque original.</p>
              <p>
                <a href={site.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-black underline">
                  <WhatsAppIcon className="size-4" /> Escríbenos por WhatsApp
                </a>
              </p>
            </div>
          </section>
          <section id="preguntas" className="scroll-mt-28">
            <h2 className="text-heading font-bold">Preguntas frecuentes</h2>
            <Accordion className="mt-4 max-w-2xl border-t border-carbon-ink">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="rounded-none py-4 text-body">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-body text-smoke-charcoal">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  )
}
