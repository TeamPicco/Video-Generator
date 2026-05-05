import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_API_KEY! })

const STYLE_SUFFIX =
  'cinematic slow motion, dramatic lighting, luxury restaurant atmosphere, warm golden tones, professional cinematography, dark moody background'

export async function generateVideoClip(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  // Primary: Wan2.1 — günstigstes mit guter Qualität
  try {
    return await generateWithWan(imageUrl, prompt, duration)
  } catch (e) {
    console.error('Wan2.1 fehlgeschlagen, Fallback zu LTX:', e)
    return await generateWithLTX(imageUrl, prompt)
  }
}

async function generateWithWan(
  imageUrl: string,
  prompt: string,
  duration: number
): Promise<string> {
  const result = await fal.subscribe('fal-ai/wan/v2.1/image-to-video', {
    input: {
      image_url: imageUrl,
      prompt: `${prompt}, ${STYLE_SUFFIX}`,
      negative_prompt:
        'cartoon, anime, low quality, blur, bright colors, cheap, generic, stock footage',
      num_frames: Math.min(duration * 16, 81),
      num_inference_steps: 30,
      guidance_scale: 5,
      motion_strength: 0.7,
      resolution: '720p',
    },
    pollInterval: 5000,
    timeout: 300000,
  })

  const url = (result.data as any)?.video?.url
  if (!url) throw new Error('Wan: kein Video erhalten')
  return url
}

async function generateWithLTX(imageUrl: string, prompt: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/ltx-video/image-to-video', {
    input: {
      image_url: imageUrl,
      prompt: `${prompt}, ${STYLE_SUFFIX}`,
      negative_prompt: 'cartoon, low quality, bright colors',
      num_inference_steps: 25,
      guidance_scale: 3,
    } as any,
    pollInterval: 4000,
    timeout: 180000,
  })

  const url = (result.data as any)?.video?.url
  if (!url) throw new Error('LTX: kein Video erhalten')
  return url
}
