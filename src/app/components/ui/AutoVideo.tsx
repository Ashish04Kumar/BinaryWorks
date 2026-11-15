"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { trackActivity } from "@/lib/track";

// Plays with sound when at least half of it is on screen, pauses when scrolled away.
// Browsers only allow sound after the visitor has clicked or typed on the page; until then it plays muted,
// shows a "Tap for sound" button, and the sound also comes on with their first click or key press anywhere.
// If the visitor pauses it themselves, it stays paused until they press play again.
const AutoVideo = (props: React.VideoHTMLAttributes<HTMLVideoElement>) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    let userPaused = false;
    let blocked = false; // muted only because the browser didn't allow sound yet

    const start = async () => {
      if (blocked) return void video.play().catch(() => {});
      video.muted = false;
      try {
        await video.play();
      } catch {
        // sound not allowed yet: play muted and offer the button
        blocked = true;
        video.muted = true;
        setNeedsTap(true);
        await video.play().catch(() => {});
      }
    };
    const unlock = () => {
      if (blocked) {
        trackActivity("video sound on");
        blocked = false;
        video.muted = false;
        setNeedsTap(false);
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    // a pause while it is still on screen came from the visitor, not from scrolling away
    const onPause = () => {
      if (visible) userPaused = true;
      trackActivity("video pause", { at: Math.round(video.currentTime), by: visible ? "visitor" : "scrolled away" });
    };
    const onPlay = () => {
      userPaused = false;
      trackActivity("video play", { at: Math.round(video.currentTime), sound: !video.muted });
    };
    // turning the sound on with the video's own controls counts too
    const onVolume = () => {
      if (!video.muted && blocked) {
        trackActivity("video sound on");
        blocked = false;
        setNeedsTap(false);
      }
    };
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("volumechange", onVolume);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !userPaused) start();
        else if (!visible && !video.paused) video.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(video);
    return () => {
      io.disconnect();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("volumechange", onVolume);
    };
  }, []);

  return (
    <div className="relative">
      <video ref={ref} playsInline {...props} />
      {needsTap && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (v) v.muted = false;
            setNeedsTap(false);
          }}
          className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/65 hover:bg-black/80 backdrop-blur text-white text-sm font-medium cursor-pointer transition-colors"
        >
          <Volume2 className="w-4 h-4" /> Tap for sound
        </button>
      )}
    </div>
  );
};

export default AutoVideo;
