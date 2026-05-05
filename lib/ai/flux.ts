import axios from 'axios'

const FLUX_API_URL = process.env.FLUX_API_URL || 'https://api.us1.bfl.ai/v1'
const FLUX_API_KEY = process.env.FLUX_API_KEY!

export async function generateImage(prompt: string): Promise<string> {
  const enhancedPrompt = `${prompt}, cinematic, 4K, dramatic lighting, dark background, warm gold tones, photorealistic, luxury steakhouse, professional food photography, bokeh background, slow motion style, vertical format 9:16`

  const submitResponse = await axios.post(
    `${FLUX_API_URL}/flux-pro-1.1`,
    {
      prompt: enhancedPrompt,
      width: 1080,
      height: 1920,
      prompt_upsampling: true,
      safety_tolerance: 2,
      output_format: 'jpeg',
    },
    {
      headers: {
        'x-key': FLUX_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  )

  const taskId = submitResponse.data.id
  if (!taskId) throw new Error('Kein Task-ID von Flux erhalten')

  // Poll for result
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const resultResponse = await axios.get(
      `${FLUX_API_URL}/get_result?id=${taskId}`,
      {
        headers: { 'x-key': FLUX_API_KEY },
      }
    )

    if (resultResponse.data.status === 'Ready') {
      return resultResponse.data.result.sample as string
    }
    if (resultResponse.data.status === 'Error') {
      throw new Error('Flux Bildgenerierung fehlgeschlagen')
    }
  }

  throw new Error('Flux Timeout — Bild konnte nicht generiert werden')
}
