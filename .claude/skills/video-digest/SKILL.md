---
name: video-digest
description: Download a video from a link (YouTube, Instagram reel, TikTok, X, Vimeo, or a local file), grab key frames, transcribe the audio, and write it all to one folder Claude can read. Optionally turn what the video teaches into a new reusable skill. Use when the user pastes a video link and asks what it says or shows, wants a transcript or summary, wants frames or screenshots from it, or says "make this video into a skill".
argument-hint: <video-url-or-file> [--frames N] [--lang ro|en|hu] [--skill]
---

# video-digest

One command turns a video link into frames + transcript + a `digest.md` you can read.

## 1. Make sure the tools are there

```bash
command -v ffmpeg >/dev/null || echo "need ffmpeg (apt-get install -y ffmpeg / brew install ffmpeg)"
python3 -c "import yt_dlp, faster_whisper" 2>/dev/null || pip install -q yt-dlp faster-whisper
```

## 2. Run it

```bash
python3 .claude/skills/video-digest/scripts/digest.py "<URL or file>" \
  --out video-digest/<short-name> --frames 12
```

Useful flags:

| Flag | Default | What it does |
|---|---|---|
| `--frames N` | 12 | max frames kept (scene changes first, then evenly spaced) |
| `--scene 0.3` | 0.3 | scene-change sensitivity; lower = more cuts detected |
| `--lang en` | auto | force the audio language (`ro`, `en`, `hu`, ...) |
| `--model small` | small | whisper size: `tiny` fast, `medium`/`large-v3` accurate |
| `--no-subs` | off | skip the creator's subtitles and always run whisper |
| `--cookies FILE` | none | your own exported cookies.txt, for links that need sign-in |

The last line printed is JSON: `{"out", "digest", "video", "frames", "segments", "transcript"}`.
The first whisper run downloads the model (~250 MB for `small`).

Output folder:

```
video.mp4  frames/f_0001.jpg ...  frames/index.txt  transcript.txt  transcript.srt  meta.json  digest.md
```

`video-digest/` holds downloaded media: don't commit it (it's in `.gitignore`).

## 3. Read it

1. Read `digest.md` (metadata, frame list with timestamps, full transcript).
2. Open the frames with the Read tool. For more than ~12 frames, open the ones near the
   moments that matter in the transcript instead of all of them.
3. Answer the user: summary, key points with `[mm:ss]` timestamps, and what's on screen
   that the audio doesn't say (code, text overlays, UI, diagrams).

If the download fails: the link may be private, need login, or be blocked by the network
policy. Say so and ask for the file. Never work around a login wall or DRM.

## 4. Save it as a skill (when the user asks, or passes `--skill`)

When the video teaches a workflow, turn it into a skill so it can be reused:

1. Pick a short kebab-case name from what it teaches (e.g. `kinetic-type-promo`).
2. Write `.claude/skills/<name>/SKILL.md` with frontmatter (`name`, a `description` that
   says *when* to use it) and the steps in your own words, as instructions, with
   timestamps back to the source.
3. Put the transcript in `.claude/skills/<name>/reference/transcript.txt` and copy only the
   frames that carry information (code, diagrams) into `reference/`. Keep the source URL
   and uploader in the SKILL.md for credit. Don't copy the video file into the skill.
4. Tell the user the new skill's path and that it's callable as `/<name>`.
