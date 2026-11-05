import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Inter = sustituto oficial de Favorit según DESIGN.md
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "RIVIBE — Ropa para hombre",
    template: "%s · RIVIBE",
  },
  description:
    "Polos oversized, boxy fit, camiseros, tank tops, joggers y conjuntos para hombre. Envíos a nivel nacional vía Shalom.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  )
}
