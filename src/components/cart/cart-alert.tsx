"use client"

import { X } from "lucide-react"
import { dismissCartError } from "@/lib/cart-store"

/** Aviso del servidor (ej. "solo quedan 2 disponibles") */
export function CartAlert({ message, className }: { message?: string; className?: string }) {
  if (!message) return null
  return (
    <div role="alert" className={`flex items-start gap-3 border-l-2 border-[#d03b3b] bg-[#d03b3b]/5 px-4 py-2.5 text-caption ${className ?? ""}`}>
      <p className="flex-1">{message}</p>
      <button type="button" onClick={dismissCartError} aria-label="Cerrar aviso" className="shrink-0 opacity-60 hover:opacity-100">
        <X className="size-3.5" />
      </button>
    </div>
  )
}
