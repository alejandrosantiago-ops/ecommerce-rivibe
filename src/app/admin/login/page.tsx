import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { AdminLoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Acceso administradores",
  robots: { index: false, follow: false },
}

/** Acceso al panel: solo usuarios con rol ADMIN (ver src/lib/auth.ts) */
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
          <AdminLoginForm />
          <Link href="/" className="mt-6 inline-block text-[12px] underline underline-offset-2">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
