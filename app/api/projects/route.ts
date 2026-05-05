import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOCAL_PATH = path.join(process.cwd(), 'public', 'uploads', 'projects.json')

function loadLocal(): any[] {
  try { return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8')) } catch { return [] }
}
function saveLocal(projects: any[]) {
  fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true })
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(projects, null, 2))
}

export async function GET() {
  const { isSupabaseConfigured } = await import('@/lib/supabase/server')

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

    const { data: projects } = await supabase
      .from('projects')
      .select('*, videos(id, status, video_url, thumbnail_url, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ projects })
  }

  // Lokaler Fallback
  return NextResponse.json({ projects: loadLocal() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { isSupabaseConfigured } = await import('@/lib/supabase/server')

  if (!isSupabaseConfigured()) {
    const projects = loadLocal()
    const newProject = { id: `local-${Date.now()}`, ...body, created_at: new Date().toISOString(), videos: [] }
    projects.unshift(newProject)
    saveLocal(projects)
    return NextResponse.json({ project: newProject })
  }

  return NextResponse.json({ error: 'Nicht implementiert' }, { status: 501 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('id')
  if (!projectId) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })

  const { isSupabaseConfigured } = await import('@/lib/supabase/server')

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id)
  } else {
    const projects = loadLocal().filter((p) => p.id !== projectId)
    saveLocal(projects)
  }

  return NextResponse.json({ success: true })
}
