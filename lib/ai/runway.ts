import axios from 'axios'

const RUNWAY_API_URL = process.env.RUNWAY_API_URL || 'https://api.dev.runwayml.com/v1'
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY!
const KLING_API_URL = process.env.KLING_API_URL || 'https://api.klingai.com'
const KLING_API_KEY = process.env.KLING_API_KEY!

export async function generateVideoClip(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  try {
    return await generateWithRunway(imageUrl, prompt, duration)
  } catch (error) {
    console.error('Runway fehlgeschlagen, Fallback zu Kling:', error)
    return await generateWithKling(imageUrl, prompt, duration)
  }
}

async function generateWithRunway(
  imageUrl: string,
  prompt: string,
  duration: number
): Promise<string> {
  const enhancedPrompt = `${prompt}, cinematic slow motion, dramatic lighting, luxury restaurant atmosphere, warm golden tones, professional cinematography`

  const response = await axios.post(
    `${RUNWAY_API_URL}/image_to_video`,
    {
      promptImage: imageUrl,
      promptText: enhancedPrompt,
      model: 'gen4_turbo',
      duration: Math.min(duration, 10),
      ratio: '720:1280',
      watermark: false,
    },
    {
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
    }
  )

  const taskId = response.data.id
  if (!taskId) throw new Error('Kein Task-ID von Runway erhalten')

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const statusResponse = await axios.get(`${RUNWAY_API_URL}/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
    })

    const { status, output } = statusResponse.data
    if (status === 'SUCCEEDED' && output?.[0]) {
      return output[0] as string
    }
    if (status === 'FAILED') throw new Error('Runway Videogenerierung fehlgeschlagen')
  }

  throw new Error('Runway Timeout')
}

async function generateWithKling(
  imageUrl: string,
  prompt: string,
  duration: number
): Promise<string> {
  const response = await axios.post(
    `${KLING_API_URL}/v1/videos/image2video`,
    {
      model_name: 'kling-v1',
      image: imageUrl,
      prompt: `${prompt}, cinematic, luxury restaurant, warm tones`,
      duration: `${Math.min(duration, 10)}`,
      aspect_ratio: '9:16',
    },
    {
      headers: {
        Authorization: `Bearer ${KLING_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const taskId = response.data.data?.task_id
  if (!taskId) throw new Error('Kein Task-ID von Kling erhalten')

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const statusResponse = await axios.get(`${KLING_API_URL}/v1/videos/image2video/${taskId}`, {
      headers: { Authorization: `Bearer ${KLING_API_KEY}` },
    })

    const task = statusResponse.data.data
    if (task?.task_status === 'succeed' && task?.task_result?.videos?.[0]) {
      return task.task_result.videos[0].url as string
    }
    if (task?.task_status === 'failed') throw new Error('Kling Videogenerierung fehlgeschlagen')
  }

  throw new Error('Kling Timeout')
}
