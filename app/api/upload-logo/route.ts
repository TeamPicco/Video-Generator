import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('logo') as File | null
  if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Nur PNG, JPG, SVG, WEBP erlaubt' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Datei zu groß (max. 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const filename = `logo.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  fs.mkdirSync(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
