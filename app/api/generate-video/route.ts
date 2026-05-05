import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo-mode'

const MAX_VIDEOS_PER_DAY = parseInt(process.env.MAX_VIDEOS_PER_DAY || '10')

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Demo-Modus: kein Rate-Limiting, keine DB
  if (isDemoMode()) {
    return NextResponse.json({ videoId: `demo-${Date.now()}`, projectId: body.projectId })
  }

  const { isSupabaseConfigured } = await import('@/lib/supabase/server')
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ videoId: `local-${Date.now()}`, projectId: body.projectId })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('videos_generated')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (usage && usage.videos_generated >= MAX_VIDEOS_PER_DAY) {
    return NextResponse.json({ error: `Tages-Limit von ${MAX_VIDEOS_PER_DAY} Videos erreicht` }, { status: 429 })
  }

  const { data: video } = await supabase
    .from('videos')
    .insert({ project_id: body.projectId, user_id: user.id, status: 'generating' })
    .select()
    .single()

  await supabase.from('usage_tracking').upsert({
    user_id: user.id,
    date: today,
    videos_generated: (usage?.videos_generated || 0) + 1,
  })

  return NextResponse.json({ videoId: video?.id || `video-${Date.now()}`, projectId: body.projectId })
}
