import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_API_KEY! })

const STYLE_SUFFIX =
  'cinematic, 4K, dramatic lighting, dark background, warm gold tones, photorealistic, luxury steakhouse, professional food photography, bokeh background, moody atmosphere, ultra-detailed'

export async function generateImage(prompt: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
    input: {
      prompt: `${prompt}, ${STYLE_SUFFIX}`,
      image_size: { width: 1080, height: 1920 },
      guidance_scale: 3.5,
      num_images: 1,
      safety_tolerance: '5',
      output_format: 'jpeg',
    } as any,
    pollInterval: 3000,
  })

  const url = (result.data as any)?.images?.[0]?.url
  if (!url) throw new Error('Flux: kein Bild erhalten')
  return url
}
