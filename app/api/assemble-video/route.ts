import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
export const maxDuration = 300

const FFMPEG = process.env.FFMPEG_PATH ||
  path.join(process.cwd(), 'bin', 'ffmpeg')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  fs.writeFileSync(destPath, Buffer.from(response.data))
}

export async function POST(req: NextRequest) {
  const { projectId, videoId, userId, clipUrls, voiceoverUrl, hook, ctaText, scenes } =
    await req.json()

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `video-${projectId}-`))

  try {
    // Download all clips
    const clipPaths: string[] = []
    for (let i = 0; i < clipUrls.length; i++) {
      const clipPath = path.join(tmpDir, `clip_${i}.mp4`)
      await downloadFile(clipUrls[i], clipPath)
      clipPaths.push(clipPath)
    }

    // Download voiceover
    const voiceoverPath = path.join(tmpDir, 'voiceover.mp3')
    await downloadFile(voiceoverUrl, voiceoverPath)

    // Create concat list
    const concatListPath = path.join(tmpDir, 'concat.txt')
    const concatContent = clipPaths.map((p) => `file '${p}'`).join('\n')
    fs.writeFileSync(concatListPath, concatContent)

    // Assemble with FFmpeg: concat clips + voiceover + text overlays
    const outputPath = path.join(tmpDir, 'output.mp4')

    // macOS system font fallback
    const fontFile = fs.existsSync('/System/Library/Fonts/Helvetica.ttc')
      ? '/System/Library/Fonts/Helvetica.ttc'
      : fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
      ? '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
      : ''

    const fontParam = fontFile ? `:fontfile='${fontFile}'` : ''
    const hookFilter = `drawtext=text='${hook.replace(/'/g, "\\'")}':fontsize=52:fontcolor=white${fontParam}:x=(w-text_w)/2:y=h*0.12:enable='between(t,0,4)':box=1:boxcolor=black@0.4:boxborderw=12`
    const ctaFilter = `drawtext=text='${ctaText.replace(/'/g, "\\'")}':fontsize=44:fontcolor=#c9a84c${fontParam}:x=(w-text_w)/2:y=h*0.85:enable='gte(t,${scenes.length > 0 ? scenes.reduce((s: number, sc: { duration: number }) => s + sc.duration, 0) - 4 : 10})':box=1:boxcolor=black@0.5:boxborderw=10`

    const ffmpegCmd = [
      `"${FFMPEG}" -y`,
      `-f concat -safe 0 -i "${concatListPath}"`,
      `-i "${voiceoverPath}"`,
      '-filter_complex',
      `"[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,${hookFilter},${ctaFilter}[v]"`,
      '-map "[v]"',
      '-map 1:a',
      '-shortest',
      '-c:v libx264',
      '-preset fast',
      '-crf 22',
      '-c:a aac',
      '-b:a 192k',
      '-movflags +faststart',
      `"${outputPath}"`,
    ].join(' ')

    await execAsync(ffmpegCmd)

    // Upload to Supabase Storage
    const videoBuffer = fs.readFileSync(outputPath)
    const storagePath = `${userId}/${projectId}/${videoId}.mp4`

    await supabase.storage.from('videos').upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    })

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(storagePath)

    return NextResponse.json({ finalVideoUrl: urlData.publicUrl })
  } catch (error) {
    console.error('Assembly error:', error)
    return NextResponse.json({ error: 'Video-Montage fehlgeschlagen' }, { status: 500 })
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
