"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Crosshair, Binoculars } from "lucide-react";
import Link from "next/link";

// Icon mapping
const iconMap = {
  crosshair: Crosshair,
  binoculars: Binoculars,
};

export default function ScoutButton({ href, children, iconName }) {
  const audioRef = useRef(null);
  const IconComponent = iconName ? iconMap[iconName] : null;

  const handleScoutClick = () => {
    // Play scout sound when button is clicked
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch(error => {
        console.log("Scout sound play failed:", error);
      });
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 hover:bg-emerald-900/20 hover:text-emerald-400 transition-all duration-200" 
        asChild
      >
        <Link href={href} onClick={handleScoutClick}>
          {IconComponent && <IconComponent className="w-4 h-4" />}
          {children}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
      
      {/* Hidden audio element for scout sound */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: "none" }}
        volume={0.4}
      >
        <source src="/sounds/scout.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}