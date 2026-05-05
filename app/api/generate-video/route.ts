import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_VIDEOS_PER_DAY = parseInt(process.env.MAX_VIDEOS_PER_DAY || '10')

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  // Rate limit check
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('videos_generated')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (usage && usage.videos_generated >= MAX_VIDEOS_PER_DAY) {
    return NextResponse.json(
      { error: `Tages-Limit erreicht (${MAX_VIDEOS_PER_DAY} Videos/Tag)` },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { projectId, storyboard, ctaText, ctaLink } = body

  // Verify project belongs to user
  const { data: project } = await supabase
    .from('projects')
    .select()
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })

  // Create video record
  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      project_id: projectId,
      user_id: user.id,
      status: 'generating',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })

  // Update project status
  await supabase.from('projects').update({ status: 'generating' }).eq('id', projectId)

  // Update daily usage
  await supabase.from('usage_tracking').upsert({
    user_id: user.id,
    date: today,
    videos_generated: (usage?.videos_generated || 0) + 1,
  })

  // Return video ID immediately — pipeline runs async via SSE
  return NextResponse.json({ videoId: video.id, projectId })
}
