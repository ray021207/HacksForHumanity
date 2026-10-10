# Artwork

| File | Used by |
|---|---|
| `hero-kitchen.jpg` | hero, right column — 1572×1179 (4:3) |
| `app-moment.png` | three-steps panel, front phone + the mobile in-flow phone |
| `app-voice.png` | three-steps panel, tilted top-right phone |
| `app-results.png` | **not placed yet** — the "You lead with warmth" results screen |

## These renders are already framed

Bezel, notch, status bar and drop shadow are baked into each PNG on a
transparent surround, so `src/components/Phone.tsx` draws no chrome of its own.
A CSS bezel would sit outside the rendered one and read as a double frame.

All three share a 499:1024 ratio, which is what reserves their space before the
image loads. A replacement at a different ratio needs `aspect-[499/1024]` in
Phone.tsx updated to match.
