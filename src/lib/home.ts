/**
 * Bloques editables de la página de inicio (tipos y valores por defecto).
 * Se guardan en la tabla HomeSection y se editan desde /admin/inicio.
 * Este archivo no toca la BD: lo usan el seed, la tienda y el panel.
 */

export type SectionType =
  | "HERO"
  | "CATEGORIES"
  | "BEST_SELLERS"
  | "OFFERS"
  | "VOLUME_PRICING"
  | "SETS"
  | "BENEFITS"
  | "BANNER"
  | "PRODUCTS"
  | "TEXT"

export type ImageRef = { src: string; width: number; height: number }

export type HeroSlide = {
  id: string
  title: string
  text: string
  ctaLabel: string
  ctaHref: string
  desktop: ImageRef
  mobile: ImageRef
  /** Encuadre de la foto en escritorio (CSS object-position), ej. "50% 50%" */
  position: string
  alt: string
  /** Color del texto en escritorio: "light" = texto blanco (foto oscura), "dark" = texto negro (foto clara) */
  tone: "light" | "dark"
  /** Lado de la foto donde va el texto en escritorio */
  align: "left" | "right"
}

export const BENEFIT_ICONS = ["truck", "package", "ruler", "message", "star", "shield", "tag", "heart", "store"] as const
export type BenefitIcon = (typeof BENEFIT_ICONS)[number]
export type BenefitItem = { icon: BenefitIcon; title: string; text: string }

export type SectionData = {
  slides?: HeroSlide[]
  items?: BenefitItem[]
  /** VOLUME_PRICING y PRODUCTS: productos elegidos, en orden */
  productSlugs?: string[]
  /** BANNER: lado del texto y color de la tinta */
  align?: "left" | "right" | "center"
  tone?: "light" | "dark"
}

export type HomeSection = {
  id: string
  type: SectionType
  eyebrow: string
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  mobileImageUrl: string
  data: SectionData
  isVisible: boolean
  sortOrder: number
}

/** Qué campos muestra el editor del panel para cada tipo */
export const SECTION_META: Record<
  SectionType,
  {
    label: string
    description: string
    /** La marca puede crear más bloques de este tipo y borrarlos */
    custom: boolean
    fields: ("eyebrow" | "title" | "body" | "cta" | "image" | "mobileImage")[]
  }
> = {
  HERO: { label: "Portada (carrusel)", description: "Fotos grandes con título y botón", custom: false, fields: [] },
  CATEGORIES: {
    label: "Compra por sección",
    description: "Las secciones de productos con su portada",
    custom: false,
    fields: ["eyebrow", "title", "cta"],
  },
  BEST_SELLERS: {
    label: "Lo más vendido",
    description: "Productos marcados como más vendidos, con pestañas por sección",
    custom: false,
    fields: ["eyebrow", "title", "cta"],
  },
  OFFERS: {
    label: "Ofertas",
    description: "Los packs de tipo oferta",
    custom: false,
    fields: ["eyebrow", "title", "cta"],
  },
  VOLUME_PRICING: {
    label: "Precios por volumen",
    description: "Tabla 1–2 / 3–4 / 5+ unidades de los productos que elijas",
    custom: false,
    fields: ["eyebrow", "title", "body", "cta"],
  },
  SETS: {
    label: "Conjuntos",
    description: "Fotos grandes de los conjuntos",
    custom: false,
    fields: ["eyebrow", "title", "cta"],
  },
  BENEFITS: { label: "Beneficios", description: "Íconos con texto corto", custom: false, fields: [] },
  BANNER: {
    label: "Banner con imagen",
    description: "Foto a todo el ancho con título, texto y botón",
    custom: true,
    fields: ["eyebrow", "title", "body", "cta", "image", "mobileImage"],
  },
  PRODUCTS: {
    label: "Grilla de productos",
    description: "Productos que tú eliges, con título",
    custom: true,
    fields: ["eyebrow", "title", "cta"],
  },
  TEXT: {
    label: "Bloque de texto",
    description: "Título y párrafo centrados, con botón opcional",
    custom: true,
    fields: ["eyebrow", "title", "body", "cta"],
  },
}

export const CUSTOM_SECTION_TYPES = (Object.keys(SECTION_META) as SectionType[]).filter((t) => SECTION_META[t].custom)

/* ------------------------------ por defecto ------------------------------ */

type SectionSeed = Omit<HomeSection, "id" | "sortOrder" | "isVisible"> & { isVisible?: boolean }

