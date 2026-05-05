import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { data: projects } = await supabase
    .from('projects')
    .select(`*, videos(id, status, video_url, thumbnail_url, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('id')
  if (!projectId) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })

  await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
