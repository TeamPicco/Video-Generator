import { generateImage } from '@/lib/ai/fal-image'
import { generateVideoClip } from '@/lib/ai/fal-video'
import { generateVoiceover } from '@/lib/ai/elevenlabs'
import { createClient } from '@supabase/supabase-js'
import { isDemoMode, DEMO_VIDEO_URL } from '@/lib/demo-mode'
import type { Storyboard } from '@/lib/ai/claude'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || url.includes('your_') || !key || key.includes('your_')) return null
  return createClient(url, key)
}

export interface PipelineProgress {
  step: string
  progress: number
  message: string
}
export type ProgressCallback = (p: PipelineProgress) => void

export async function runVideoPipeline(
  projectId: string,
  videoId: string,
  userId: string,
  storyboard: Storyboard,
  ctaText: string,
  _ctaLink: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const prog = (step: string, pct: number, message: string) =>
    onProgress?.({ step, progress: pct, message })

  // Demo mode: simuliere Pipeline ohne echte API-Calls
  if (isDemoMode()) {
    prog('images', 5, 'Demo: Szenen werden generiert…')
    await sleep(1500)
    prog('images', 30, 'Demo: Keyframes bereit')
    await sleep(1000)
    prog('videos', 40, 'Demo: Video-Clips werden gerendert…')
    await sleep(2000)
    prog('videos', 65, 'Demo: Clips zusammengeführt')
    await sleep(1000)
    prog('audio', 70, 'Demo: Voice-Over wird aufgenommen…')
    await sleep(1200)
    prog('assembly', 80, 'Demo: Finaler Schnitt läuft…')
    await sleep(1500)
    prog('complete', 100, 'Demo abgeschlossen!')
    return DEMO_VIDEO_URL
  }

  const supabase = getSupabase()

  // Step 1: Bilder generieren
  prog('images', 5, 'Generiere Szenen-Bilder…')
  const imageUrls: string[] = []

  for (let i = 0; i < storyboard.scenes.length; i++) {
    prog('images', 5 + (i / storyboard.scenes.length) * 25, `Szene ${i + 1} wird gerendert…`)
    const url = await generateImage(storyboard.scenes[i].imagePrompt)
    imageUrls.push(url)

    await supabase
      ?.from('scenes')
      .update({ image_url: url, status: 'image_ready' })
      .eq('project_id', projectId)
      .eq('scene_index', i)
  }

  // Step 2: Video-Clips generieren
  prog('videos', 30, 'Generiere Video-Clips…')
  const clipUrls: string[] = []

  for (let i = 0; i < storyboard.scenes.length; i++) {
    prog('videos', 30 + (i / storyboard.scenes.length) * 35, `Video-Clip ${i + 1} wird erstellt…`)
    const url = await generateVideoClip(
      imageUrls[i],
      storyboard.scenes[i].videoPrompt,
      storyboard.scenes[i].duration
    )
    clipUrls.push(url)
  }

  // Step 3: Voice-Over (optional)
  prog('audio', 65, 'Generiere Voice-Over…')
  const voiceoverBuffer = await generateVoiceover(storyboard.voiceoverScript)

  // Step 4: Hochladen und assemblieren
  prog('assembly', 75, 'Schnitt & Montage…')

  let voiceoverUrl = ''
  if (voiceoverBuffer && supabase) {
    const voiceoverPath = `${userId}/${projectId}/voiceover.mp3`
    await supabase.storage.from('videos').upload(voiceoverPath, voiceoverBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })
    const { data } = supabase.storage.from('videos').getPublicUrl(voiceoverPath)
    voiceoverUrl = data.publicUrl
  }

  const assembleRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assemble-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      videoId,
      userId,
      clipUrls,
      voiceoverUrl,
      hook: storyboard.hook,
      ctaText,
      scenes: storyboard.scenes,
    }),
  })

  if (!assembleRes.ok) throw new Error('Video-Montage fehlgeschlagen')
  const { finalVideoUrl } = await assembleRes.json()

  prog('complete', 100, 'Masterpiece fertig!')

  await supabase
    ?.from('videos')
    .update({ status: 'completed', video_url: finalVideoUrl })
    .eq('id', videoId)

  return finalVideoUrl
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
