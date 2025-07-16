"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Calendar, Car, Clock, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to format time
const formatTime = (timeString) => {
  try {
    return format(parseISO(`2022-01-01T${timeString}`), "h:mm a");
  } catch (error) {
    return timeString;
  }
};

// Helper function for status badge
const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-emerald-100 text-emerald-800">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-100 text-red-800">Cancelled</Badge>;
    case "NO_SHOW":
      return <Badge className="bg-red-100 text-red-800">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function TestDriveCard({
  booking,
  onCancel,
  onAfterCancel, // <-- add this prop
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  renderStatusSelector = () => null,
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Handle cancel
  const handleCancel = async () => {
    if (!onCancel) return;

    await onCancel(booking.id);
    setCancelDialogOpen(false);
    if (onAfterCancel) onAfterCancel(); // <-- call after cancel
  };

  return (
    <>
      <Card
        className={`overflow-hidden ${
          isPast ? "opacity-80 hover:opacity-100 transition-opacity" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Car Image - Left */}
          <div className="sm:w-1/4 relative h-40 sm:h-auto">
            {booking.car.images && booking.car.images.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={booking.car.images[0]}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 sm:hidden">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Booking Details - Middle */}
          <div className="p-4 sm:w-1/2 sm:flex-1">
            <div className="hidden sm:block mb-2">
              {getStatusBadge(booking.status)}
            </div>

            <h3 className="text-lg font-bold mb-1">
              {booking.car.year} {booking.car.make} {booking.car.model}{" "}
            </h3>
            {renderStatusSelector()}

            <div className="space-y-2 my-2">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>

              {/* Show customer info in admin view */}
              {isAdmin && booking.user && (
                <div className="flex items-center text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  {booking.user.name || booking.user.email}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Right */}
          {showActions && (
            <div className="p-4 border-t sm:border-t-0 sm:border-l sm:w-1/4 sm:flex sm:flex-col sm:justify-center sm:items-center sm:space-y-2">
              {/* Show notes if any */}
              {booking.notes && (
                <div className="bg-gray-400/30 p-2 rounded text-sm w-full">
                  <p className="font-extrabold">Notes:</p>
                  <p className="text-gray-300">{booking.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full my-2 sm:mb-0 font-extrabold "
                asChild
              >
                <Link
                  href={`/cars/${booking.carId}`}
                  className="flex items-center justify-center bg-white/70 text-black"
                >
                  View Car
                  <ArrowRight className="ml-2 h-4 w-4 font-extrabold text-black" />
                </Link>
              </Button>
            {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full font-extrabold bg-red-500/70"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Cancel"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="bg-white/80 text-black backdrop-blur-md max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle>Cancel Test Drive</DialogTitle>
              <DialogDescription className="text-gray-700 font-extrabold">
                Are you sure you want to cancel your test drive for the{" "}
                {booking.car.year} {booking.car.make} {booking.car.model}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>
                    {format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Reservation
              </Button>
              <Button className="bg-red-500 text-white"
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
