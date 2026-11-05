import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Acceso administradores · RIVIBE",
  robots: { index: false, follow: false },
}

/** Diseño del acceso al panel. La autenticación (Auth.js, rol ADMIN) llega en la fase 5. */
export default function AdminLoginPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="relative hidden bg-stone-gray md:block">
        <Image
          src="/images/hero/hero-2-mobile.png"
          alt=""
          fill
          preload
          sizes="50vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Image src="/images/brand/rivibe-logo-black.png" alt="RIVIBE" width={663} height={177} className="h-6 w-auto" />
          <h1 className="mt-10 text-[26px] font-normal">Panel de administración</h1>
          <p className="mt-2 text-[13px] text-smoke-charcoal">Acceso solo para el equipo RIVIBE.</p>
          <form action="/admin" className="mt-8 space-y-4">
            <label className="block">
              <span className="label-caps">Correo</span>
              <input
                type="email"
                required
                autoComplete="username"
                className="mt-1.5 h-11 w-full rounded-md border border-stone-gray px-3 text-[14px] focus:border-carbon-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="label-caps">Contraseña</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 h-11 w-full rounded-md border border-stone-gray px-3 text-[14px] focus:border-carbon-ink focus:outline-none"
              />
            </label>
            <button type="submit" className={cn(buttonVariants({ size: "cta" }), "h-12 w-full")}>
              Ingresar
            </button>
          </form>
          <Link href="/" className="mt-6 inline-block text-[12px] underline underline-offset-2">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
