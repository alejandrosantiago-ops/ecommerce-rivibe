import { NextResponse } from "next/server"

import { getAdmin } from "@/lib/auth"
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, storeImage } from "@/lib/uploads"

/** POST multipart: file + width + height (el navegador ya la redujo a ≤ 2400 px) */
export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Sesión expirada" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No llegó ninguna imagen" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG o WebP)" }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "La imagen pesa más de 4 MB" }, { status: 400 })

  try {
    const result = await storeImage(file, {
      width: Number(form.get("width")) || 1200,
      height: Number(form.get("height")) || 1600,
    })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se pudo subir" }, { status: 500 })
  }
}
