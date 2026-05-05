import { generateImage } from '@/lib/ai/flux'
import { generateVideoClip } from '@/lib/ai/runway'
import { generateVoiceover } from '@/lib/ai/elevenlabs'
import { createClient } from '@supabase/supabase-js'
import type { Storyboard } from '@/lib/ai/claude'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface PipelineProgress {
  step: string
  progress: number
  message: string
}

export type ProgressCallback = (progress: PipelineProgress) => void

export async function runVideoPipeline(
  projectId: string,
  videoId: string,
  userId: string,
  storyboard: Storyboard,
  ctaText: string,
  ctaLink: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const progress = (step: string, pct: number, message: string) => {
    onProgress?.({ step, progress: pct, message })
  }

  // Step 1: Generate keyframe images
  progress('images', 5, 'Generiere Szenen-Bilder...')
  const imageUrls: string[] = []

  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i]
    progress('images', 5 + (i / storyboard.scenes.length) * 25, `Szene ${i + 1} wird gerendert...`)

    const imageUrl = await generateImage(scene.imagePrompt)
    imageUrls.push(imageUrl)

    await supabase
      .from('scenes')
      .update({ image_url: imageUrl, status: 'image_ready' })
      .eq('project_id', projectId)
      .eq('scene_index', i)
  }

  // Step 2: Generate video clips
  progress('videos', 30, 'Generiere Video-Clips...')
  const clipUrls: string[] = []

  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i]
    progress('videos', 30 + (i / storyboard.scenes.length) * 35, `Video-Clip ${i + 1} wird erstellt...`)

    const clipUrl = await generateVideoClip(imageUrls[i], scene.videoPrompt, scene.duration)
    clipUrls.push(clipUrl)

    await supabase
      .from('scenes')
      .update({ video_clip_url: clipUrl, status: 'completed' })
      .eq('project_id', projectId)
      .eq('scene_index', i)
  }

  // Step 3: Generate voiceover
  progress('audio', 65, 'Generiere Voice-Over...')
  const voiceoverBuffer = await generateVoiceover(storyboard.voiceoverScript)

  // Step 4: Store voiceover in Supabase
  const voiceoverPath = `${userId}/${projectId}/voiceover.mp3`
  await supabase.storage.from('videos').upload(voiceoverPath, voiceoverBuffer, {
    contentType: 'audio/mpeg',
    upsert: true,
  })

  const { data: voiceoverUrlData } = supabase.storage
    .from('videos')
    .getPublicUrl(voiceoverPath)

  // Step 5: Assemble final video via FFmpeg API route
  progress('assembly', 75, 'Schnitt & Montage...')

  const assembleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assemble-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      videoId,
      userId,
      clipUrls,
      voiceoverUrl: voiceoverUrlData.publicUrl,
      hook: storyboard.hook,
      ctaText,
      ctaLink,
      scenes: storyboard.scenes,
    }),
  })

  if (!assembleResponse.ok) {
    throw new Error('Video-Montage fehlgeschlagen')
  }

  const { finalVideoUrl } = await assembleResponse.json()

  progress('complete', 100, 'Masterpiece fertig!')

  await supabase
    .from('videos')
    .update({ status: 'completed', video_url: finalVideoUrl })
    .eq('id', videoId)

  return finalVideoUrl
}
