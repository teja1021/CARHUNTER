"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { Crosshair } from "lucide-react";

export default function BodyTypeCard({ type }) {
  const audioRef = useRef(null);

  const handleBodyTypeClick = () => {
    // Play good-girl sound when body type card is clicked
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch(error => {
        console.log("Good-girl sound play failed:", error);
      });
    }
  };

  return (
    <>
      <Link
        href={`/cars?bodyType=${type.name}`}
        className="relative group cursor-pointer bg-emerald-800/30 hover:bg-muted/90 rounded-lg border border-emerald-900/20 hover:border-emerald-600/40 transition-all duration-300"
        onClick={handleBodyTypeClick}
      >
        <div className="overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative">
          <Image
            src={type.imageUrl || `/body/${type.name.toLowerCase()}.webp`}
            alt={type.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex items-end">
          <h3 className="text-white text-xl font-bold pl-4 pb-2 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-emerald-400" />
            Mark: {type.name}
          </h3>
        </div>
      </Link>
      
      {/* Hidden audio element for good-girl sound */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: "none" }}
        volume={0.5}
      >
        <source src="/sounds/good-girl.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}