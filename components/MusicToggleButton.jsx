"use client";

import { useState, useEffect } from "react";
import { Music, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MusicToggleButton() {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get music state from localStorage on component mount
    const savedMusicState = localStorage.getItem("backgroundMusicEnabled");
    const musicEnabled = savedMusicState === "true";
    setIsMusicOn(musicEnabled);
    setIsInitialized(true);

    // If music should be on, start it after a short delay
    if (musicEnabled) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("start-music"));
      }, 500);
    }
  }, []);

  const toggleMusic = () => {
    const newMusicState = !isMusicOn;
    setIsMusicOn(newMusicState);
    
    // Save state to localStorage
    localStorage.setItem("backgroundMusicEnabled", newMusicState.toString());
    
    // Dispatch custom event to control music
    window.dispatchEvent(new CustomEvent("toggle-music", { 
      detail: { enabled: newMusicState } 
    }));
  };

  if (!isInitialized) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMusic}
      className="text-gray-300 hover:text-white hover:bg-gray-700"
      title={isMusicOn ? "Turn off music" : "Turn on music"}
    >
      {isMusicOn ? <Music size={20} /> : <VolumeX size={20} />}
    </Button>
  );
}