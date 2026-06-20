# Audio

Drop an ambient space track here as `ambient.mp3` to enable background sound.

- The player loads `/audio/ambient.mp3` and loops it when the user un-mutes
  (speaker button in the control dock). It starts **muted** so the first click
  is the user gesture browsers require for autoplay.
- If this file is missing, the app simply plays no ambient track — the UI and the
  generated click "blip" SFX keep working.

Suggested sources: any royalty-free / CC0 space ambience (e.g. freesound.org).
Keep it small (~1–3 MB) and seamless-looping.
