import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
export const maxDuration = 300

const FFMPEG = process.env.FFMPEG_PATH || path.join(process.cwd(), 'bin', 'ffmpeg')

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  fs.writeFileSync(destPath, Buffer.from(response.data))
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !url.startsWith('http') || url.includes('your_') || !key || key.includes('your_')) {
    return null
  }
  const { createClient } = require('@supabase/supabase-js')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const { projectId, videoId, userId, clipUrls, voiceoverUrl, hook, ctaText, scenes } =
    await req.json()

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `video-${Date.now()}-`))

  try {
    // Download video clips
    const clipPaths: string[] = []
    for (let i = 0; i < clipUrls.length; i++) {
      const clipPath = path.join(tmpDir, `clip_${i}.mp4`)
      await downloadFile(clipUrls[i], clipPath)
      clipPaths.push(clipPath)
    }

    // Concat list
    const concatListPath = path.join(tmpDir, 'concat.txt')
    fs.writeFileSync(concatListPath, clipPaths.map((p) => `file '${p}'`).join('\n'))

    const outputPath = path.join(tmpDir, 'output.mp4')

    // Font detection (macOS / Linux)
    const fontFile = [
      '/System/Library/Fonts/Helvetica.ttc',
      '/System/Library/Fonts/Arial.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ].find((f) => fs.existsSync(f)) || ''

    const fontParam = fontFile ? `:fontfile='${fontFile}'` : ''
    const totalDuration = scenes.reduce((s: number, sc: { duration: number }) => s + sc.duration, 0)
    const safeHook = hook.replace(/'/g, '').replace(/[^\w\s.,!?–—]/g, '').slice(0, 50)
    const safeCta = ctaText.replace(/'/g, '').replace(/[^\w\s.,!?]/g, '').slice(0, 30)

    const hookFilter = `drawtext=text='${safeHook}':fontsize=52:fontcolor=white${fontParam}:x=(w-text_w)/2:y=h*0.12:enable='between(t,0,4)':box=1:boxcolor=black@0.5:boxborderw=12`
    const ctaFilter  = `drawtext=text='${safeCta}':fontsize=44:fontcolor=#c9a84c${fontParam}:x=(w-text_w)/2:y=h*0.85:enable='gte(t,${Math.max(totalDuration - 5, 5)})':box=1:boxcolor=black@0.5:boxborderw=10`

    // Download voiceover only if URL provided
    let voiceoverPath = ''
    if (voiceoverUrl) {
      voiceoverPath = path.join(tmpDir, 'voiceover.mp3')
      try { await downloadFile(voiceoverUrl, voiceoverPath) } catch { voiceoverPath = '' }
    }

    const hasAudio = !!voiceoverPath && fs.existsSync(voiceoverPath)

    const ffmpegParts = [
      `"${FFMPEG}" -y`,
      `-f concat -safe 0 -i "${concatListPath}"`,
      hasAudio ? `-i "${voiceoverPath}"` : '',
      '-filter_complex',
      `"[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,${hookFilter},${ctaFilter}[v]"`,
      '-map "[v]"',
      hasAudio ? '-map 1:a -shortest -c:a aac -b:a 192k' : '',
      '-c:v libx264 -preset fast -crf 22',
      '-movflags +faststart',
      `"${outputPath}"`,
    ].filter(Boolean).join(' ')

    const { stdout, stderr } = await execAsync(ffmpegParts)
    if (!fs.existsSync(outputPath)) {
      console.error('FFmpeg stderr:', stderr)
      throw new Error('FFmpeg hat keine Ausgabedatei erstellt')
    }

    const videoBuffer = fs.readFileSync(outputPath)

    // Supabase Storage wenn konfiguriert
    const supabase = getSupabase()
    if (supabase) {
      const storagePath = `${userId}/${projectId}/${videoId}.mp4`
      await supabase.storage.from('videos').upload(storagePath, videoBuffer, {
        contentType: 'video/mp4', upsert: true,
      })
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(storagePath)
      return NextResponse.json({ finalVideoUrl: urlData.publicUrl })
    }

    // Lokaler Fallback: in public/videos/ speichern
    const localDir = path.join(process.cwd(), 'public', 'videos')
    fs.mkdirSync(localDir, { recursive: true })
    const filename = `${videoId || Date.now()}.mp4`
    fs.writeFileSync(path.join(localDir, filename), videoBuffer)

    return NextResponse.json({ finalVideoUrl: `/videos/${filename}` })

  } catch (error: any) {
    console.error('Assembly error:', error?.message || error)
    return NextResponse.json({ error: 'Video-Montage fehlgeschlagen: ' + (error?.message || '') }, { status: 500 })
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
