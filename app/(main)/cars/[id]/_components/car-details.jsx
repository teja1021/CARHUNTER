"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Calendar } from "lucide-react";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleSavedCar } from "@/actions/car-listing";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmiCalculator from "./emi-calculator";

export function CarDetails({ car, testDriveInfo }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);
  const [emiDialogOpen, setEmiDialogOpen] = useState(false);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save car
  const handleSaveCar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (savingCar) return;

    // Use the toggleSavedCarFn from useFetch hook
    await toggleSavedCarFn(car.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on CarHunter!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Handle book test drive
  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex
                      ? "border-2 border-blue-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center hover:border-red-500 hover:bg-red-400 gap-2 flex-1 ${
                isWishlisted ? "text-white hover:border-red-500" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1 "
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12 ">
          <div className="flex items-center justify-between">
            <Badge className="mb-2 bg-white hover:bg-muted-foreground text-black font-extrabold">{car.bodyType}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-emerald-500 h-5 w-5" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-emerald-500 h-5 w-5" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-emerald-500 h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
          </div>

          {/* EMI Calculator Section */}
          <Card className="pt-5 mb-4">
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <Currency className="h-5 w-5 text-blue-600" />
                <h3>EMI Calculator</h3>
              </div>
              <div className="text-sm text-gray-400">
                Estimated Monthly Payment:{" "}
                <span className="font-extrabold text-emerald-600">
                  {formatCurrency(car.price / 60)}
                </span>{" "}
                for 60 months
              </div>
              <div className="text-xs text-gray-400 mt-1">
                *Based on $0 down payment and 4.5% interest rate
              </div>
              <Button
                className="mt-4 w-full bg-emerald-600 text-white hover:bg-muted-30"
                onClick={() => setEmiDialogOpen(true)}
              >
                Calculate EMI
              </Button>
            </CardContent>
          </Card>

          <Dialog open={emiDialogOpen} onOpenChange={setEmiDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>CarHunter's Car Loan Calculator</DialogTitle>
                <EmiCalculator price={car.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Request More Info */}
          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href="mailto:help@CarHunter.in">
                <Button variant="submit" className="w-full bg-emerald-600 text-white hover:bg-muted-30">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Book Test Drive Button */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full py-6 text-lg bg-white hover:bg-white/60 hover:text-white text-black font-extrabold"
              onClick={handleBookTestDrive}
              disabled={testDriveInfo.userTestDrive}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {testDriveInfo.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12 p-6 bg-muted-50 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold  text-blue-700 mb-6">Description</h3>
            <p className="whitespace-pre-line text-gray-400">
              {car.description}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Features</h3>
            <ul className="grid grid-cols-1 gap-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {car.transmission} Transmission
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {car.fuelType} Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {car.bodyType} Body Style
              </li>
              {car.seats && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                  {car.seats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {car.color} Exterior
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="mt-8 p-6 bg-muted-50 text-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold  text-blue-700 mb-6">Specifications</h2>
        <div className="bg-white/10 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Make</span>
              <span className="font-medium">{car.make}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Model</span>
              <span className="font-medium">{car.model}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Year</span>
              <span className="font-medium">{car.year}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Body Type</span>
              <span className="font-medium">{car.bodyType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Fuel Type</span>
              <span className="font-medium">{car.fuelType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Transmission</span>
              <span className="font-medium">{car.transmission}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Mileage</span>
              <span className="font-medium">
                {car.mileage.toLocaleString()} miles
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-300">Color</span>
              <span className="font-medium">{car.color}</span>
            </div>
            {car.seats && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-300">Seats</span>
                <span className="font-medium">{car.seats}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealership Location Section */}
      <div className="mt-8 p-6 bg-muted-50 text-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Dealership Location</h2>
        <div className="bg-white/10  rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {/* Dealership Name and Address */}
            <div className="flex items-start gap-3">
              <LocateFixed className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">CarHunter Motors</h4>
                <p className="text-gray-300">
                  Address: 143 car street,Kansar,pin-534199
                </p>
                <p className="text-gray-300 mt-1">
                  Phone: +91 9999999999
                </p>
                <p className="text-gray-300">
                  Email: CarGuy@CarHunter.com
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="md:w-1/2 lg:w-1/3">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <div className="space-y-2">
                {testDriveInfo.dealership?.workingHours
                  ? testDriveInfo.dealership.workingHours
                      .sort((a, b) => {
                        const days = [
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                          "SUNDAY",
                        ];
                        return (
                          days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
                        );
                      })
                      .map((day) => (
                        <div
                          key={day.dayOfWeek}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-300">
                            {day.dayOfWeek.charAt(0) +
                              day.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          <span>
                            {day.isOpen
                              ? `${day.openTime} - ${day.closeTime}`
                              : "Closed"}
                          </span>
                        </div>
                      ))
                  : // Default hours if none provided
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day, index) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-300">{day}</span>
                        <span>
                          {index < 5
                            ? "9:00 - 18:00"
                            : index === 5
                            ? "10:00 - 16:00"
                            : "Closed"}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
