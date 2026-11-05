"use client"

import { createContext, useContext } from "react"
import type { Catalog } from "@/lib/data/catalog"

/**
 * El catálogo se lee en el servidor (PostgreSQL) y se entrega a los componentes
 * de cliente (carrito, buscador, menús, favoritos) a través de este contexto.
 */
const CatalogContext = createContext<Catalog | null>(null)

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const catalog = useContext(CatalogContext)
  if (!catalog) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>")
  return catalog
}
