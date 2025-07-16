"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function SavedCarsButton() {
  const audioRef = useRef(null);

  const handleSavedCarsClick = () => {
    // Play saved-cars sound when button is clicked
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch(error => {
        console.log("Saved cars sound play failed:", error);
      });
    }
  };

  return (
    <>
      <a href="/saved-cars" onClick={handleSavedCarsClick}>
        <Button variant="outline" className="flex items-center gap-2 text-white hover:text-black hover:bg-white">
          <Heart size={18} />
          <span className="hidden md:inline">Saved Cars</span>
        </Button>
      </a>
      
      {/* Hidden audio element for saved cars sound */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: "none" }}
        volume={0.4}
      >
        <source src="/sounds/saved-cars.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}