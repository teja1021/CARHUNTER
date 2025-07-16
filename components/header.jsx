import React from "react";
import { Button } from "./ui/button";
import { Heart, CarFront, Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";
import { BackgroundMusic } from "./background-music"; // 🔧 FIXED IMPORT
import MusicToggleButton from "./MusicToggleButton";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-2 h-16 flex items-center justify-between">
          <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-2 cursor-pointer">
            <Image
              src={"/CarHunter-logo-larged__2_-removebg-preview.png"}
              alt="CarHunter Logo"
              width={260}
              height={80}
              className="h-16 w-auto object-contain"
            />
            {isAdminPage && (
              <span className="text-xs font-extralight">admin</span>
            )}
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {isAdminPage ? (
              <>
                <Link href="/">
                  <Button variant="outline" className="flex text-emerald-400 items-center gap-2">
                    <ArrowLeft size={18} />
                    <span>Back to App</span>
                  </Button>
                </Link>
              </>
            ) : (
              <SignedIn>
                {!isAdmin && (
                  <Link
                    href="/reservations"
                    className="flex items-center text-white bg-emerald-600/40 border-emerald-400 hover:bg-muted-50 hover:text-emerald-500 gap-2"
                  >
                    <Button variant="outline">
                      <CarFront size={18} />
                      <span className="hidden md:inline">My Reservations</span>
                    </Button>
                  </Link>
                )}
                <a href="/saved-cars">
                  <Button variant="outline" className="flex items-center gap-2 text-white hover:text-black hover:bg-white">
                    <Heart size={18} />
                    <span className="hidden md:inline">Saved Cars</span>
                  </Button>
                </a>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" className="flex items-center text-white bg-emerald-600/40 border-emerald-400 hover:bg-muted-50 hover:text-emerald-500 gap-2">
                      <Layout size={18} />
                      <span className="hidden md:inline">Admin Portal</span>
                    </Button>
                  </Link>
                )}
              </SignedIn>
            )}

            <SignedOut>
              {!isAdminPage && (
                <SignInButton forceRedirectUrl="/">
                  <Button variant="outline" className="text-emerald-400">Login</Button>
                </SignInButton>
              )}
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
            
            {/* Music Toggle Button - Keep the same functionality */}
            <MusicToggleButton />
          </div>
        </nav>
      </header>
      
      {/* Background Music Component - Keep the same functionality */}
      <BackgroundMusic />
    </>
  );
};

export default Header;