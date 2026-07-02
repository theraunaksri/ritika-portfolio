# Ritika Jain — 3D Storytelling Portfolio

A scroll-driven, cinematic portfolio for Ritika Jain (Technology Consultant & Business Analyst).
The camera travels forward through five "chapters" of her career laid out in 3D depth —
from her engineering foundation to the 3M+ beneficiary government transformation programme at TCS.

## Stack

- **React 18 + Vite** — app shell and content
- **three.js** (vanilla, no R3F/drei) — one lightweight scene, primitive geometries only,
  additive-blended points and lines. ~173 KB gzipped JS total.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm i -g vercel && vercel
```

Or push to a Git repo and import it at vercel.com — Vite is auto-detected
(build command `npm run build`, output `dist`). No config needed.

## Before you ship

- **LinkedIn URL** is a placeholder — update `LINKS.linkedin` in `src/App.jsx`.
- The resume download serves `public/Ritika_Jain_CV.docx`; drop in a PDF and update
  `LINKS.resume` if you prefer.
