# Drop the real artwork here

The page references these three paths. Until the files exist the layout still
holds its shape (every slot has a fixed aspect ratio) — the image slots just
come back empty.

| File | Used by | Spec |
|---|---|---|
| `hero-kitchen.jpg` | hero, right column | 4:3, 1600×1200 or larger, warm daylight interior |
| `app-moment.png` | three-steps panel + mobile | flat screenshot, 1179×2556, no device frame |
| `app-voice.png` | three-steps panel, tilted top-right | flat screenshot, 1179×2556, no device frame |

The phone bezel, corner radius and notch are drawn in CSS by
`src/components/Phone.tsx`, so the screenshots must be flat captures — a
pre-framed mockup render would double up the chrome.
