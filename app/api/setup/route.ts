import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const values = await req.json() as Record<string, string>

  const envPath = path.join(process.cwd(), '.env.local')
  let existing = ''
  try {
    existing = fs.readFileSync(envPath, 'utf-8')
  } catch {}

  // Parse existing env
  const lines = existing.split('\n')
  const envMap: Record<string, string> = {}
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key?.trim()) envMap[key.trim()] = rest.join('=').trim()
  }

  // Merge new values
  for (const [key, val] of Object.entries(values)) {
    if (val) envMap[key] = val
  }

  // Write back
  const newContent = Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n'

  fs.writeFileSync(envPath, newContent)

  return NextResponse.json({ ok: true })
}