const blank = { eyebrow: "", title: "", body: "", ctaLabel: "", ctaHref: "", imageUrl: "", mobileImageUrl: "" }

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "ofertas",
    title: "Más prendas, mejor precio",
    text: "Desde las 3 unidades, viste más y aprovecha nuestros precios especiales",
    ctaLabel: "Descubrir ofertas",
    ctaHref: "/ofertas",
    // Versión panorámica (fondo de estudio extendido a la izquierda): el modelo entra completo en pantallas anchas
    desktop: { src: "/images/hero/hero-1-wide.jpg", width: 2446, height: 941 },
    mobile: { src: "/images/hero/hero-1-mobile.png", width: 1024, height: 1536 },
    position: "96% 50%",
    alt: "Modelo con polo negro oversize y pantalón beige sobre fondo gris",
    tone: "light",
    align: "left",
  },
  {
    id: "conjuntos",
    title: "El outfit perfecto, en un solo set",
    text: "Tres prendas, un solo estilo. Encuentra conjuntos listos para combinar.",
    ctaLabel: "Ver conjuntos",
    ctaHref: "/conjuntos",
    desktop: { src: "/images/hero/hero-2.png", width: 1671, height: 941 },
    mobile: { src: "/images/hero/hero-2-mobile.png", width: 1024, height: 1536 },
    position: "25% 30%",
    alt: "Modelo con conjunto azul marino de hoodie con cierre y jogger frente a un muro claro",
    tone: "dark",
    align: "right",
  },
]

export const DEFAULT_SECTIONS: SectionSeed[] = [
  { ...blank, type: "HERO", data: { slides: DEFAULT_SLIDES } },
  { ...blank, type: "CATEGORIES", title: "Compra por sección", ctaLabel: "Ver productos", ctaHref: "/productos", data: {} },
  { ...blank, type: "BEST_SELLERS", title: "Lo más vendido", ctaLabel: "Ver catálogo", ctaHref: "/catalogo", data: {} },
  {
    ...blank,
    type: "OFFERS",
    eyebrow: "Shopping Days",
    title: "Ofertas por tiempo limitado",
    ctaLabel: "Ver ofertas",
    ctaHref: "/ofertas",
    data: {},
  },
  {
    ...blank,
    type: "VOLUME_PRICING",
    eyebrow: "Precios por volumen",
    title: "Desde 3 y 5 unidades, pagas menos por cada una",
    body:
      "Lleva 3 o 5 unidades del mismo producto y combina los colores y tallas que quieras. El precio especial se activa automáticamente en tu carrito.",
    ctaLabel: "Armar mi pedido",
    ctaHref: "/catalogo",
    data: {
      productSlugs: [
        "polo-basic-boxy-fit",
        "polo-basic-oversized",
        "jogger-baggy-basic",
        "hoodie-basic-oversized",
        "camisero-piquet",
      ],
    },
  },
  {
    ...blank,
    type: "SETS",
    eyebrow: "Conjuntos",
    title: "El outfit perfecto, en un solo set",
    ctaLabel: "Ver conjuntos",
    ctaHref: "/conjuntos",
    data: {},
  },
  {
    ...blank,
    type: "BENEFITS",
    data: {
      items: [
        { icon: "truck", title: "Envíos a todo el Perú", text: "Despachamos vía Shalom a la agencia más cercana." },
        { icon: "package", title: "Precios por volumen", text: "Desde 3 y 5 unidades del mismo producto pagas menos." },
        { icon: "ruler", title: "Fits pensados", text: "Oversize y boxyfit con guía de tallas por prenda." },
        { icon: "message", title: "Atención directa", text: "Resolvemos tus dudas por WhatsApp." },
      ],
    },
  },
]

/** Contenido inicial de un bloque nuevo creado desde el panel */
export function newSectionDefaults(type: SectionType): SectionSeed {
  switch (type) {
    case "BANNER":
      return {
        ...blank,
        type,
        eyebrow: "Nueva colección",
        title: "Título del banner",
        body: "Un texto corto que invite a ver la colección.",
        ctaLabel: "Ver más",
        ctaHref: "/catalogo",
        imageUrl: "/images/hero/hero-2.png",
        data: { align: "left", tone: "dark" },
      }
    case "PRODUCTS":
      return { ...blank, type, title: "Nuevos ingresos", ctaLabel: "Ver catálogo", ctaHref: "/catalogo", data: { productSlugs: [] } }
    case "TEXT":
      return {
        ...blank,
        type,
        eyebrow: "RIVIBE",
        title: "Estilo + comodidad + actitud",
        body: "Cuenta aquí algo sobre la marca, una novedad o una campaña.",
        data: {},
      }
    default:
      return DEFAULT_SECTIONS.find((s) => s.type === type) ?? { ...blank, type, data: {} }
  }
}
