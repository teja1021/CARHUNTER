"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { Heart } from "lucide-react";

export function SavedCarsList({ initialData }) {
  // No saved cars
  if (!initialData?.data || initialData?.data.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-black">
        <div className="bg-emerald-700/30 p-4 rounded-full mb-4">
          <Heart className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Saved Cars</h3>
        <p className="text-white/70 mb-6 max-w-md">
          You haven't saved any cars yet. Browse our listings and click the
          heart icon to save cars for later.
        </p>
        <Button variant="default" className="bg-white text-black font-extrabold hover:bg-white/60" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  // Display saved cars
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialData?.data?.map((car) => (
        <CarCard key={car.id} car={{ ...car, wishlisted: true }} />
      ))}
    </div>
  );
}
