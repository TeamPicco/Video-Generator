import axios from 'axios'

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

export function isElevenLabsConfigured(): boolean {
  const key = process.env.ELEVENLABS_API_KEY
  return !!key && !key.includes('your_')
}

export async function generateVoiceover(script: string): Promise<Buffer | null> {
  if (!isElevenLabsConfigured()) {
    console.log('ElevenLabs nicht konfiguriert — Voice-Over übersprungen')
    return null
  }

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
    }
  )

  return Buffer.from(response.data)
}
