"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Video vertical (9:16) de RIVIBE (contacto, cuenta…). Se reproduce en silencio y en bucle
 * (los navegadores bloquean el autoplay con sonido); el cliente puede activar
 * el audio o pausarlo. Con "reducir movimiento" no arranca solo.
 */
export function StoreVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string
  poster: string
  /** Descripción del video para lectores de pantalla */
  label: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    video.play().catch(() => {
      /* el navegador puede bloquear el autoplay: queda la portada y el botón de play */
    })
  }, [])

  const togglePlay = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const toggleMute = () => {
    const video = ref.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    if (!video.muted && video.paused) void video.play()
  }

  const btn =
    "flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"

  return (
    <figure className={cn("relative overflow-hidden bg-carbon-ink", className)}>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={label}
      />
      {/* Arriba a la derecha: abajo chocaría con el botón flotante de WhatsApp */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pausar video" : "Reproducir video"} className={btn}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"} aria-pressed={!muted} className={btn}>
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </figure>
  )
}
