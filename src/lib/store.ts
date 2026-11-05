"use client"

import { useSyncExternalStore } from "react"

/**
 * Store mínimo para estado de cliente (carrito, favoritos, UI).
 * Con `storageKey` persiste en localStorage; si el navegador lo bloquea, sigue funcionando en memoria.
 * En la fase 3 el carrito pasará a la base de datos (tabla Cart) y este store será solo caché.
 */
export function createStore<T>(initial: T, storageKey?: string) {
  let state = initial
  let loaded = !storageKey
  const listeners = new Set<() => void>()

  const load = () => {
    if (loaded || typeof window === "undefined") return
    loaded = true
    try {
      const raw = window.localStorage.getItem(storageKey!)
      if (raw) state = JSON.parse(raw) as T
    } catch {
      /* almacenamiento no disponible */
    }
  }

  const store = {
    get: () => {
      load()
      return state
    },
    set: (next: T | ((prev: T) => T)) => {
      load()
      state = typeof next === "function" ? (next as (prev: T) => T)(state) : next
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(state))
        } catch {
          /* almacenamiento no disponible */
        }
      }
      listeners.forEach((l) => l())
    },
    subscribe: (listener: () => void) => {
      load()
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  const useStore = () => useSyncExternalStore(store.subscribe, store.get, () => initial)

  return { ...store, useStore }
}
