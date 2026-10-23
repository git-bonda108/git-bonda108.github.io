# Explainers

One-minute animated explainers, one per flagship project, written for a business reader.
Every frame is a pure function of time, so a render is repeatable.

- `engine.html` — the 960×540 stage: step chips, chat panel, dashed system boundary with component tiles, a work area (documents, checks, hub, chain, lanes, log, stats, quote, ladder, meters, guided screen, quote compare, exact sum) and a numbered caption bar.
- `storyboards/<id>.json` — one per project: intro card, scenes (`dur`, `step`, `lit` tiles, `chat` items, `work`, `cap`), outro card.
- `render.py` — Playwright + ffmpeg. Writes `../assets/explainers/<id>.gif|mp4|webm|jpg`.

```bash
python3 render.py auditor compass flick quote-intelligence playground dragonfruit colearn
```

Preview a storyboard in a browser: `engine.html?story=<id>` (loops); add `&t=12.5` to freeze a moment.

Rules: no client names, no figures that are not in the case study, no Dragonfruit pricing. Screens are illustrative and say so on the intro card.
