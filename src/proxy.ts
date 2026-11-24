import { NextResponse, type NextRequest } from "next/server"

/**
 * Filtro rápido del panel: sin cookie de sesión, /admin redirige al login.
 * La validación completa (sesión en BD + rol ADMIN) la hace `requireAdmin()` en cada página y acción.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next()
  if (!request.cookies.has("rivibe_admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
