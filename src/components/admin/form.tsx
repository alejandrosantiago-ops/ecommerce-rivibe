"use client"

import { useId, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react"

import type { ImageRef } from "@/lib/home"
import { cn } from "@/lib/utils"

/* ------------------------------- campos ------------------------------- */

export const inputCls =
  "mt-1.5 h-10 w-full rounded-md border border-stone-gray bg-white px-3 text-[13px] focus:border-carbon-ink focus:outline-none disabled:bg-soft-mist"
export const textareaCls =
  "mt-1.5 min-h-24 w-full rounded-md border border-stone-gray bg-white px-3 py-2 text-[13px] focus:border-carbon-ink focus:outline-none"

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label-caps">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-smoke-charcoal">{hint}</span>}
    </label>
  )
}

export function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-soft-mist pt-5">
      <legend className="label-caps">{legend}</legend>
      {hint && <p className="mt-1 text-[12px] text-smoke-charcoal">{hint}</p>}
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

/** Mensaje de error de un formulario del panel */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="border border-[#d03b3b]/30 bg-[#d03b3b]/5 px-3 py-2 text-[13px] text-[#b42c2c]">
      {message}
    </p>
  )
}

/** "Polo Oversize Negro" → "polo-oversize-negro" */
export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/* ------------------------------ imágenes ------------------------------ */

const MAX_SIDE = 2400

/** Reduce la foto en el navegador (máx. 2400 px, JPEG/WebP) para subir rápido y no pasar de 4 MB */
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number; type: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  // PNG pequeños (logos, flats con transparencia) se suben tal cual
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return { blob: file, width, height, type: file.type }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height)
  const type = file.type === "image/png" ? "image/webp" : "image/jpeg"
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), type, 0.86),
  )
  return { blob, width, height, type }
}

export async function uploadImage(file: File): Promise<ImageRef> {
  const { blob, width, height, type } = await prepare(file)
  const body = new FormData()
  body.append("file", new File([blob], file.name, { type }))
  body.append("width", String(width))
  body.append("height", String(height))
  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const json = (await res.json().catch(() => ({}))) as { url?: string; width?: number; height?: number; error?: string }
  if (!res.ok || !json.url) throw new Error(json.error ?? "No se pudo subir la imagen")
  return { src: json.url, width: json.width ?? width, height: json.height ?? height }
}

/** Mide una imagen pegada por URL */
function measure(src: string): Promise<ImageRef> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve({ src, width: img.naturalWidth || 1200, height: img.naturalHeight || 1600 })
    img.onerror = () => resolve({ src, width: 1200, height: 1600 })
    img.src = src
  })
}

function useUploader(onDone: (refs: ImageRef[]) => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = async (files: File[]) => {
    if (!files.length) return
    setBusy(true)
    setError(null)
    try {
      const refs: ImageRef[] = []
      for (const f of files) refs.push(await uploadImage(f))
      onDone(refs)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen")
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, setError, run }
}

function UrlPrompt({ onSubmit, onCancel }: { onSubmit: (url: string) => void; onCancel: () => void }) {
  const [url, setUrl] = useState("")
  return (
    <div className="mt-2 flex gap-2">
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (url.trim()) onSubmit(url.trim())
          }
          if (e.key === "Escape") onCancel()
        }}
        placeholder="https://… o /images/…"
        className={cn(inputCls, "mt-0")}
      />
      <button
        type="button"
        onClick={() => url.trim() && onSubmit(url.trim())}
        className="h-10 shrink-0 rounded-md border border-carbon-ink px-3 text-[12px] hover:bg-carbon-ink hover:text-white"
      >
        Usar
      </button>
    </div>
  )
}

/** Una sola imagen (portada de sección, foto de color, banner…) */
export function ImageField({
  value,
  onChange,
  aspect = "aspect-[3/4]",
  className,
  fit = "cover",
  allowClear = true,
}: {
  value: string
  onChange: (ref: ImageRef | null) => void
  aspect?: string
  className?: string
  fit?: "cover" | "contain"
  allowClear?: boolean
}) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [asking, setAsking] = useState(false)
  const { busy, error, run } = useUploader((refs) => onChange(refs[0]))

  return (
    <div className={className}>
      <div className={cn("group relative overflow-hidden border border-soft-mist bg-warm-fog/60", aspect)}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa en el panel
          <img src={value} alt="" className={cn("absolute inset-0 h-full w-full", fit === "cover" ? "object-cover" : "object-contain")} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-smoke-charcoal">Sin imagen</span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
        {value && allowClear && !busy && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar imagen"
            className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100 max-md:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <label
          htmlFor={inputId}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-stone-gray px-2.5 text-[12px] hover:border-carbon-ink"
        >
          <ImagePlus className="size-3.5" /> {value ? "Cambiar" : "Subir foto"}
        </label>
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void run(Array.from(e.target.files ?? []).slice(0, 1))
            e.target.value = ""
          }}
        />
        <button
          type="button"
          onClick={() => setAsking((a) => !a)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-stone-gray px-2.5 text-[12px] hover:border-carbon-ink"
        >
          <Link2 className="size-3.5" /> URL
        </button>
      </div>
      {asking && (
        <UrlPrompt
          onCancel={() => setAsking(false)}
          onSubmit={async (url) => {
            setAsking(false)
            onChange(await measure(url))
          }}
        />
      )}
      {error && <p className="mt-1.5 text-[12px] text-[#b42c2c]">{error}</p>}
    </div>
  )
}

/** Galería ordenable (fotos de un producto). La primera es la principal. */
export function ImageListField({ values, onChange }: { values: string[]; onChange: (urls: string[]) => void }) {
  const inputId = useId()
  const [asking, setAsking] = useState(false)
  const { busy, error, run } = useUploader((refs) => onChange([...values, ...refs.map((r) => r.src)]))

  const move = (i: number, dir: -1 | 1) => {
    const next = [...values]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((src, i) => (
          <li key={`${src}-${i}`} className="group relative aspect-[3/4] overflow-hidden border border-soft-mist bg-warm-fog/60">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa en el panel */}
            <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-carbon-ink px-1.5 py-0.5 text-[9px] tracking-label text-white uppercase">
                Principal
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda" className="flex size-7 items-center justify-center disabled:opacity-30">
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="Quitar foto" className="flex size-7 items-center justify-center text-[#b42c2c]">
                <X className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === values.length - 1} aria-label="Mover a la derecha" className="flex size-7 items-center justify-center disabled:opacity-30">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
        <li>
          <label
            htmlFor={inputId}
            className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-stone-gray text-[11px] text-smoke-charcoal hover:border-carbon-ink"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" strokeWidth={1.25} />}
            {busy ? "Subiendo…" : "Subir fotos"}
          </label>
          <input
            id={inputId}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              void run(Array.from(e.target.files ?? []))
              e.target.value = ""
            }}
          />
        </li>
      </ul>
      <button type="button" onClick={() => setAsking((a) => !a)} className="mt-2 inline-flex items-center gap-1.5 text-[12px] underline underline-offset-2">
        <Link2 className="size-3.5" /> Agregar por URL
      </button>
      {asking && (
        <UrlPrompt
          onCancel={() => setAsking(false)}
          onSubmit={(url) => {
            setAsking(false)
            onChange([...values, url])
          }}
        />
      )}
      {error && <p className="mt-1.5 text-[12px] text-[#b42c2c]">{error}</p>}
    </div>
  )
}
