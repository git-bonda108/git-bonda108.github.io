"""Render an explainer storyboard to GIF + MP4 + WebM + poster.

Usage: python3 render.py auditor [compass ...] [--fps 10] [--only gif]
Frames come from engine.html via setTime(t) in headless Chrome, so every frame is exact.
"""
import argparse, json, pathlib, shutil, subprocess, tempfile
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "explainers"


def frames(story_id, fps, tmp):
    story = json.loads((HERE / "storyboards" / f"{story_id}.json").read_text())
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", args=["--force-color-profile=srgb"])
        pg = b.new_page(viewport={"width": 960, "height": 540}, device_scale_factor=2)
        pg.goto((HERE / "engine.html").as_uri())
        pg.evaluate("document.fonts.ready")
        pg.evaluate("s => load(s)", story)
        pg.wait_for_timeout(300)
        total = pg.evaluate("TOTAL")
        n = int(total * fps)
        for i in range(n):
            pg.evaluate(f"setTime({i / fps})")
            pg.screenshot(path=str(tmp / f"f{i:05d}.png"))
        poster_t = story.get("poster", story["intro"].get("dur", 5) - 1.2)
        pg.evaluate(f"setTime({poster_t})")
        pg.screenshot(path=str(tmp / "poster.png"))
        b.close()
    return n, total


def ff(*args):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args], check=True)


def encode(story_id, fps, tmp, only):
    OUT.mkdir(parents=True, exist_ok=True)
    src = ["-framerate", str(fps), "-i", str(tmp / "f%05d.png")]
    if only in (None, "gif"):
        ff(*src, "-vf",
           "scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];"
           "[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle", str(OUT / f"{story_id}.gif"))
    if only in (None, "video"):
        ff(*src, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-vf", "scale=1440:-2:flags=lanczos", "-crf", "26", "-preset", "slow", "-tune", "stillimage",
           "-movflags", "+faststart", str(OUT / f"{story_id}.mp4"))
        ff(*src, "-c:v", "libvpx-vp9", "-vf", "scale=1440:-2:flags=lanczos", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-pix_fmt", "yuv420p",
           str(OUT / f"{story_id}.webm"))
        ff("-i", str(tmp / "poster.png"), "-vf", "scale=1280:-1:flags=lanczos", "-q:v", "4", str(OUT / f"{story_id}.jpg"))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--fps", type=int, default=10)
    ap.add_argument("--only", choices=["gif", "video"])
    a = ap.parse_args()
    for sid in a.ids:
        tmp = pathlib.Path(tempfile.mkdtemp(prefix=f"expl-{sid}-"))
        n, total = frames(sid, a.fps, tmp)
        encode(sid, a.fps, tmp, a.only)
        shutil.rmtree(tmp)
        sizes = {p.suffix: f"{p.stat().st_size / 1e6:.2f} MB" for p in OUT.glob(f"{sid}.*")}
        print(f"{sid}: {n} frames, {total:.1f}s, {sizes}")
