#!/usr/bin/env python3
"""watch: download a video from a link (or use a local file), grab frames,
transcribe the audio, and write everything into one folder Claude can read.

Usage:
  python3 digest.py <url-or-file> [--out DIR] [--frames N] [--scene 0.3]
                    [--model small] [--lang auto] [--no-subs] [--cookies FILE]

Output (DIR, default ./watch/<slug>):
  video.<ext>          the downloaded video
  frames/f_0001.jpg    key frames (scene changes, topped up with even spacing)
  frames/index.txt     timestamp of every frame
  transcript.txt       plain text with [mm:ss] timestamps
  transcript.srt       subtitles
  digest.md            metadata + frame list + transcript, ready to read

Dependencies: ffmpeg/ffprobe on PATH, `pip install yt-dlp faster-whisper`.
Transcription order: creator subtitles via yt-dlp -> faster-whisper -> openai-whisper.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


def log(msg):
    print(f"[watch] {msg}", file=sys.stderr, flush=True)


def need(binary):
    if not shutil.which(binary):
        sys.exit(f"[watch] missing '{binary}' on PATH (install ffmpeg)")


def slugify(text):
    text = re.sub(r"[^\w\-]+", "-", text.lower()).strip("-")
    return (text or "video")[:60]


def ts(seconds):
    seconds = max(0, float(seconds))
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def srt_ts(seconds):
    ms = int(round(float(seconds) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# --------------------------------------------------------------------------- download
def download(source, out, want_subs, lang, cookies=None):
    """Returns (video_path, meta dict, subtitle_path or None)."""
    if os.path.exists(source):
        dst = out / ("video" + Path(source).suffix)
        if Path(source).resolve() != dst.resolve():
            shutil.copy2(source, dst)
        return dst, {"title": Path(source).stem, "source": str(source)}, None

    try:
        import yt_dlp
    except ImportError:
        sys.exit("[watch] yt-dlp not installed: pip install yt-dlp")

    langs = ["en.*", "ro.*", "hu.*"] if lang == "auto" else [f"{lang}.*"]
    opts = {
        "outtmpl": str(out / "video.%(ext)s"),
        "format": "bv*[height<=720]+ba/b[height<=720]/bv*+ba/b",
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
        "noprogress": True,
        "no_warnings": True,
        "writesubtitles": want_subs,
        "writeautomaticsub": False,  # auto-captions are worse than whisper
        "subtitleslangs": langs,
        "subtitlesformat": "vtt/srt/best",
    }
    if cookies:
        opts["cookiefile"] = cookies
    log(f"downloading {source}")
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(source, download=True)
    except yt_dlp.utils.DownloadError as e:
        sys.exit(f"[watch] download failed: {str(e).replace('ERROR: ', '')}\n"
                 "[watch] private/login-only link or blocked host? "
                 "Pass --cookies cookies.txt (your own export) or give the file directly.")
    video = next((p for p in out.glob("video.*")
                  if p.suffix not in (".vtt", ".srt", ".part", ".json")), None)
    if not video:
        sys.exit("[watch] download finished but no video file was found")
    subs = next(iter(sorted(out.glob("video.*.vtt")) + sorted(out.glob("video.*.srt"))), None)
    meta = {k: info.get(k) for k in
            ("title", "uploader", "upload_date", "duration", "webpage_url", "description")}
    meta["source"] = source
    return video, meta, subs


def duration_of(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "json", str(video)], capture_output=True, text=True)
    try:
        return float(json.loads(r.stdout)["format"]["duration"])
    except Exception:
        return 0.0


def has_audio(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a",
                        "-show_entries", "stream=index", "-of", "csv=p=0", str(video)],
                       capture_output=True, text=True)
    return bool(r.stdout.strip())


# --------------------------------------------------------------------------- frames
def grab_frames(video, out, max_frames, scene, dur):
    fdir = out / "frames"
    if fdir.exists():
        shutil.rmtree(fdir)
    fdir.mkdir()

    # 1) scene-change timestamps
    times = []
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-vf",
                        f"select='gt(scene,{scene})',showinfo", "-an", "-f", "null", "-"],
                       capture_output=True, text=True)
    for m in re.finditer(r"pts_time:([\d.]+)", r.stderr):
        times.append(float(m.group(1)))

    # 2) always include the opening frame; drop cuts closer than 1.5 s apart
    times = sorted(t for t in [0.5 if dur > 1 else 0.0] + times if not dur or t < dur - 0.05)
    dedup = []
    for t in times:
        if not dedup or t - dedup[-1] >= 1.5:
            dedup.append(t)

    # 3) too many: thin evenly. too few: split the widest gap (incl. up to the end)
    if len(dedup) > max_frames:
        step = len(dedup) / max_frames
        dedup = [dedup[int(i * step)] for i in range(max_frames)]
    while dur and len(dedup) < max_frames:
        edges = dedup + [dur]
        gap, i = max((edges[j + 1] - edges[j], j) for j in range(len(dedup)))
        if gap < 1.0:
            break
        dedup.insert(i + 1, dedup[i] + gap / 2)

    lines = []
    for i, t in enumerate(dedup, 1):
        name = f"f_{i:04d}.jpg"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t:.3f}",
                        "-i", str(video), "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2",
                        "-q:v", "3", str(fdir / name)], check=False)
        if (fdir / name).exists():
            lines.append((name, t))
    (fdir / "index.txt").write_text("".join(f"{n}\t{ts(t)}\t{t:.2f}s\n" for n, t in lines))
    log(f"{len(lines)} frames -> {fdir}")
    return lines


# --------------------------------------------------------------------------- transcript
def parse_subs(path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    segs, start = [], None
    for line in text.splitlines():
        m = re.match(r"(\d+:)?(\d+):(\d+)[.,](\d+)\s+-->\s+(\d+:)?(\d+):(\d+)[.,](\d+)", line)
        if m:
            h = int((m.group(1) or "0:")[:-1])
            start = h * 3600 + int(m.group(2)) * 60 + int(m.group(3)) + int(m.group(4)) / 1000
            h2 = int((m.group(5) or "0:")[:-1])
            end = h2 * 3600 + int(m.group(6)) * 60 + int(m.group(7)) + int(m.group(8)) / 1000
            segs.append([start, end, ""])
        elif segs and line.strip() and not line.strip().isdigit() and "WEBVTT" not in line:
            clean = re.sub(r"<[^>]+>", "", line).strip()
            if clean and clean not in segs[-1][2]:
                segs[-1][2] = (segs[-1][2] + " " + clean).strip()
    out = []
    for s, e, t in segs:  # collapse rolling duplicates
        if t and (not out or t != out[-1][2]):
            out.append((s, e, t))
    return out


def whisper(video, out, model_name, lang):
    wav = out / "audio.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video),
                    "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
    language = None if lang == "auto" else lang
    try:
        from faster_whisper import WhisperModel
        log(f"transcribing with faster-whisper ({model_name}) - first run downloads the model")
        model = WhisperModel(model_name, device="auto", compute_type="int8")
        # decode ourselves: faster-whisper's own decoder (PyAV) breaks across versions
        import numpy as np
        pcm = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(wav),
                              "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        audio = np.frombuffer(pcm, dtype=np.float32)
        segments, info = model.transcribe(audio, language=language, vad_filter=True)
        segs = [(s.start, s.end, s.text.strip()) for s in segments]
        detected = info.language
    except ImportError:
        try:
            import whisper as owhisper
        except ImportError:
            sys.exit("[watch] no transcriber: pip install faster-whisper")
        log(f"transcribing with openai-whisper ({model_name})")
        res = owhisper.load_model(model_name).transcribe(str(wav), language=language)
        segs = [(s["start"], s["end"], s["text"].strip()) for s in res["segments"]]
        detected = res.get("language")
    wav.unlink(missing_ok=True)
    return segs, detected


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="video URL (YouTube, Instagram, TikTok, X, ...) or local file")
    ap.add_argument("--out", help="output folder (default ./watch/<slug>)")
    ap.add_argument("--frames", type=int, default=12, help="max frames to keep (default 12)")
    ap.add_argument("--scene", type=float, default=0.3, help="scene-change threshold 0-1 (default 0.3)")
    ap.add_argument("--model", default="small", help="whisper model: tiny|base|small|medium|large-v3")
    ap.add_argument("--lang", default="auto", help="audio language code, e.g. en, ro, hu (default auto)")
    ap.add_argument("--cookies", help="Netscape cookies.txt for sites that need you signed in")
    ap.add_argument("--no-subs", action="store_true", help="ignore creator subtitles, always run whisper")
    a = ap.parse_args()

    need("ffmpeg")
    need("ffprobe")
    if a.out:
        out = Path(a.out)
    else:
        base = Path(a.source).stem if os.path.exists(a.source) else \
            re.sub(r"^https?://(www\.)?", "", a.source)
        out = Path("watch") / slugify(base)
    out.mkdir(parents=True, exist_ok=True)

    video, meta, subs = download(a.source, out, not a.no_subs, a.lang, a.cookies)
    dur = duration_of(video)
    meta["duration"] = meta.get("duration") or round(dur, 1)
    frames = grab_frames(video, out, max(1, a.frames), a.scene, dur)

    segs, method, detected = [], "none (no audio track)", None
    if has_audio(video):
        if subs:
            segs, method = parse_subs(subs), f"creator subtitles ({subs.name})"
        if not segs:
            segs, detected = whisper(video, out, a.model, a.lang)
            method = f"whisper {a.model}"
    log(f"transcript: {len(segs)} segments via {method}")

    (out / "transcript.txt").write_text("".join(f"[{ts(s)}] {t}\n" for s, _, t in segs))
    (out / "transcript.srt").write_text("".join(
        f"{i}\n{srt_ts(s)} --> {srt_ts(e)}\n{t}\n\n" for i, (s, e, t) in enumerate(segs, 1)))
    (out / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))

    desc = (meta.get("description") or "").strip()
    md = [f"# {meta.get('title') or 'Video'}", "",
          f"- **Source:** {meta.get('webpage_url') or meta.get('source')}"]
    if meta.get("uploader"):
        md.append(f"- **Uploader:** {meta['uploader']}")
    md += [f"- **Duration:** {ts(meta['duration'] or 0)}",
           f"- **Transcript:** {method}" + (f", language `{detected}`" if detected else ""),
           f"- **Video file:** `{video.name}`", ""]
    if desc:
        md += ["## Description", "", desc[:2000], ""]
    md += ["## Frames", "", "Open these with the Read tool to see the video.", ""]
    md += [f"- `frames/{n}` at {ts(t)}" for n, t in frames]
    md += ["", "## Transcript", ""]
    md += [f"[{ts(s)}] {t}" for s, _, t in segs] or ["_(no speech found)_"]
    (out / "digest.md").write_text("\n".join(md) + "\n")

    print(json.dumps({"out": str(out), "digest": str(out / "digest.md"), "video": str(video),
                      "frames": len(frames), "segments": len(segs), "transcript": method}))


if __name__ == "__main__":
    main()
