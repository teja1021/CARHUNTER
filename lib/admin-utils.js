import { currentUser } from "@clerk/nextjs/server";

export async function isUserAdmin() {
  const user = await currentUser();
  
  // Check multiple ways to determine admin status
  const isAdmin = 
    user?.publicMetadata?.role === "ADMIN" ||
    user?.publicMetadata?.role === "admin" ||
    user?.privateMetadata?.role === "ADMIN" ||
    user?.privateMetadata?.role === "admin";
    
  // You can also check by email if needed
  const adminEmails = [
    "your-admin-email@example.com", // Replace with your actual admin email
    // Add more admin emails here
  ];
  
  const isAdminByEmail = adminEmails.includes(user?.emailAddresses?.[0]?.emailAddress);
  
  return isAdmin || isAdminByEmail;
}

export function getAdminEmails() {
  return [
    "your-admin-email@example.com", // Replace with your actual admin email
    // Add more admin emails here
  ];
}