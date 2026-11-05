export const site = {
  name: "RIVIBE",
  tagline: "Estilo + comodidad + actitud",
  announcement: "Envíos a nivel nacional vía Shalom",
  whatsappUrl: "https://wa.link/gyeqjf",
  instagramUrl: "https://www.instagram.com/rivibe___/",
  instagramHandle: "@rivibe___",
  tiktokUrl: "https://www.tiktok.com/@rivibe.pe",
  tiktokHandle: "@rivibe.pe",
}

/** Tienda física en Gamarra (La Victoria, Lima) */
export const store = {
  name: "RIVIBE — Galería Kristales",
  address: "Galería Kristales · Jr. Agustín Gamarra 1095",
  unit: "Tienda 508 · Piso 5",
  district: "Gamarra, La Victoria, Lima",
  /** Búsqueda en Google Maps: muestra la ficha de Kristales Plaza con el pin exacto */
  mapsQuery: "Kristales Plaza, Agustín Gamarra 1095, La Victoria, Lima",
  /** Enlace compartido por RIVIBE */
  mapsLink: "https://maps.app.goo.gl/ptGXhmEbGTGwmhxp9",
  geo: { lat: -12.0691642, lng: -77.0128427 },
  hours: { label: "Lunes a sábado", time: "10:30 a.m. – 7:00 p.m.", opens: "10:30", closes: "19:00" },
}

export const mapsEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`
/** Ruta en Google Maps hasta el punto exacto de la tienda */
export const mapsDirectionsUrl = (geo: { lat: number; lng: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`

/** "Productos" abre el menú por secciones (ver ProductsMenu) */
export const mainNav = [
  { label: "Productos", href: "/productos", menu: true },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Conjuntos", href: "/conjuntos" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Tienda", href: "/tienda" },
  { label: "Contacto", href: "/contacto" },
] as const

export const helpLinks = [
  { label: "Guía de tallas", href: "/guia-de-tallas" },
  { label: "Envíos vía Shalom", href: "/ayuda#envios" },
  { label: "Cambios y devoluciones", href: "/ayuda#cambios" },
  { label: "Preguntas frecuentes", href: "/ayuda#preguntas" },
  { label: "Nuestra tienda", href: "/tienda" },
]
