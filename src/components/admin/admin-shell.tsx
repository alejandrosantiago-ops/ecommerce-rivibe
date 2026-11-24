"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, ExternalLink, FolderTree, LayoutGrid, LayoutTemplate, LogOut, Menu, Package, Users } from "lucide-react"

import { logout } from "@/app/actions/admin/auth"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Resumen", icon: LayoutGrid },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/secciones", label: "Secciones", icon: FolderTree },
  { href: "/admin/inicio", label: "Página de inicio", icon: LayoutTemplate },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <ul className="space-y-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition-colors",
                active ? "bg-carbon-ink text-white" : "text-smoke-charcoal hover:bg-soft-mist hover:text-black",
              )}
            >
              <Icon className="size-4" strokeWidth={1.5} />
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <Image src="/images/brand/rivibe-logo-black.png" alt="RIVIBE" width={663} height={177} className="h-4 w-auto" />
      <span className="border border-carbon-ink px-1.5 py-0.5 text-[9px] font-medium tracking-label uppercase">Admin</span>
    </Link>
  )
}

function SidebarFooter() {
  return (
    <div className="space-y-1 border-t border-soft-mist pt-4">
      <Link
        href="/"
        className="flex h-9 items-center gap-3 rounded-md px-3 text-[13px] text-smoke-charcoal hover:bg-soft-mist hover:text-black"
      >
        <ExternalLink className="size-4" strokeWidth={1.5} /> Ver tienda
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-[13px] text-smoke-charcoal hover:bg-soft-mist hover:text-black"
        >
          <LogOut className="size-4" strokeWidth={1.5} /> Cerrar sesión
        </button>
      </form>
    </div>
  )
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

export function AdminShell({ admin, children }: { admin: { name: string; email: string }; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-warm-fog/40">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-carbon-ink bg-white px-4 py-5 lg:flex">
        <Brand />
        <nav aria-label="Administración" className="mt-8 flex-1">
          <NavList />
        </nav>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-carbon-ink bg-white px-4 md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger aria-label="Abrir menú" className="-ml-1 inline-flex size-9 items-center justify-center lg:hidden">
              <Menu className="size-5" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 rounded-none border-carbon-ink px-4 py-5 shadow-none">
              <SheetTitle className="sr-only">Menú de administración</SheetTitle>
              <Brand />
              <nav aria-label="Administración" className="mt-8 flex-1">
                <NavList onNavigate={() => setOpen(false)} />
              </nav>
              <SidebarFooter />
            </SheetContent>
          </Sheet>
          <div className="lg:hidden">
            <Brand />
          </div>


          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-medium">{admin.name}</p>
              <p className="text-[11px] text-smoke-charcoal">Administrador</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-carbon-ink text-[11px] font-medium text-white">
              {initials(admin.name)}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
