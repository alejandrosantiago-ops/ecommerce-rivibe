import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"
import { DEFAULT_SECTIONS, type HomeSection, type SectionData } from "@/lib/home"
import type { Prisma } from "@/generated/prisma/client"

/** Etiqueta de caché de la portada: el panel llama `updateTag(HOME_TAG)` al guardar */
export const HOME_TAG = "home"

type Row = Awaited<ReturnType<typeof db.homeSection.findMany>>[number]

export function toSection(row: Row): HomeSection {
  return {
    id: row.id,
    type: row.type,
    eyebrow: row.eyebrow ?? "",
    title: row.title ?? "",
    body: row.body ?? "",
    ctaLabel: row.ctaLabel ?? "",
    ctaHref: row.ctaHref ?? "",
    imageUrl: row.imageUrl ?? "",
    mobileImageUrl: row.mobileImageUrl ?? "",
    data: (row.data ?? {}) as SectionData,
    isVisible: row.isVisible,
    sortOrder: row.sortOrder,
  }
}

/** Bloques visibles de la portada, en orden. Si la tabla está vacía se usan los bloques por defecto. */
export async function getHomeSections(): Promise<HomeSection[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(HOME_TAG)

  const rows = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
  if (!rows.length) {
    return DEFAULT_SECTIONS.map((s, i) => ({ ...s, id: `default-${i}`, sortOrder: i, isVisible: true }))
  }
  return rows.map(toSection).filter((s) => s.isVisible)
}

/** Panel: todos los bloques (también los ocultos). La primera vez copia la portada por defecto a la BD. */
export async function getAdminHomeSections(): Promise<HomeSection[]> {
  if ((await db.homeSection.count()) === 0) {
    await db.homeSection.createMany({
      data: DEFAULT_SECTIONS.map((s, i) => ({ ...s, data: s.data as Prisma.InputJsonValue, sortOrder: i })),
      skipDuplicates: true,
    })
  }
  const rows = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
  return rows.map(toSection)
}
