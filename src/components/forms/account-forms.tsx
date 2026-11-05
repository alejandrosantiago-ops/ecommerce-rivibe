"use client"

import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { TextField } from "@/components/forms/fields"
import { cn } from "@/lib/utils"

/** Login / registro (fase UI). La autenticación real llega con Auth.js en la fase 5. */
export function AccountForms() {
  const [tab, setTab] = useState<"login" | "registro">("login")
  const [notice, setNotice] = useState(false)

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 border-b border-carbon-ink" role="tablist">
        {(["login", "registro"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t)
              setNotice(false)
            }}
            className={cn("label-caps h-11", tab === t ? "bg-carbon-ink text-white" : "hover:bg-soft-mist")}
          >
            {t === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form
        className="mt-8 grid gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setNotice(true)
        }}
      >
        {tab === "registro" && (
          <>
            <TextField label="Nombre y apellido" name="nombre" required autoComplete="name" />
            <TextField label="Celular" name="celular" type="tel" required autoComplete="tel" />
          </>
        )}
        <TextField label="Correo" name="email" type="email" required autoComplete="email" />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={tab === "login" ? "current-password" : "new-password"}
        />
        {tab === "login" && (
          <button type="button" className="justify-self-start text-caption underline underline-offset-2">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        <button type="submit" className={cn(buttonVariants({ size: "cta" }), "h-12")}>
          {tab === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
        {notice && (
          <p role="status" className="bg-warm-fog px-4 py-3 text-caption">
            Las cuentas estarán disponibles pronto. Mientras tanto puedes comprar como invitado.
          </p>
        )}
      </form>
    </div>
  )
}
