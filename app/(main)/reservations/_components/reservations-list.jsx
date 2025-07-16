"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { TestDriveCard } from "@/components/test-drive-card";
import { cancelTestDrive } from "@/actions/test-drive";
import { toast } from "sonner";

export function ReservationsList({ initialData }) {
  // Use local state for bookings!
  const [bookings, setBookings] = useState(initialData?.data || []);
  const [cancellingId, setCancellingId] = useState(null);

  // Handle cancellation
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    
    try {
      // Call the cancel function directly instead of using useFetch
      const result = await cancelTestDrive(bookingId);
      
      if (result?.success) {
        // Update the local state by changing the booking status to CANCELLED
        setBookings(prevBookings => {
          const updatedBookings = prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'CANCELLED' }
              : booking
          );
          console.log('Updated bookings:', updatedBookings); // Debug log
          return updatedBookings;
        });
        
        // Show success message
        toast.success("Test drive cancelled successfully");
      } else {
        // Show error message
        toast.error(result?.error || "Failed to cancel test drive");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel test drive");
    } finally {
      setCancellingId(null);
    }
  };

  // Group bookings by status (use local state!)
  const upcomingBookings = bookings.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = bookings.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  // Debug logs
  console.log('All bookings:', bookings);
  console.log('Upcoming bookings:', upcomingBookings);
  console.log('Past bookings:', pastBookings);

  // No reservations
  if (bookings.length === 0) {
    return (
      <div className="min-h-[400px] bg-black flex flex-col items-center justify-center text-center p-8 border rounded-lg">
        <div className="bg-emerald-700/30 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8  text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reservations Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant="default" className="bg-emerald-500 text-white font-extrabold hover:bg-muted-foreground" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Test Drives</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-400 italic">No upcoming test drives.</p>
        ) : (
          <div className="space-y-3 bg-muted-50">
            {upcomingBookings.map((booking) => (
              
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancellingId === booking.id}
                showActions
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className="text-white/60">
          <h2 className="text-2xl font-bold mb-4">Past Test Drives</h2>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
          <div key={booking.id} className="bg-muted-30 rounded-xl text-white shadow-sm">
            <TestDriveCard
              booking={booking}
              showActions={false}
              isPast
            />
          </div>
        ))}

          </div>
        </div>
      )}
    </div>
  );
}
