"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import Link from "next/link";

export default function HuntButton() {
  const audioRef = useRef(null);

  const handleHuntClick = () => {
    // Play horror sound when hunt button is clicked
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch((error) => {
        console.log("Horror sound play failed:", error);
      });
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-white pulse-glow flex items-center gap-2"
        asChild
      >
        <Link href="/cars" onClick={handleHuntClick}>
          <Crosshair className="w-5 h-5" />
          Start Hunt
        </Link>
      </Button>

      {/* Hidden audio element for horror sound */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: "none" }}
        volume={0.4}
      >
        <source src="/sounds/horror-1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}