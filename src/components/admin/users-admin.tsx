"use client"

import { useState } from "react"
import { MoreHorizontal, UserPlus } from "lucide-react"

import { formatPrice } from "@/lib/catalog"
import { type UserRole, users } from "@/lib/admin-data"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CategoryTabs } from "@/components/product/category-tabs"
import { ActiveBadge, AdminPageHeader, Panel, StatTile, td, th } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

const inputCls =
  "mt-1.5 h-10 w-full rounded-md border border-stone-gray bg-white px-3 text-[13px] focus:border-carbon-ink focus:outline-none"

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

export function UsersAdmin() {
  const [role, setRole] = useState<UserRole | "todos">("todos")
  const [query, setQuery] = useState("")
  const [inviting, setInviting] = useState(false)

  const list = users.filter(
    (u) =>
      (role === "todos" || u.role === role) &&
      `${u.name} ${u.email} ${u.city}`.toLowerCase().includes(query.toLowerCase()),
  )
  const clients = users.filter((u) => u.role === "cliente")

  return (
    <>
      <AdminPageHeader
        title="Usuarios"
        description="Clientes registrados y equipo con acceso al panel"
        actions={
          <button type="button" onClick={() => setInviting(true)} className={cn(buttonVariants({ size: "cta" }))}>
            <UserPlus className="size-4" /> Invitar administrador
          </button>
        }
      />

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Clientes" value={String(clients.length)} note={`${clients.filter((u) => u.active).length} activos`} />
        <StatTile label="Administradores" value={String(users.length - clients.length)} />
        <StatTile
          label="Gasto promedio por cliente"
          value={formatPrice(clients.reduce((a, u) => a + u.spent, 0) / clients.length)}
        />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soft-mist px-4 py-3">
          <CategoryTabs
            items={[
              { value: "todos", label: "Todos" },
              { value: "cliente", label: "Clientes" },
              { value: "admin", label: "Administradores" },
            ].map((r) => ({ ...r, active: r.value === role, onSelect: () => setRole(r.value as UserRole | "todos") }))}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o ciudad"
            aria-label="Buscar usuario"
            className="h-9 w-full rounded-md border border-stone-gray px-3 text-[13px] focus:border-carbon-ink focus:outline-none sm:w-72"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-soft-mist">
              <tr>
                <th className={th}>Usuario</th>
                <th className={th}>Celular</th>
                <th className={th}>Ciudad</th>
                <th className={th}>Rol</th>
                <th className={cn(th, "text-right")}>Pedidos</th>
                <th className={cn(th, "text-right")}>Total gastado</th>
                <th className={th}>Registro</th>
                <th className={th}>Estado</th>
                <th className={th}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-mist">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-warm-fog/50">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                          u.role === "admin" ? "bg-carbon-ink text-white" : "bg-soft-mist",
                        )}
                      >
                        {initials(u.name)}
                      </span>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[11px] text-smoke-charcoal">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(td, "tabular-nums")}>{u.phone}</td>
                  <td className={td}>{u.city}</td>
                  <td className={td}>
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-[10px] font-medium tracking-label uppercase",
                        u.role === "admin" ? "bg-carbon-ink text-white" : "border border-stone-gray",
                      )}
                    >
                      {u.role === "admin" ? "Admin" : "Cliente"}
                    </span>
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>{u.role === "admin" ? "—" : u.orders}</td>
                  <td className={cn(td, "text-right tabular-nums")}>{u.role === "admin" ? "—" : formatPrice(u.spent)}</td>
                  <td className={cn(td, "text-smoke-charcoal tabular-nums")}>{u.joined}</td>
                  <td className={td}><ActiveBadge active={u.active} /></td>
                  <td className={cn(td, "text-right")}>
                    <button
                      type="button"
                      aria-label={`Acciones para ${u.name}`}
                      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Sheet open={inviting} onOpenChange={setInviting}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-md">
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              setInviting(false)
            }}
          >
            <div className="flex h-14 shrink-0 items-center border-b border-carbon-ink px-5">
              <SheetTitle className="label-caps">Invitar administrador</SheetTitle>
            </div>
            <div className="flex-1 space-y-4 p-5 text-[13px]">
              <label className="block">
                <span className="label-caps">Nombre</span>
                <input required className={inputCls} />
              </label>
              <label className="block">
                <span className="label-caps">Correo</span>
                <input type="email" required className={inputCls} />
              </label>
              <fieldset>
                <legend className="label-caps">Permisos</legend>
                <div className="mt-2 space-y-2">
                  {["Productos e inventario", "Pagos y pedidos", "Usuarios"].map((perm) => (
                    <label key={perm} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="size-4 accent-black" /> {perm}
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="text-[12px] text-smoke-charcoal">Recibirá un correo para crear su contraseña.</p>
            </div>
            <div className="border-t border-carbon-ink p-5">
              <button type="submit" className={cn(buttonVariants({ size: "cta" }), "w-full")}>Enviar invitación</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
