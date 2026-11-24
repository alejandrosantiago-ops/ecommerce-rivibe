import { createHash, randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Subida de imágenes del panel.
 * - Producción: Cloudinary (variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   o una sola CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD).
 * - Desarrollo sin Cloudinary: se guarda en public/uploads (solo sirve en tu computadora).
 */
type CloudinaryConfig = { cloud: string; key: string; secret: string }

function cloudinaryConfig(): CloudinaryConfig | null {
  const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    return { cloud: CLOUDINARY_CLOUD_NAME, key: CLOUDINARY_API_KEY, secret: CLOUDINARY_API_SECRET }
  }
  if (CLOUDINARY_URL) {
    const url = new URL(CLOUDINARY_URL)
    return { cloud: url.hostname, key: decodeURIComponent(url.username), secret: decodeURIComponent(url.password) }
  }
  return null
}

export type UploadResult = { url: string; width: number; height: number }

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }
export const ALLOWED_TYPES = Object.keys(EXT)
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export async function storeImage(file: File, size: { width: number; height: number }): Promise<UploadResult> {
  const cfg = cloudinaryConfig()
  if (cfg) {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = "rivibe"
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${cfg.secret}`).digest("hex")
    const body = new FormData()
    body.append("file", file)
    body.append("api_key", cfg.key)
    body.append("timestamp", String(timestamp))
    body.append("folder", folder)
    body.append("signature", signature)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/image/upload`, { method: "POST", body })
    const json = (await res.json()) as { secure_url?: string; width?: number; height?: number; error?: { message: string } }
    if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? "Cloudinary rechazó la imagen")
    return { url: json.secure_url, width: json.width ?? size.width, height: json.height ?? size.height }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta configurar Cloudinary (CLOUDINARY_URL) para subir imágenes en el sitio publicado.")
  }
  const dir = path.join(process.cwd(), "public", "uploads")
  await mkdir(dir, { recursive: true })
  const name = `${randomUUID()}.${EXT[file.type] ?? "jpg"}`
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
  return { url: `/uploads/${name}`, ...size }
}
