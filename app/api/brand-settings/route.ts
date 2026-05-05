import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOCAL_SETTINGS_PATH = path.join(process.cwd(), 'public', 'uploads', 'brand-settings.json')

function loadLocalSettings() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf-8'))
  } catch {
    return null
  }
}

function saveLocalSettings(settings: object) {
  fs.mkdirSync(path.dirname(LOCAL_SETTINGS_PATH), { recursive: true })
  fs.writeFileSync(LOCAL_SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export async function GET() {
  // Supabase falls konfiguriert
  const { isSupabaseConfigured } = await import('@/lib/supabase/server')
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    const { data } = await supabase.from('brand_settings').select().eq('user_id', user.id).single()
    return NextResponse.json({ settings: data })
  }

  // Lokaler Fallback
  const settings = loadLocalSettings()
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { isSupabaseConfigured } = await import('@/lib/supabase/server')
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    const { data, error } = await supabase
      .from('brand_settings')
      .upsert({ user_id: user.id, ...body })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ settings: data })
  }

  // Lokaler Fallback
  saveLocalSettings(body)
  return NextResponse.json({ settings: body })
}
