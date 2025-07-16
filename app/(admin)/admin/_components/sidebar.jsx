"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Car, Calendar, Cog, LogOut, Binoculars, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";

// Hunter-themed navigation items
const routes = [
	{
		label: "Dashboard",
		icon: Crosshair,
		href: "/admin",
	},
	{
		label: "Scout Vehicles",
		icon: Binoculars,
		href: "/admin/cars",
	},
	{
		label: "Test Drive Tracker",
		icon: Calendar,
		href: "/admin/test-drives",
	},
	{
		label: "Hunter Settings",
		icon: Cog,
		href: "/admin/settings",
	},
	{
		label: "Trophy Room",
		icon: Trophy,
		href: "/admin/trophies",
	},
];

export const Sidebar = () => {
	const pathname = usePathname();

	return (
		<>
			{/* Desktop Sidebar */}
			<div className="hidden md:flex h-full flex-col overflow-y-auto bg-white/50 shadow-sm border-r">
				<div className="p-6 bg-white">
					<Link href="/admin">
						<h1 className="text-2xl text-center  font-extrabold font-italic wavy-text text-emerald-700 drop-shadow-lg">
							Hunter's Headquarter
						</h1>
					</Link>
				</div>
				<div className="flex flex-col w-full">
					{routes.map((route) => (
						<Link
							key={route.href}
							href={route.href}
							className={cn(
								"flex items-center gap-x-2 text-black text-sm font-medium pl-6 transition-all hover:text-green-600 hover:bg-slate-100/50",
								pathname === route.href
									? "text-white bg-emerald-700 hover:bg-white/50 hover:text-emerald-700"
									: "",
								"h-12"
							)}
						>
							<route.icon className="h-5 w-5" />
							{route.label}
						</Link>
					))}
				</div>
				<div className="mt-auto p-6">
					<SignOutButton>
						<button className="flex items-center gap-x-2 text-slate-500 text-sm font-medium transition-all hover:text-slate-600">
							<LogOut className="h-5 w-5" />
							Leave the Hunt
						</button>
					</SignOutButton>
				</div>
			</div>

			{/* Mobile Bottom Tabs */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
				{routes.map((route) => (
					<Link
						key={route.href}
						href={route.href}
						className={cn(
							"flex flex-col items-center justify-center text-slate-500 text-xs font-medium transition-all",
							pathname === route.href ? "text-blue-700" : "",
							"py-1 flex-1"
						)}
					>
						<route.icon
							className={cn(
								"h-6 w-6 mb-1",
								pathname === route.href ? "text-blue-900" : "text-slate-500"
							)}
						/>
						{route.label}
					</Link>
				))}
			</div>
		</>
	);
};
