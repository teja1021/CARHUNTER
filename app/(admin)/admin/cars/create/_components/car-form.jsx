"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { addCar, processCarImageWithAI } from "@/actions/cars";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import Image from "next/image";

// ADD THIS HELPER FUNCTION
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validation schema
const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Price must be positive"),
  mileage: z.number().min(0, "Mileage must be positive"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.number().min(1).max(50),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["AVAILABLE", "SOLD", "UNAVAILABLE"]),
  featured: z.boolean(),
});

export function CarForm() {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isProcessingWithAI, setIsProcessingWithAI] = useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: 5,
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  // Custom hooks for API calls
  const {
    loading: isSubmitting,
    fn: submitCarFn,
    data: submitResult,
    error: submitError,
  } = useFetch(addCar);

  // Handle form submission result
  useEffect(() => {
    if (submitResult?.success) {
      toast.success("Car added successfully!");
      router.push("/admin/cars");
    }
  }, [submitResult, router]);

  useEffect(() => {
    if (submitError) {
      toast.error("Failed to add car: " + submitError.message);
    }
  }, [submitError]);

  // Handle image uploads with dropzone
  const onDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    if (imageFiles.length + validFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  // Remove image
  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // FIXED: AI-powered car details extraction
  const extractCarDetails = async () => {
    if (imageFiles.length === 0) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessingWithAI(true);
    try {
      const firstImage = imageFiles[0];
      
      console.log("Processing image:", {
        name: firstImage.name,
        size: firstImage.size,
        type: firstImage.type
      });

      // Convert File to base64 string
      const base64String = await fileToBase64(firstImage);
      
      console.log("Base64 conversion successful:", {
        length: base64String.length,
        preview: base64String.substring(0, 50)
      });

      // Create a serializable object to send to Server Action
      const imageData = {
        base64: base64String,
        type: firstImage.type,
        name: firstImage.name,
        size: firstImage.size,
      };

      console.log("Sending imageData:", {
        hasBase64: !!imageData.base64,
        type: imageData.type,
        name: imageData.name,
        size: imageData.size
      });

      // Call the server action
      const result = await processCarImageWithAI(imageData);

      console.log("Server result:", result);

      if (result.success) {
        // Populate form with extracted data
        const data = result.data;
        
        // Set form values
        form.setValue("make", data.make || "");
        form.setValue("model", data.model || "");
        form.setValue("year", data.year || new Date().getFullYear());
        form.setValue("color", data.color || "");
        form.setValue("price", data.price || 0);
        form.setValue("mileage", data.mileage || 0);
        form.setValue("bodyType", data.bodyType || "");
        form.setValue("fuelType", data.fuelType || "");
        form.setValue("transmission", data.transmission || "");
        form.setValue("description", data.description || "");

        toast.success(`Car details extracted with ${Math.round(data.confidence * 100)}% confidence!`);
      } else {
        console.error("AI extraction failed:", result.error);
        toast.error(result.error || "Failed to extract car details");
      }
    } catch (error) {
      console.error("Error extracting car details:", error);
      toast.error("Failed to process image: " + error.message);
    } finally {
      setIsProcessingWithAI(false);
    }
  };

  // Handle form submission - FIXED VERSION
  const onSubmit = async (data) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      // Convert all image files to base64
      const imageBase64Array = await Promise.all(
        imageFiles.map(file => fileToBase64(file))
      );

      // Submit with base64 images
      await submitCarFn({
        carData: data,
        images: imageBase64Array, // Send base64 strings instead of File objects
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit car details");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="bg-muted-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Scout New Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* AI-Powered Extraction Card */}
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                    AI-Powered Car Details Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-600 mb-4">
                    Upload an image of a car and let Gemini AI extract its details.
                  </p>
                  <Button
                    type="button"
                    onClick={extractCarDetails}
                    disabled={isProcessingWithAI || imageFiles.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isProcessingWithAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting Details...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Details
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Car Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-300 hover:border-emerald-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {isDragActive
                        ? "Drop the images here..."
                        : "Drag & drop car images, or click to select"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, WebP (max 5MB each, 10 images total)
                    </p>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={150}
                            height={100}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Car Details Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Make</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Mileage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gasoline">Gasoline</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Transmission</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                          <SelectItem value="CVT">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Body Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Coupe">Coupe</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="SOLD">Sold</SelectItem>
                          <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the car's condition, features, history, etc."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">Featured Car</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This car will be displayed on the homepage
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Car...
                  </>
                ) : (
                  "Add Car to Fleet"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}