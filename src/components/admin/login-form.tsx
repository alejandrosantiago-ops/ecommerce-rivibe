"use client"

import { useActionState } from "react"

import { type LoginState, login } from "@/app/actions/admin/auth"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const inputCls =
  "mt-1.5 h-11 w-full rounded-md border border-stone-gray px-3 text-[14px] focus:border-carbon-ink focus:outline-none"

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="label-caps">Correo</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={state.email} className={inputCls} />
      </label>
      <label className="block">
        <span className="label-caps">Contraseña</span>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </label>
      {state.error && (
        <p role="alert" className="text-[13px] text-[#d03b3b]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "cta" }), "h-12 w-full")}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  )
}
