"use client";

import { useEffect, useRef } from "react";
import { useSolarSystem } from "@/store/useSolarSystem";

/**
 * Audio layer. Plays a looping ambient track from /audio/ambient.mp3 when
 * unmuted (no-ops silently if the file is absent), and a short WebAudio "blip"
 * when the selection changes. Starts muted, so the first unmute click is the
 * user gesture browsers require for autoplay. Renders a hidden <audio> element.
 */
export default function AudioManager() {
  const muted = useSolarSystem((s) => s.muted);
  const selectedId = useSolarSystem((s) => s.selectedId);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const prevSelected = useRef<string | null>(null);

  // Ambient loop follows the mute flag.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (muted) {
      el.pause();
    } else {
      el.volume = 0.35;
      el.play().catch(() => {
        /* missing file or autoplay blocked — ignore */
      });
    }
  }, [muted]);

  // Click blip on selection change.
  useEffect(() => {
    if (selectedId && selectedId !== prevSelected.current && !muted) {
      playBlip(ctxRef);
    }
    prevSelected.current = selectedId;
  }, [selectedId, muted]);

  return <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="none" />;
}

function playBlip(ctxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    if (!ctxRef.current) ctxRef.current = new Ctor();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 520;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch {
    /* WebAudio unavailable — ignore */
  }
}
