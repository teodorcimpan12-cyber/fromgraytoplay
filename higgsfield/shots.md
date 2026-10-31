# Higgsfield shot list — From Grey to Play promo

The shipped promo (`promo.html` → `promo/promo-{9x16,16x9}.mp4`) is 100% code-native: canvas
kinetic type, no AI footage. These prompts are for an optional **AI B-roll pass** once the
Higgsfield account has credits (a free plan with 10 credits cannot cover a Seedance video job).

Rules for every shot: no real children's faces (silhouettes / backs / wide shots only), no
third-party logos, no real brand signage. Palette: grey concrete → `#F97316` coral,
`#0D9488` teal, `#10B981` green, `#F5B700` gold. Negative prompt for all:
`text, logos, watermarks, faces in close-up, recognisable people, brand names, distorted hoops`.

| # | Scene (timeline) | Type | Aspect / length | Prompt |
|---|---|---|---|---|
| 1 | Cold open, 0–3 s | image → video | 9:16, 3 s | Top-down macro of cracked grey asphalt basketball court, faded white lines, weeds in the cracks, overcast flat light, Eastern European apartment blocks reflected in a puddle. Camera: slow push-in, slight handheld shake. |
| 2 | Bent rim, 3–5 s | image → video | 9:16, 2 s | Rusty basketball hoop with a bent rim and no net against a grey sky, Communist-era panel blocks behind, desaturated. Camera: low angle, fast whip-pan right. |
| 3 | Transformation, 9–10 s | video | 9:16, 2 s | The same cracked court seen from a drone at 30 m; coral, teal and gold paint floods across it like a liquid wave, lines redrawn crisp white. Camera: drone rising and rotating 30°. |
| 4 | After, 10–14 s | image | 16:9 2k | Freshly painted neighbourhood basketball court, coral playing area with gold diagonal stripes, teal surround, green keys, white lines, new hoop with a red rim and white net, evening golden hour, apartment blocks in Târgu Mureș style. No people. |
| 5 | Community, 19–24 s | video | 9:16, 4 s | Silhouettes of teenagers and parents playing on a colourful painted court at sunset, shot from behind and far away, long shadows, ball bouncing in the foreground. Camera: slow dolly left. |
| 6 | End plate, 28–32 s | image | 9:16 2k | Aerial drone view of a painted coral/teal court as a colourful square among grey courtyards, dusk, empty, space at the top third for a logo. |

## Swapping clips in

1. Generate with Higgsfield (Seedance 2.5 for video, Soul Cinema for photoreal stills).
2. Save as `promo/clips/s{N}.mp4` (or `.jpg`), 1080×1920 for 9:16.
3. In `promo.html`, draw the clip as a background layer at the start of the matching scene
   function (`ctx.drawImage(video, …)` after seeking the `<video>` to `lt`) and keep the
   type on top. Re-render with `node tools/render_promo.mjs`.
