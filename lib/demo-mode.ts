// Demo mode: aktiv wenn weder Anthropic noch fal.ai Key gesetzt sind
export function isDemoMode(): boolean {
  const anthropic = process.env.ANTHROPIC_API_KEY
  const fal = process.env.FAL_API_KEY
  const noAnthropic = !anthropic || anthropic.includes('your_')
  const noFal = !fal || fal.includes('your_')
  return noAnthropic && noFal
}

export const DEMO_STORYBOARD = {
  title: 'Das perfekte Tomahawk Ribeye',
  hook: 'Wenn Gold auf Feuer trifft…',
  voiceoverScript:
    'Unser Tomahawk Ribeye — 45 Tage dry-aged, über offenem Feuer vollendet. Ein Erlebnis, das du nicht vergisst. Reserviere jetzt deinen Tisch.',
  caption: 'Kein Steak wie dieses. Jetzt Tisch sichern.',
  hashtags: ['steakhouse', 'driedaged', 'tomahawk', 'premium', 'finedining'],
  cta: 'Jetzt Tisch reservieren',
  scenes: [
    {
      index: 0,
      description: 'Extreme Macro-Aufnahme: Marmorierung des rohen Tomahawks im Kerzenlicht',
      imagePrompt: 'extreme macro close-up raw tomahawk ribeye steak, beautiful marbling, candlelight, dark background, cinematic, 4K, dramatic lighting, warm gold tones, photorealistic, luxury steakhouse',
      videoPrompt: 'slow zoom into marbling of raw tomahawk steak, candlelight flickering, cinematic slow motion, dark dramatic atmosphere',
      duration: 5,
    },
    {
      index: 1,
      description: 'Steak landet auf glühendem Grill — Feuer, Rauch, Dampf',
      imagePrompt: 'tomahawk steak hitting hot grill, dramatic fire and smoke, dark restaurant kitchen, cinematic, 4K, warm tones, photorealistic',
      videoPrompt: 'tomahawk steak placed on glowing hot grill, fire and smoke burst, slow motion, dramatic lighting',
      duration: 5,
    },
    {
      index: 2,
      description: 'Fertig gegrillt auf dunklem Holzbrett serviert',
      imagePrompt: 'perfectly grilled tomahawk ribeye on dark wooden board, melting herb butter, fresh rosemary, dark elegant restaurant, cinematic 4K',
      videoPrompt: 'beautifully plated tomahawk steak on dark board, herb butter melting slowly, cinematic reveal, warm golden light',
      duration: 6,
    },
  ],
}

export const DEMO_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
