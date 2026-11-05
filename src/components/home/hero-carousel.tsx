"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { getImageProps } from "next/image"
import { Pause, Play } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Slide = {
  id: string
  title: string
  text: string
  cta: { label: string; href: string }
  desktop: { src: string; width: number; height: number; position: string }
  mobile: { src: string; width: number; height: number }
  alt: string
  /** Tinta del texto en escritorio según la foto: fondo gris oscuro → claro; muro claro → oscuro */
  tone: "light" | "dark"
  /** Lado vacío de la foto en escritorio, donde va el texto */
  align: "left" | "right"
}

const slides: Slide[] = [
  {
    id: "ofertas",
    title: "Más prendas, mejor precio",
    text: "Desde las 3 unidades, viste más y aprovecha nuestros precios especiales",
    cta: { label: "Descubrir ofertas", href: "/ofertas" },
    // Versión panorámica (fondo de estudio extendido a la izquierda): el modelo entra completo en pantallas anchas
    desktop: { src: "/images/hero/hero-1-wide.jpg", width: 2446, height: 941, position: "96% 50%" },
    mobile: { src: "/images/hero/hero-1-mobile.png", width: 1024, height: 1536 },
    alt: "Modelo con polo negro oversize y pantalón beige sobre fondo gris",
    tone: "light",
    align: "left",
  },
  {
    id: "conjuntos",
    title: "El outfit perfecto, en un solo set",
    text: "Tres prendas, un solo estilo. Encuentra conjuntos listos para combinar.",
    cta: { label: "Ver conjuntos", href: "/conjuntos" },
    desktop: { src: "/images/hero/hero-2.png", width: 1671, height: 941, position: "25% 30%" },
    mobile: { src: "/images/hero/hero-2-mobile.png", width: 1024, height: 1536 },
    alt: "Modelo con conjunto azul marino de hoodie con cierre y jogger frente a un muro claro",
    tone: "dark",
    align: "right",
  },
]

const AUTOPLAY_MS = 6500

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const touchX = useRef<number | null>(null)

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!playing || hovered || reduce) return
    const id = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [index, playing, hovered, go])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destacados"
      className="relative h-[calc(100svh-var(--announcement-h)-var(--header-h))] min-h-[520px] w-full overflow-hidden bg-stone-gray"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1)
        if (e.key === "ArrowLeft") go(index - 1)
      }}
    >
      {slides.map((slide, i) => (
        <HeroSlide key={slide.id} slide={slide} active={i === index} first={i === 0} position={i + 1} />
      ))}

      {/* DESIGN.md — paginación con barras finas de 30×2px */}
      <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2 md:bottom-7">
        {slides.map((slide, i) => {
          const light = slides[index].tone === "light"
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === index}
              className="group flex h-6 items-center"
            >
              <span
                className={cn(
                  "block h-0.5 w-8 transition-colors",
                  "portrait:bg-white/40 portrait:group-aria-[current=true]:bg-white",
                  light
                    ? "bg-white/40 group-aria-[current=true]:bg-white"
                    : "bg-black/20 group-aria-[current=true]:bg-black",
                )}
              />
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"}
          className={cn(
            "ml-2 flex size-6 items-center justify-center portrait:text-white",
            slides[index].tone === "light" ? "text-white" : "text-black",
          )}
        >
          {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
        </button>
      </div>
    </section>
  )
}

function HeroSlide({
  slide,
  active,
  first,
  position,
}: {
  slide: Slide
  active: boolean
  first: boolean
  position: number
}) {
  const common = { alt: slide.alt, sizes: "100vw" }
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, ...slide.desktop })
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, ...slide.mobile })

  const light = slide.tone === "light"

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} de ${slides.length}`}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0 transition-opacity duration-1000 ease-out",
        active ? "z-10 opacity-100" : "z-0 opacity-0",
      )}
    >
      <picture>
        <source media="(orientation: landscape)" srcSet={desktopSrcSet} />
        <source media="(orientation: portrait)" srcSet={mobileSrcSet} />
        <img
          {...imgProps}
          alt={slide.alt}
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
          style={{ objectPosition: slide.desktop.position }}
          className="absolute inset-0 h-full w-full object-cover portrait:object-[50%_30%]!"
        />
      </picture>

      {/* En vertical la foto ocupa todo: un velo inferior sutil asegura la lectura del texto */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-linear-to-t from-black/55 via-black/15 to-transparent portrait:block" />

      <div
        className={cn(
          "page-container relative flex h-full flex-col justify-center",
          "portrait:justify-end portrait:pb-20",
          slide.align === "right" ? "landscape:items-end" : "landscape:items-start",
        )}
      >
        <div
          className={cn(
            "max-w-md transition-all delay-200 duration-700 ease-out",
            active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            slide.align === "right" ? "landscape:mr-[4%]" : "landscape:ml-[2%]",
            light ? "text-white" : "text-black",
            "portrait:text-white",
          )}
        >
          {first ? (
            <h1 className="text-display font-normal md:text-[40px] md:leading-[1.1]">{slide.title}</h1>
          ) : (
            <h2 className="text-display font-normal md:text-[40px] md:leading-[1.1]">{slide.title}</h2>
          )}
          <p className={cn("mt-4 max-w-sm text-[14px]", light ? "text-white/85" : "text-black/75", "portrait:text-white/85")}>
            {slide.text}
          </p>
          <Link
            href={slide.cta.href}
            className={cn(
              buttonVariants({ variant: light ? "light" : "ink", size: "cta" }),
              "mt-7",
              !light &&
                "portrait:border-white portrait:text-white portrait:hover:bg-white portrait:hover:text-black",
            )}
          >
            {slide.cta.label}
          </Link>
        </div>
      </div>
    </div>
  )
}
