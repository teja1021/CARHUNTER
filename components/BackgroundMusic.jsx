// components/BackgroundMusic.jsx
"use client";

import { useRef, useEffect } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef(null);

  useEffect(() => {
    const handleToggle = (e) => {
      if (audioRef.current) {
        const isEnabled =
          e.detail?.enabled !== undefined
            ? e.detail.enabled
            : !audioRef.current.paused;

        if (isEnabled) {
          audioRef.current
            .play()
            .catch((error) => {
              console.log("Audio play failed:", error);
            });
        } else {
          audioRef.current.pause();
        }
      }
    };

    const handleStart = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((error) => {
            console.log("Audio play failed:", error);
          });
      }
    };

    // Add car sound event handler
    const handleCarSound = () => {
      // This is for the car sound effect when clicking make cards
      const carAudio = new Audio('/sounds/car-sound.mp3');
      carAudio.volume = 0.3;
      carAudio.play().catch(error => {
        console.log("Car sound play failed:", error);
      });
    };

    window.addEventListener("toggle-music", handleToggle);
    window.addEventListener("start-music", handleStart);
    window.addEventListener("play-car-sound", handleCarSound);

    return () => {
      window.removeEventListener("toggle-music", handleToggle);
      window.removeEventListener("start-music", handleStart);
      window.removeEventListener("play-car-sound", handleCarSound);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      loop
      preload="auto"
      style={{ display: "none" }}
      volume={0.3}
    >
      <source src="/sounds/background-music.mp3" type="audio/mpeg" />
      <source src="/sounds/background-music.wav" type="audio/wav" />
      <source src="/sounds/background-music.ogg" type="audio/ogg" />
      Your browser does not support the audio element.
    </audio>
  );
}