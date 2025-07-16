"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Car } from "lucide-react";
import Image from "next/image";
import { getCarById } from "@/actions/car-listing"; // Adjust import if needed

export default function CarDetailPage() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCar() {
      setLoading(true);
      const result = await getCarById(carId);
      setCar(result?.data || null);
      setLoading(false);
    }
    fetchCar();
  }, [carId]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!car) return <div className="p-8 text-red-500">Car not found.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4">
      <div className="bg-muted-30 rounded-xl border border-white p-8 pulse-glow-card">
        <h1 className="text-3xl font-bold mb-4 text-white">
          {car.make} {car.model}
        </h1>
        <div className="mb-6 flex justify-center">
          {car.images?.length ? (
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              width={400}
              height={250}
              className="rounded-lg border border-white object-cover"
            />
          ) : (
            <Car className="w-32 h-32 text-emerald-500" />
          )}
        </div>
        <div className="mb-2 text-white">
          Color:{" "}
          <span className="text-gray-300">{car.color || "Unknown"}</span>
        </div>
        <div className="mb-2 text-white">
          Price:{" "}
          <span className="text-gray-300">
            ₹{car.price ? Number(car.price).toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="mb-2 text-white">
          Fuel Type:{" "}
          <span className="text-gray-300">{car.fuelType || "Unknown"}</span>
        </div>
        <div className="mb-2 text-white">
          Year:{" "}
          <span className="text-gray-300">{car.year || "Unknown"}</span>
        </div>
        {/* Add more car details as needed */}
      </div>
    </div>
  );
}