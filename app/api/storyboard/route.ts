import { NextRequest, NextResponse } from 'next/server'
import { generateStoryboard } from '@/lib/ai/claude'
import { isDemoMode, DEMO_STORYBOARD } from '@/lib/demo-mode'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  let storyboard
  if (isDemoMode()) {
    // Demo-Modus: echtes Storyboard-Template zurückgeben
    await new Promise((r) => setTimeout(r, 1200)) // realistisches Delay
    storyboard = DEMO_STORYBOARD
  } else {
    storyboard = await generateStoryboard({
      templateType: body.templateType,
      steakName: body.steakName,
      price: body.price,
      occasion: body.occasion,
      tone: body.tone,
      ctaType: body.ctaType,
      restaurantName: body.restaurantName,
    })
  }

  // Wenn Supabase konfiguriert: in DB speichern
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: project } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: storyboard.title,
          template_type: body.templateType,
          status: 'draft',
          storyboard,
        })
        .select()
        .single()

      if (project) {
        await supabase.from('scenes').insert(
          storyboard.scenes.map((scene) => ({
            project_id: project.id,
            scene_index: scene.index,
            description: scene.description,
            image_prompt: scene.imagePrompt,
            video_prompt: scene.videoPrompt,
            status: 'pending',
          }))
        )
        return NextResponse.json({ project, storyboard })
      }
    }
  }

  // Demo-Fallback: temporäre ID
  return NextResponse.json({
    project: { id: `demo-${Date.now()}`, name: storyboard.title, template_type: body.templateType, status: 'draft' },
    storyboard,
  })
}
