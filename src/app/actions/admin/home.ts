"use server"

import { updateTag } from "next/cache"

import { db } from "@/lib/db"
import { assertAdmin } from "@/lib/auth"
import { HOME_TAG, toSection } from "@/lib/data/home"
import {
  BENEFIT_ICONS,
  CUSTOM_SECTION_TYPES,
  type HomeSection,
  SECTION_META,
  type SectionData,
  type SectionType,
  newSectionDefaults,
} from "@/lib/home"
import type { Prisma } from "@/generated/prisma/client"

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }
const fail = (error: string) => ({ ok: false as const, error })

const okImage = (url: string) => !url || url.startsWith("/") || url.startsWith("https://res.cloudinary.com/")
const okHref = (href: string) => !href || href.startsWith("/") || /^https:\/\//.test(href)

export type SectionInput = Pick<
  HomeSection,
  "id" | "eyebrow" | "title" | "body" | "ctaLabel" | "ctaHref" | "imageUrl" | "mobileImageUrl" | "data"
>

function validate(type: SectionType, s: SectionInput): string | null {
  if (!okHref(s.ctaHref)) return "El enlace del botón debe empezar con / (página de la tienda) o https://"
  if (s.ctaLabel && !s.ctaHref) return "Escribe a dónde lleva el botón."
  if (!okImage(s.imageUrl) || !okImage(s.mobileImageUrl)) return "Sube las imágenes con el botón “Subir foto”."
  if (type === "BANNER" && !s.imageUrl) return "El banner necesita una foto."
  if (type === "HERO") {
    const slides = s.data.slides ?? []
    if (!slides.length) return "La portada necesita al menos una diapositiva."
    for (const [i, sl] of slides.entries()) {
      if (!sl.title.trim()) return `La diapositiva ${i + 1} necesita un título.`
      if (!sl.desktop.src || !sl.mobile.src) return `La diapositiva ${i + 1} necesita foto horizontal y vertical.`
      if (!okImage(sl.desktop.src) || !okImage(sl.mobile.src)) return `Sube las fotos de la diapositiva ${i + 1} con el botón.`
      if (!okHref(sl.ctaHref)) return `El enlace del botón de la diapositiva ${i + 1} debe empezar con /`
    }
  }
  if (type === "BENEFITS" && (s.data.items ?? []).some((it) => !it.title.trim() || !BENEFIT_ICONS.includes(it.icon))) {
    return "Cada beneficio necesita un título."
  }
  return null
}

/** Solo se guardan las claves de `data` que usa cada tipo */
function cleanData(type: SectionType, data: SectionData): SectionData {
  switch (type) {
    case "HERO":
      return { slides: data.slides ?? [] }
    case "BENEFITS":
      return { items: data.items ?? [] }
    case "VOLUME_PRICING":
    case "PRODUCTS":
      return { productSlugs: data.productSlugs ?? [] }
    case "BANNER":
      return { align: data.align ?? "left", tone: data.tone ?? "dark" }
    default:
      return {}
  }
}

export async function saveSection(input: SectionInput): Promise<Result<HomeSection>> {
  await assertAdmin()
  const current = await db.homeSection.findUnique({ where: { id: input.id } })
  if (!current) return fail("Este bloque ya no existe. Recarga la página.")
  const s = {
    ...input,
    eyebrow: input.eyebrow.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    ctaLabel: input.ctaLabel.trim(),
    ctaHref: input.ctaHref.trim(),
  }
  const invalid = validate(current.type, s)
  if (invalid) return fail(invalid)

  const fields = SECTION_META[current.type].fields
  const row = await db.homeSection.update({
    where: { id: s.id },
    data: {
      eyebrow: fields.includes("eyebrow") ? s.eyebrow || null : null,
      title: fields.includes("title") ? s.title || null : null,
      body: fields.includes("body") ? s.body || null : null,
      ctaLabel: fields.includes("cta") ? s.ctaLabel || null : null,
      ctaHref: fields.includes("cta") ? s.ctaHref || null : null,
      imageUrl: fields.includes("image") ? s.imageUrl || null : null,
      mobileImageUrl: fields.includes("mobileImage") ? s.mobileImageUrl || null : null,
      data: cleanData(current.type, s.data) as Prisma.InputJsonValue,
    },
  })
  updateTag(HOME_TAG)
  return { ok: true, data: toSection(row) }
}

export async function createSection(type: SectionType, afterId?: string): Promise<Result<HomeSection>> {
  await assertAdmin()
  if (!CUSTOM_SECTION_TYPES.includes(type)) return fail("Ese tipo de bloque no se puede agregar.")
  const rows = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true } })
  const position = afterId ? rows.findIndex((r) => r.id === afterId) + 1 : rows.length
  const defaults = newSectionDefaults(type)

  const created = await db.$transaction(async (tx) => {
    const row = await tx.homeSection.create({
      data: { ...defaults, data: defaults.data as Prisma.InputJsonValue, sortOrder: position, isVisible: false },
    })
    const ids = rows.map((r) => r.id)
    ids.splice(position, 0, row.id)
    for (const [i, id] of ids.entries()) await tx.homeSection.update({ where: { id }, data: { sortOrder: i } })
    return { ...row, sortOrder: position }
  })
  updateTag(HOME_TAG)
  return { ok: true, data: toSection(created) }
}

export async function deleteSection(id: string): Promise<Result> {
  await assertAdmin()
  const row = await db.homeSection.findUnique({ where: { id } })
  if (!row) return { ok: true }
  if (!SECTION_META[row.type].custom) return fail("Este bloque es fijo: puedes ocultarlo, pero no borrarlo.")
  await db.homeSection.delete({ where: { id } })
  updateTag(HOME_TAG)
  return { ok: true }
}

export async function setSectionVisible(id: string, isVisible: boolean): Promise<Result> {
  await assertAdmin()
  await db.homeSection.update({ where: { id }, data: { isVisible } })
  updateTag(HOME_TAG)
  return { ok: true }
}

export async function reorderSections(ids: string[]): Promise<Result> {
  await assertAdmin()
  await db.$transaction(ids.map((id, i) => db.homeSection.update({ where: { id }, data: { sortOrder: i } })))
  updateTag(HOME_TAG)
  return { ok: true }
}
