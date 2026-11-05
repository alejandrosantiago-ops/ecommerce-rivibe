import { MessageCircle, Package, Ruler, Truck } from "lucide-react"

const items = [
  { icon: Truck, title: "Envíos a todo el Perú", text: "Despachamos vía Shalom a la agencia más cercana." },
  { icon: Package, title: "Precios por volumen", text: "Desde 3 y 5 unidades del mismo producto pagas menos." },
  { icon: Ruler, title: "Fits pensados", text: "Oversize y boxyfit con guía de tallas por prenda." },
  { icon: MessageCircle, title: "Atención directa", text: "Resolvemos tus dudas por WhatsApp." },
]

export function Benefits() {
  return (
    <section className="page-container pt-section">
      <ul className="grid grid-cols-2 border-t border-carbon-ink lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="py-8 pr-4">
            <Icon className="size-5" strokeWidth={1.25} />
            <h3 className="label-caps mt-4">{title}</h3>
            <p className="mt-2 max-w-[24ch] text-caption text-smoke-charcoal">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
