import { ChevronRight, Car, Calendar, Shield, Crosshair, Binoculars, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SignedOut } from "@clerk/nextjs";
import { getFeaturedCars } from "@/actions/home";
import { CarCard } from "@/components/car-card";
import { HomeSearch } from "@/components/home-search";
import HuntButton from "@/components/hunt-button";
import CarMakeCard from "@/components/car-make-card";
import BodyTypeCard from "@/components/body-type-card";
import ScoutButton from "@/components/scout-button";
import Link from "next/link";
import Image from "next/image";
import { bodyTypes, carMakes, faqItems } from "@/lib/data";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Creepster } from 'next/font/google';

export const creepster = Creepster({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-creepster',
});

export default async function Home() {
  const featuredCars = await getFeaturedCars();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className={`${creepster.variable} flex flex-col pt-20 bg-background min-h-screen`}>
        {/* Hero Section */}
        <section className="relative py-16 md:py-28 bg-emerald-900/30 border-emerald-700/30 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-900/40 via-emerald-700/10 to-transparent" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-7xl text-white wavy-text">
                Begin the Hunt for Your Dream Car with <br/>
                <span className="text-red-500 text-10xl mt-2 font-creep glitch-text tracking-wider melting-text flex items-center justify-center gap-2">
                  CAR HUNTER AI
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 mt-4 max-w-2xl mx-auto flex items-center justify-center gap-2">
                <Binoculars className="inline-block w-6 h-6 text-emerald-400" />
                Scout, track, and capture your perfect car with AI precision.
              </p>
            </div>
            <HomeSearch />
          </div>
        </section>

        {/* Featured Cars */}
        <section className="py-12 bg-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Crosshair className="w-6 h-6 text-emerald-400" />
                Prime Targets
              </h2>
              <ScoutButton href="/cars" iconName="crosshair">
                See All Prey
              </ScoutButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Make */}
        <section className="py-12 bg-muted-500/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Binoculars className="w-6 h-6 text-emerald-400" />
                Scout by Manufacturer
              </h2>
              <ScoutButton href="/cars" iconName="binoculars">
                Scout All Makes
              </ScoutButton>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {carMakes.map((make) => (
                <CarMakeCard key={make.name} make={make} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-800/30 border-emerald-900/20 hover:border-emerald-700/40 transition-all">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-emerald-400" />
              Why Elite Hunters Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-700/30 text-emerald-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Binoculars className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Wide Hunting Grounds</h3>
                <p className="text-gray-500">
                  Thousands of verified vehicles from trusted dealerships and private sellers.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-700/30 text-emerald-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Crosshair className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Swift Capture</h3>
                <p className="text-gray-500">
                  Book a test drive online in minutes, with flexible scheduling options.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-700/30 text-emerald-400 bg-emerald-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Trophy</h3>
                <p className="text-gray-500">
                  Verified listings and secure booking process for peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Body Type */}
        <section className="py-12 bg-black-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Binoculars className="w-6 h-6 text-emerald-400" />
                Scout by Body Type
              </h2>
              <ScoutButton href="/cars" iconName="binoculars">
                Scout All Types
              </ScoutButton>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bodyTypes.map((type) => (
                <BodyTypeCard key={type.name} type={type} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-gray-50 dark:bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-white dark:text-white flex items-center justify-center gap-2">
              <Binoculars className="w-6 h-6 text-emerald-400" />
              Hunter's Field Guide
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-white dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground dark:text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-emerald-900/30 to-emerald-950/20 border-emerald-800/20 pulse-glow-card">
              <CardContent className="p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="max-w-2xl relative z-10 text-white mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-2">
                    <Crosshair className="w-7 h-7 text-emerald-400" />
                    Ready to Capture Your Dream Car?
                  </h2>
                  <p className="text-lg text-blue-100 mb-8">
                    Join the hunt. Track, target, and claim your next ride with Car Hunter AI.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <HuntButton />
                    <SignedOut>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-blue-700/30 hover:bg-muted/80 flex items-center gap-2"
                        asChild
                      >
                        <Link href="/sign-up">
                          <Trophy className="w-5 h-5 text-emerald-400" />
                          Join the Pack
                        </Link>
                      </Button>
                    </SignedOut>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-blue-800/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute left-0 bottom-0 w-[200px] h-[200px] bg-blue-700/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </ThemeProvider>
  );
}
