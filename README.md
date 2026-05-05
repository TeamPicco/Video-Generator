# Steakhouse Video AI — Cinematic Content Generator

KI-gestützter Video-Generator für Premium-Steakhouse Marketing. Erstellt vollautomatisch cinematic Instagram Reels (9:16, 1080×1920) mit Storyboard, Szenen, Voice-Over und Schnitt.

---

## Features

- **6 Templates**: Perfektes Steak, Dinner-Atmosphäre, Chef at Work, Special Offer, Event-Promo, Online-Gutschein
- **KI-Pipeline**: Claude (Storyboard) → Flux Pro (Keyframes) → Runway Gen-4 (Video) → ElevenLabs (Voice-Over) → FFmpeg (Schnitt)
- **Runway Fallback**: Automatisch Kling AI wenn Runway nicht verfügbar
- **Brand-System**: Restaurant-Name, CTA-Links, Dark-Theme mit Gold-Akzenten
- **Auth**: Supabase Auth (E-Mail/Passwort)
- **Ratelimit**: 10 Videos/Tag, 30 Tage Speicher
- **Output**: MP4, 9:16, 1080×1920, 15–30 Sekunden

---

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. API-Keys beschaffen

| API | Wo besorgen |
|---|---|
| **Anthropic Claude** | console.anthropic.com |
| **Supabase** | supabase.com → Neues Projekt erstellen |
| **Flux Pro** | api.us1.bfl.ai (Black Forest Labs) |
| **Runway Gen-4** | app.runwayml.com → API-Zugang |
| **Kling AI** | klingai.com → API |
| **ElevenLabs** | elevenlabs.io → Profil → API Keys |

### 3. Umgebungsvariablen setzen

```bash
cp .env.example .env.local
# .env.local mit deinen Keys befüllen
```

### 4. Supabase Schema einrichten

1. Supabase Dashboard öffnen → SQL Editor
2. Inhalt von `lib/supabase/schema.sql` einfügen und ausführen
3. Storage Buckets werden automatisch erstellt

### 5. Lokal starten

```bash
npm run dev
```

App läuft auf http://localhost:3000

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Umgebungsvariablen im Vercel Dashboard unter Settings → Environment Variables eintragen.

---

## Architektur

```
app/
├── api/
│   ├── storyboard/        # Claude Storyboard-Generator
│   ├── generate-video/    # Video-Pipeline (Init + SSE Stream)
│   ├── assemble-video/    # FFmpeg Schnitt
│   ├── brand-settings/    # Brand-Konfiguration
│   └── projects/          # Projektverwaltung
├── dashboard/
│   ├── create/            # Video-Erstellung (3-Step Flow)
│   ├── library/           # Video-Bibliothek
│   ├── brand/             # Brand & CTA Settings
│   └── settings/          # System-Einstellungen
└── auth/                  # Login / Registrierung

lib/
├── ai/
│   ├── claude.ts          # Storyboard-Generierung
│   ├── flux.ts            # Keyframe-Bilder
│   ├── runway.ts          # Video-Clips (+ Kling Fallback)
│   └── elevenlabs.ts      # Voice-Over
└── video/
    └── pipeline.ts        # End-to-End Pipeline
```

---

## Tech Stack

- **Frontend**: Next.js 15 App Router, React, Tailwind CSS, Framer Motion
- **KI Video**: Runway Gen-4 + Kling AI Fallback
- **KI Bild**: Flux Pro (Black Forest Labs)
- **KI Text**: Anthropic Claude Sonnet
- **Audio**: ElevenLabs Multilingual v2
- **Video-Schnitt**: FFmpeg (server-side)
- **Datenbank**: Supabase (PostgreSQL + Storage)
- **Auth**: Supabase Auth
