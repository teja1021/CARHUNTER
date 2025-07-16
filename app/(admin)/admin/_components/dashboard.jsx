"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Calendar,
  TrendingUp,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  DollarSign,
} from "lucide-react";

export function Dashboard({ initialData }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Show error if data fetch failed
  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  const { cars, testDrives } = initialData.data;

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
       <TabsList className="bg-black p-1 rounded-lg">
  <TabsTrigger
    className="text-white data-[state=active]:bg-white data-[state=active]:text-black px-4  rounded-md"
    value="overview"
  >
    Overview
  </TabsTrigger>
  <TabsTrigger
    className="text-white data-[state=active]:bg-white data-[state=active]:text-black px-4  rounded-md"
    value="test-drives"
  >
    Test Drives
  </TabsTrigger>
</TabsList>


        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 text-white" >
          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cars
                </CardTitle>
                <Car className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.total}</div>
                <p className="text-xs text-muted-foreground">
                  {cars.available} available, {cars.sold} sold
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Test Drives
                </CardTitle>
                <Calendar className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
                <p className="text-xs text-muted-foreground">
                  {testDrives.pending} pending, {testDrives.confirmed} confirmed
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testDrives.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  From test drives to sales
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.sold}</div>
                <p className="text-xs text-muted-foreground">
                  {((cars.sold / cars.total) * 100).toFixed(1)}% of inventory
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Overview Content */}
          <Card className="bg-muted-50 text-white">
            <CardHeader>
              <CardTitle>Dealership Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-700/30 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">Car Inventory</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{
                            width: `${(cars.available / cars.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {((cars.available / cars.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">
                      Available inventory capacity
                    </p>
                  </div>

                  <div className="bg-blue-700/30 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">
                      Test Drive Success
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (testDrives.completed / (testDrives.total || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {(
                          (testDrives.completed / (testDrives.total || 1)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">
                      Completed test drives
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {cars.sold}
                    </span>
                    <p className="text-sm text-gray-300 mt-1">Cars Sold</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber-600">
                      {testDrives.pending + testDrives.confirmed}
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      Upcoming Test Drives
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-600">
                      {((cars.available / (cars.total || 1)) * 100).toFixed(0)}%
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      Inventory Utilization
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Drives Tab */}
        <TabsContent value="test-drives" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {((testDrives.pending / testDrives.total) * 100).toFixed(1)}%
                  of bookings
                </p>
              </CardContent>
            </Card >
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.confirmed}</div>
                <p className="text-xs text-muted-foreground">
                  {((testDrives.confirmed / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {((testDrives.completed / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted-50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.cancelled}</div>
                <p className="text-xs text-muted-foreground">
                  {((testDrives.cancelled / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Drive Status Visualization */}
          <Card className="bg-muted-50 text-white">
            <CardHeader>
              <CardTitle>Test Drive Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Conversion Rate Card */}
                  <div className="bg-blue-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2 text-white">
                      Conversion Rate
                    </h3>
                    <div className="text-3xl font-bold text-blue-500">
                      {testDrives.conversionRate}%
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      Test drives resulting in car purchases
                    </p>
                  </div>

                  {/* Test Drive Success Rate */}
                  <div className="bg-emerald-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">
                      Completion Rate
                    </h3>
                    <div className="text-3xl font-bold text-green-500">
                      {testDrives.total
                        ? (
                            (testDrives.completed / testDrives.total) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      Test drives successfully completed
                    </p>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-4 mt-4">
                  <h3 className="font-medium">Booking Status Breakdown</h3>

                  {/* Pending */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-medium">
                        {testDrives.pending} (
                        {(
                          (testDrives.pending / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-amber-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (testDrives.pending / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Confirmed */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confirmed</span>
                      <span className="font-medium">
                        {testDrives.confirmed} (
                        {(
                          (testDrives.confirmed / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (testDrives.confirmed / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium">
                        {testDrives.completed} (
                        {(
                          (testDrives.completed / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (testDrives.completed / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cancelled</span>
                      <span className="font-medium">
                        {testDrives.cancelled} (
                        {(
                          (testDrives.cancelled / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (testDrives.cancelled / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* No Show */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>No Show</span>
                      <span className="font-medium">
                        {testDrives.noShow} (
                        {((testDrives.noShow / testDrives.total) * 100).toFixed(
                          1
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gray-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (testDrives.noShow / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
