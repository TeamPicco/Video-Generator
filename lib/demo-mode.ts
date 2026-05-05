// Demo mode: true wenn keine echten API-Keys konfiguriert sind
export function isDemoMode(): boolean {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  return !anthropicKey || anthropicKey.includes('your_')
}

export const DEMO_STORYBOARD = {
  title: 'Das perfekte Tomahawk Ribeye',
  hook: 'Wenn Gold auf Feuer trifft…',
  voiceoverScript:
    'Unser Tomahawk Ribeye — 45 Tage dry-aged, über offenem Feuer vollendet. Ein Erlebnis, das du nicht vergisst. Reserviere jetzt deinen Tisch.',
  caption: 'Kein Steak wie dieses. 🥩 Jetzt Tisch sichern.',
  hashtags: ['steakhouse', 'driedaged', 'tomahawk', 'premium', 'finedining'],
  cta: 'Jetzt Tisch reservieren',
  scenes: [
    {
      index: 0,
      description: 'Extreme Macro-Aufnahme: Marmorierung des rohen Tomahawks im Kerzenlicht',
      imagePrompt:
        'extreme macro close-up raw tomahawk ribeye steak, beautiful marbling, candlelight, dark background, cinematic, 4K, dramatic lighting, warm gold tones, photorealistic, luxury steakhouse',
      videoPrompt:
        'slow zoom into marbling of raw tomahawk steak, candlelight flickering, cinematic slow motion, dark dramatic atmosphere',
      duration: 5,
    },
    {
      index: 1,
      description: 'Steak landet auf dem glühenden Grill — Feuer, Rauch, Dampf',
      imagePrompt:
        'tomahawk steak hitting hot grill, dramatic fire and smoke, dark restaurant kitchen, cinematic, 4K, warm tones, photorealistic, professional food photography',
      videoPrompt:
        'tomahawk steak placed on glowing hot grill, fire and smoke burst, slow motion, dramatic lighting, luxury restaurant kitchen',
      duration: 5,
    },
    {
      index: 2,
      description: 'Chef dreht das Steak — professionelle Handbewegung, Grill-Marks sichtbar',
      imagePrompt:
        'chef hands turning perfect tomahawk steak on grill, beautiful grill marks, dark kitchen, cinematic 4K, dramatic lighting, warm tones',
      videoPrompt:
        'chef confidently turns tomahawk steak revealing perfect grill marks, slow motion, dramatic kitchen lighting, professional',
      duration: 5,
    },
    {
      index: 3,
      description: 'Fertig gegrillt — wird auf dunklem Holzbrett serviert, Rosmarin, Butter',
      imagePrompt:
        'perfectly grilled tomahawk ribeye on dark wooden board, melting herb butter, fresh rosemary, dark elegant restaurant, cinematic 4K, luxury food photography',
      videoPrompt:
        'beautifully plated tomahawk steak on dark board, herb butter melting slowly, restaurant ambiance, cinematic reveal, warm golden light',
      duration: 6,
    },
    {
      index: 4,
      description: 'Anschnitt in Zeitlupe — der perfekte rosa Kern',
      imagePrompt:
        'slicing through perfect medium-rare tomahawk steak, beautiful pink center, dramatic dark background, cinematic 4K, macro detail, warm gold tones',
      videoPrompt:
        'knife slicing through tomahawk steak in extreme slow motion, revealing perfect pink medium-rare center, dramatic lighting, steam rising',
      duration: 6,
    },
  ],
}

export const DEMO_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
