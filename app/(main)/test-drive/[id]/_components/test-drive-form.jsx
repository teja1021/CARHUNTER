"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { bookTestDrive } from "@/actions/test-drive";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// Define Zod schema for form validation
const testDriveSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your test drive",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  notes: z.string().optional(),
});

export function TestDriveForm({ car, testDriveInfo }) {
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Initialize react-hook-form with zod resolver
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: "",
    },
  });

  // Get dealership and booking information
  const dealership = testDriveInfo?.dealership;
  const existingBookings = testDriveInfo?.existingBookings || [];

  // Watch date field to update available time slots
  const selectedDate = watch("date");

  // Custom hooks for API calls
  const {
    loading: bookingInProgress,
    fn: bookTestDriveFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookTestDrive);

  // Handle successful booking
  useEffect(() => {
    if (bookingResult?.success) {
      setBookingDetails({
        date: format(bookingResult?.data?.bookingDate, "EEEE, MMMM d, yyyy"),
        timeSlot: `${format(
          parseISO(`2022-01-01T${bookingResult?.data?.startTime}`),
          "h:mm a"
        )} - ${format(
          parseISO(`2022-01-01T${bookingResult?.data?.endTime}`),
          "h:mm a"
        )}`,
        notes: bookingResult?.data?.notes,
      });
      setShowConfirmation(true);

      // Reset form
      reset();
    }
  }, [bookingResult, reset]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      toast.error(
        bookingError.message || "Failed to book test drive. Please try again."
      );
    }
  }, [bookingError]);

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) return;

    const selectedDayOfWeek = format(selectedDate, "EEEE").toUpperCase();

    // Find working hours for the selected day
    const daySchedule = dealership.workingHours.find(
      (day) => day.dayOfWeek === selectedDayOfWeek
    );

    if (!daySchedule || !daySchedule.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }

    // Parse opening and closing hours
    const openHour = parseInt(daySchedule.openTime.split(":")[0]);
    const closeHour = parseInt(daySchedule.closeTime.split(":")[0]);

    // Generate time slots (every hour)
    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Check if this slot is already booked
      const isBooked = existingBookings.some((booking) => {
        const bookingDate = booking.date;
        return (
          bookingDate === format(selectedDate, "yyyy-MM-dd") &&
          (booking.startTime === startTime || booking.endTime === endTime)
        );
      });

      if (!isBooked) {
        slots.push({
          id: `${startTime}-${endTime}`,
          label: `${startTime} - ${endTime}`,
          startTime,
          endTime,
        });
      }
    }

    setAvailableTimeSlots(slots);

    // Clear time slot selection when date changes
    setValue("timeSlot", "");
  }, [selectedDate]);

  // Create a function to determine which days should be disabled
  const isDayDisabled = (day) => {
    // Disable past dates
    if (day < new Date()) {
      return true;
    }

    // Get day of week
    const dayOfWeek = format(day, "EEEE").toUpperCase();

    // Find working hours for the day
    const daySchedule = dealership?.workingHours?.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    // Disable if dealership is closed on this day
    return !daySchedule || !daySchedule.isOpen;
  };

  // Submit handler
  const onSubmit = async (data) => {
    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.id === data.timeSlot
    );

    if (!selectedSlot) {
      toast.error("Selected time slot is not available");
      return;
    }

    await bookTestDriveFn({
      carId: car.id,
      bookingDate: format(data.date, "yyyy-MM-dd"),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: data.notes || "",
    });
  };

  // Close confirmation handler
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/cars/${car.id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column - Car Summary */}
      <div className="md:col-span-1">
        <Card className="float-card">
          <CardContent className="p-6 bg">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>

            <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Car className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold">
              {car.year} {car.make} {car.model}
            </h3>

            <div className="mt-2 text-xl font-bold text-emerald-500">
              ₹{car.price.toLocaleString('en-IN')}
            </div>

            <div className="mt-4 text-sm text-gray-100">
              <div className="flex justify-between py-1 border-b">
                <span>Mileage</span>
                <span className="font-medium">
                  {car.mileage.toLocaleString('en-IN')} miles
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealership Info */}
        <Card className="mt-6 bg-gray-800/80 overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Dealership Info</h2>
            <div className="text-sm">
              <p className="font-medium">CarHunter Motors</p>
              <p className="text-white/50 mt-1">
                {(!dealership?.address || dealership?.name === "Vehiql Motors") ? "Hunter Dungeon" : dealership?.address}
              </p>
              <p className="text-white/50  mt-3">
                <span className="font-medium">Phone:</span>{" "}
                {(!dealership?.phone || dealership?.name === "Vehiql Motors") ? "+91 9999999999" : dealership?.phone}
              </p>
              <p className="text-white/50 ">
                <span className="font-medium">Email:</span>{" "}
                {(!dealership?.email || dealership?.name === "Vehiql Motors") ? "CarHunter@gmail.com" : dealership?.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Booking Form */}
      <div className="md:col-span-2 ">
        <Card>
          <CardContent className="p-6 bg-gray-800/80 overflow-hidden">
            <h2 className="text-xl font-bold mb-6">Schedule Your Test Drive</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" >
                  Select a Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && " bg-white  font-bold hover:text-bold hover:bg-white/40 text-black"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-bold" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger> 
                        <PopoverContent className="w-auto p-0 bg-white text-destructive text-black">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select a Time Slot
                </label>
                <Controller
                  name="timeSlot"
                  control={control}
                  render={({ field }) => (
                    <div>
                     
<Select
  value={field.value}
  onValueChange={field.onChange}
  disabled={
    !selectedDate || availableTimeSlots.length === 0
  }
>
  <SelectTrigger
    className={
      !field.value
        ? "bg-white font-black text-black text-destructive hover:bg-white/40 font-bold"
        : ""
    }
  >
    <SelectValue
      className={
        !field.value
          ? "text-black"
          : ""
      }
      placeholder={
        !selectedDate
          ? "Please select a date first"
          : availableTimeSlots.length === 0
          ? "No available slots on this date"
          : "Select a time slot"
      }
    />
  </SelectTrigger>
  <SelectContent className="bg-white/80 text-black">
    {availableTimeSlots.map((slot) => (
      <SelectItem key={slot.id} value={slot.id}>
        {slot.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                      {errors.timeSlot && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.timeSlot.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Additional Notes (Optional)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Any specific questions or requests for your test drive?"
                      className="min-h-24"
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Your Test Drive...
                  </>
                ) : (
                  "Book Test Drive"
                )}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-8 bg-emerald-300/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">What to expect</h3>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Bring your driver's license for verification
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Test drives typically last 30-60 minutes
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  A dealership representative will accompany you
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Test Drive Booked Successfully
            </DialogTitle>
            <DialogDescription>
              Your test drive has been confirmed with the following details:
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Car:</span>
                  <span>
                    {car.year} {car.make} {car.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time Slot:</span>
                  <span>{bookingDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dealership:</span>
                  <span>CarHunter Motors</span>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-700">
                Please arrive 10 minutes early with your driver's license.
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button className="bg-black text-white" onClick={handleCloseConfirmation}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
