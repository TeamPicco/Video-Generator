import { NextRequest } from 'next/server'
import { runVideoPipeline } from '@/lib/video/pipeline'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { projectId, videoId, storyboard, ctaText, ctaLink } = await req.json()

  const userId = 'demo-user'
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = (data: object) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch {}
  }

  runVideoPipeline(
    projectId,
    videoId || `video-${Date.now()}`,
    userId,
    storyboard,
    ctaText || 'Jetzt reservieren',
    ctaLink || '',
    (progress) => send({ type: 'progress', ...progress })
  )
    .then((url) => {
      send({ type: 'complete', videoUrl: url })
      writer.close()
    })
    .catch((error) => {
      send({ type: 'error', message: error.message })
      writer.close()
    })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
