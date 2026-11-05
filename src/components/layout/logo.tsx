import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type LogoProps = {
  /** "dark" = letras negras (fondos claros) · "light" = letras blancas (fondos oscuros) */
  tone?: "dark" | "light"
  className?: string
  preload?: boolean
}

export function Logo({ tone = "dark", className, preload }: LogoProps) {
  return (
    <Link href="/" aria-label="RIVIBE — inicio" className={cn("inline-flex shrink-0", className)}>
      <Image
        src={tone === "dark" ? "/images/brand/rivibe-logo-black.png" : "/images/brand/rivibe-logo-white.png"}
        alt="RIVIBE"
        width={663}
        height={177}
        preload={preload}
        className="h-full w-auto"
      />
    </Link>
  )
}
