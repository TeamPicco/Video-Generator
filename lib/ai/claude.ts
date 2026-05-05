import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a premium creative director specializing in high-end restaurant marketing, specifically steakhouses. You create cinematic, conversion-focused Instagram video concepts that feel expensive, sophisticated, and appetite-inducing. Never suggest anything that looks cheap, cartoonish, or generic. Every idea should increase purchase intent. Output always in German unless specified otherwise.

Visual style rules for all prompts:
- Always include: cinematic, 4K, dramatic lighting, dark background, warm tones, photorealistic, professional food photography, luxury restaurant
- Color palette: deep black (#0a0a0a), warm gold (#c9a84c), dark red-brown (#3d1a0e), off-white (#f5f0e8)
- Never: bright backgrounds, cartoon elements, stock photo feeling, emoji overuse
- Yes: slow motion, bokeh, candlelight atmosphere, macro shots, smoke effects on hot plates`

export interface StoryboardScene {
  index: number
  description: string
  imagePrompt: string
  videoPrompt: string
  duration: number
}

export interface Storyboard {
  title: string
  hook: string
  voiceoverScript: string
  caption: string
  hashtags: string[]
  cta: string
  scenes: StoryboardScene[]
}

export interface GenerateStoryboardParams {
  templateType: string
  steakName?: string
  price?: string
  occasion?: string
  tone?: string
  ctaType?: string
  restaurantName?: string
}

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  perfect_steak: 'Das perfekte Steak – Dry-Aged / Ribeye / Tomahawk Close-Up',
  dinner_atmosphere: 'Dinner-Atmosphäre – Ambiance, Kerzenlicht, elegante Gäste',
  chef_at_work: 'Chef at Work – Küche, Grillszenen, Zubereitung',
  special_offer: 'Special Offer – Wochen-Special, Preis, CTA',
  event_promo: 'Event-Promo – Wine & Dine Night, Valentinstag, etc.',
  online_voucher: 'Online-Gutschein – Direkt-CTA für Online-Kauf',
}

export async function generateStoryboard(params: GenerateStoryboardParams): Promise<Storyboard> {
  const templateDesc = TEMPLATE_DESCRIPTIONS[params.templateType] || params.templateType

  const userMessage = `Erstelle ein vollständiges Video-Storyboard für Instagram Reels (9:16, 15-30 Sekunden) mit folgendem Kontext:

Template: ${templateDesc}
${params.steakName ? `Steak/Produkt: ${params.steakName}` : ''}
${params.price ? `Preis: ${params.price}` : ''}
${params.occasion ? `Anlass: ${params.occasion}` : ''}
${params.tone ? `Ton/Stil: ${params.tone}` : 'Ton: luxuriös, cinematic'}
${params.restaurantName ? `Restaurant: ${params.restaurantName}` : ''}
${params.ctaType ? `Call-to-Action Typ: ${params.ctaType}` : ''}

Antworte AUSSCHLIESSLICH mit validem JSON in diesem Format:
{
  "title": "Kurzer Video-Titel",
  "hook": "Hook-Text für die ersten 3 Sekunden (max. 8 Wörter, Aufmerksamkeit packend)",
  "voiceoverScript": "Voice-Over Text für 10-20 Sekunden (natürlich gesprochen, appetitanregend)",
  "caption": "Instagram Caption (emotional, max. 150 Zeichen)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "cta": "Call-to-Action Text (max. 5 Wörter, z.B. 'Jetzt Tisch reservieren')",
  "scenes": [
    {
      "index": 0,
      "description": "Was passiert in dieser Szene (für den Editor)",
      "imagePrompt": "Detaillierter englischer Prompt für Flux Pro Bildgenerierung, cinematic style",
      "videoPrompt": "Detaillierter englischer Prompt für Runway Gen-4 Videogenerierung, camera movement included",
      "duration": 4
    }
  ]
}

Erstelle 4-5 Szenen. Jede imagePrompt und videoPrompt muss auf Englisch sein und immer enthalten: "cinematic, 4K, dramatic lighting, dark background, warm gold tones, photorealistic, luxury steakhouse, professional food photography, bokeh background, slow motion".`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unerwarteter Response-Typ von Claude')

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Kein valides JSON in Claude Response')

  return JSON.parse(jsonMatch[0]) as Storyboard
}

export async function generateCaptionVariants(storyboard: Storyboard): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generiere 3 verschiedene Instagram Caption-Varianten für dieses Video:
Titel: ${storyboard.title}
Hook: ${storyboard.hook}

Antworte mit JSON Array: ["Caption 1", "Caption 2", "Caption 3"]
Jede Caption max. 150 Zeichen, emotional, auf Deutsch.`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Fehler')
  const match = content.text.match(/\[[\s\S]*\]/)
  if (!match) return [storyboard.caption]
  return JSON.parse(match[0])
}
