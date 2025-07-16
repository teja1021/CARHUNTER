"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { serializeCarData } from "@/lib/helpers";

// FIXED: Gemini AI integration for car image processing
export async function processCarImageWithAI(imageData) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    console.log("=== SERVER ACTION DEBUG ===");
    console.log("Raw imageData received:", imageData);
    console.log("imageData type:", typeof imageData);
    console.log("imageData keys:", Object.keys(imageData || {}));
    console.log("imageData stringified:", JSON.stringify(imageData).substring(0, 200) + "...");

    // Try to extract base64 data with multiple fallback methods
    let base64Data;
    let mimeType = 'image/jpeg'; // Default fallback

    // Method 1: Check if imageData has base64 property
    if (imageData && typeof imageData === 'object' && imageData.base64) {
      console.log("Method 1: Found base64 property");
      base64Data = imageData.base64.includes(',') ? imageData.base64.split(',')[1] : imageData.base64;
      mimeType = imageData.type || mimeType;
    }
    // Method 2: Check if imageData itself is a base64 string
    else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      console.log("Method 2: imageData is base64 string");
      base64Data = imageData.split(',')[1];
      const mimeMatch = imageData.match(/data:([^;]+);/);
      mimeType = mimeMatch ? mimeMatch[1] : mimeType;
    }
    // Method 3: Check if the data is just the base64 part without the data URL prefix
    else if (typeof imageData === 'string' && imageData.length > 100) {
      console.log("Method 3: imageData appears to be raw base64");
      base64Data = imageData;
    }
    // Method 4: Try to reconstruct from a serialized object
    else if (imageData && typeof imageData === 'object') {
      console.log("Method 4: Attempting to extract from object");
      
      // Check all possible property names
      const possibleBase64Keys = ['base64', 'data', 'image', 'src', 'result'];
      for (const key of possibleBase64Keys) {
        if (imageData[key] && typeof imageData[key] === 'string') {
          console.log(`Found data in property: ${key}`);
          if (imageData[key].startsWith('data:')) {
            base64Data = imageData[key].split(',')[1];
            const mimeMatch = imageData[key].match(/data:([^;]+);/);
            mimeType = mimeMatch ? mimeMatch[1] : mimeType;
            break;
          } else if (imageData[key].length > 100) {
            base64Data = imageData[key];
            break;
          }
        }
      }
    }

    console.log("Extracted base64Data length:", base64Data ? base64Data.length : 'null');
    console.log("Extracted mimeType:", mimeType);

    // Validate base64 data
    if (!base64Data || base64Data.length < 100) {
      throw new Error(`Failed to extract valid base64 data. Received: ${typeof imageData}, Keys: ${Object.keys(imageData || {}).join(', ')}`);
    }

    // Test base64 validity
    try {
      atob(base64Data);
    } catch (e) {
      throw new Error("Invalid base64 data format");
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    console.log("Sending to Gemini API...");

    // Define the prompt for car detail extraction
    const prompt = `
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage (estimate if not visible)
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess in USD)
      10. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": 0000,
        "mileage": 0000,
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini API raw response:", text);
    
    // Clean the response
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    
    console.log("Cleaned response:", cleanedText);

    // Parse the JSON response
    try {
      const carDetails = JSON.parse(cleanedText);

      // Validate the response format
      const requiredFields = [
        "make", "model", "year", "color", "bodyType", 
        "price", "mileage", "fuelType", "transmission", 
        "description", "confidence"
      ];

      const missingFields = requiredFields.filter(field => !(field in carDetails));

      if (missingFields.length > 0) {
        console.warn("Missing fields:", missingFields);
        // Fill missing fields with defaults
        missingFields.forEach(field => {
          if (field === 'year' || field === 'price' || field === 'mileage') {
            carDetails[field] = 0;
          } else if (field === 'confidence') {
            carDetails[field] = 0.5;
          } else {
            carDetails[field] = '';
          }
        });
      }

      // Ensure numeric fields are numbers
      carDetails.year = parseInt(carDetails.year) || 0;
      carDetails.price = parseFloat(carDetails.price) || 0;
      carDetails.mileage = parseInt(carDetails.mileage) || 0;
      carDetails.confidence = parseFloat(carDetails.confidence) || 0.5;

      console.log("Final extracted car details:", carDetails);

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
        rawResponse: text,
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// FIXED: Add a car to the database with images
export async function addCar({ carData, images }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Create a unique folder name for this car's images
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    // Initialize Supabase client for server-side operations
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Upload all images to Supabase storage
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // Extract the base64 part (remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      // Create filename
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload the file buffer directly
      const { data, error } = await supabase.storage
        .from("car-images")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;

      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No valid images were uploaded");
    }

    // Add the car to the database
    const car = await db.car.create({
      data: {
        id: carId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls,
      },
    });

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error adding car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// KEEP ALL YOUR OTHER EXISTING FUNCTIONS
export async function getCars(search = "") {
  try {
    let where = {};

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serializedCars = cars.map(serializeCarData);

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteCar(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    await db.car.delete({
      where: { id },
    });

    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-images")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images:", error);
        }
      }
    } catch (storageError) {
      console.error("Error with storage operations:", storageError);
    }

    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCarStatus(id, { status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    await db.car.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}