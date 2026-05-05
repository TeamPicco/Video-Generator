import { NextRequest, NextResponse } from 'next/server'
import { generateStoryboard } from '@/lib/ai/claude'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await req.json()

  try {
    const storyboard = await generateStoryboard({
      templateType: body.templateType,
      steakName: body.steakName,
      price: body.price,
      occasion: body.occasion,
      tone: body.tone,
      ctaType: body.ctaType,
      restaurantName: body.restaurantName,
    })

    // Create project in DB
    const { data: project, error } = await supabase
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

    if (error) throw error

    // Create scene records
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
  } catch (error) {
    console.error('Storyboard-Fehler:', error)
    return NextResponse.json({ error: 'Storyboard-Generierung fehlgeschlagen' }, { status: 500 })
  }
}
