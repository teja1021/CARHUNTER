"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

export default function CarMakeCard({ make }) {
  const audioRef = useRef(null);

  const handleCarMakeClick = () => {
    // Play horror-2.mp3 sound when make card is clicked
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch((error) => {
        console.log("Horror-2 sound play failed:", error);
      });
    }

    // Also trigger the original car sound event (if you want both sounds)
    // window.dispatchEvent(new CustomEvent("play-car-sound"));
  };

  return (
    <>
      <Link
        href={`/cars?make=${make.name}`}
        className="bg-white shrink-hover rounded-lg shadow p-4 text-center transition cursor-pointer border border-emerald-900/20 hover:border-emerald-600/40 hover:shadow-lg"
        onClick={handleCarMakeClick}
      >
        <div className="h-16 w-auto mx-auto mb-2 relative">
          <Image
            src={make.image}
            alt={make.name}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <h3 className="font-medium text-black/60 hover:text-black/80 transition-colors">
          {make.name}
        </h3>
      </Link>

      {/* Hidden audio element for horror-2 sound */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: "none" }}
        volume={0.5}
      >
        <source src="/sounds/horror-2.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}