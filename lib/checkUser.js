import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    
    // 🔧 ADD ADMIN ROLE LOGIC
    const userEmail = user.emailAddresses[0].emailAddress;
    const isAdmin = userEmail === "tejavarma1021@gmail.com";

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: userEmail,
        role: isAdmin ? "ADMIN" : "USER", // 🔧 ADD ROLE FIELD
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
    
    // 🔧 ADD FALLBACK TO PREVENT CRASHES
    const userEmail = user.emailAddresses[0].emailAddress;
    return {
      id: user.id,
      clerkUserId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: userEmail,
      imageUrl: user.imageUrl,
      role: userEmail === "tejavarma1021@gmail.com" ? "ADMIN" : "USER",
    };
  }
};
