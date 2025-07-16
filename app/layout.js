import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Mail, Instagram, Facebook, Linkedin } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Car-Hunter",
  description: "Hunt your Dream Car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo-white.png" sizes="any" />
        </head>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Header />
            <main className="min-h-screen pt-16">{children}</main>
            <Toaster richColors />

            <footer className="bg-gray-600/30 py-8">
              <div className="container mx-auto px-4 text-center text-gray-200 space-y-4">
                <p>Made with 💗 by TejaVarma</p>
                <div className="flex justify-center items-center gap-6">
                  <a
                    href="mailto:yourmail@example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Email"
                  >
                    <div className="bg-emerald-400/20 p-3 rounded-full hover:bg-emerald-400/40 transition-colors">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                  </a>
                  <a
                    href="https://instagram.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <div className="bg-emerald-400/20 p-3 rounded-full hover:bg-emerald-400/40 transition-colors">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                  </a>
                  <a
                    href="https://facebook.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <div className="bg-emerald-400/20 p-3 rounded-full hover:bg-emerald-400/40 transition-colors">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                  </a>
                  <a
                    href="https://linkedin.com/in/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <div className="bg-emerald-400/20 p-3 rounded-full hover:bg-emerald-400/40 transition-colors">
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                  </a>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
