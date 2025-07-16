"use client";

import { useState, useEffect } from "react";
import { Trophy, Car, Eye, Medal, Award, Star } from "lucide-react";
import Image from "next/image";
import { getAdminTestDrives } from "@/actions/admin";
import Link from "next/link";

const BADGES = [
	{
		key: "elite",
		label: "Elite Hunter",
		icon: <Medal className="w-7 h-7 text-yellow-400" />,
		minCount: 3,
		description: "Users who have claimed 3 or more vehicles.",
	},
	{
		key: "best",
		label: "Best Hunter", // <-- changed from "Best Customer"
		icon: <Award className="w-7 h-7 text-emerald-400" />,
		minCount: 2,
		description: "Users who have claimed 2 vehicles.",
	},
];

const statusColors = {
	CLAIMED: "bg-emerald-100 text-emerald-700",
	CONFIRMED: "bg-emerald-100 text-emerald-700",
	COMPLETED: "bg-blue-100 text-blue-700",
	PENDING: "bg-yellow-100 text-yellow-700",
	CANCELLED: "bg-red-100 text-red-700",
	REVOKED: "bg-red-100 text-red-700",
};

export default function TrophiesPage() {
	const [loading, setLoading] = useState(true);
	const [userTrophies, setUserTrophies] = useState({});
	const [search, setSearch] = useState("");

	// Fetch and group trophies by user
	useEffect(() => {
		async function fetchTrophies() {
			setLoading(true);
			const result = await getAdminTestDrives({});
			const trophyDrives = (result?.data || []).filter(
				(td) =>
					td.status === "CONFIRMED" ||
					td.status === "CLAIMED" ||
					td.status === "COMPLETED"
			);
			// Group by userId
			const grouped = {};
			for (const td of trophyDrives) {
				if (!td.user?.id) continue;
				if (!grouped[td.user.id])
					grouped[td.user.id] = { user: td.user, trophies: [] };
				grouped[td.user.id].trophies.push(td);
			}
			setUserTrophies(grouped);
			setLoading(false);
		}
		fetchTrophies();
	}, []);

	// Filter users by search
	const filteredUserIds = Object.keys(userTrophies).filter((userId) => {
		const user = userTrophies[userId].user;
		return (
			user.name?.toLowerCase().includes(search.toLowerCase()) ||
			user.email?.toLowerCase().includes(search.toLowerCase())
		);
	});

	// Sort users by trophy count descending
	const sortedUserIds = filteredUserIds.sort(
		(a, b) => userTrophies[b].trophies.length - userTrophies[a].trophies.length
	);

	// Split users by badge
	const eliteHunters = sortedUserIds.filter(
		(id) => userTrophies[id].trophies.length >= BADGES[0].minCount
	);
	const bestCustomers = sortedUserIds.filter(
		(id) =>
			userTrophies[id].trophies.length === BADGES[1].minCount &&
			!eliteHunters.includes(id)
	);
	const hunters = sortedUserIds.filter(
		(id) =>
			userTrophies[id].trophies.length === 1 &&
			!eliteHunters.includes(id) &&
			!bestCustomers.includes(id)
	);

	return (
		<div className="max-w-5xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold flex items-center gap-3 mb-8 text-white">
				<Trophy className="w-8 h-8 text-yellow-400" />
				Hunter’s Trophy Room
			</h1>
			<p className="mb-6 text-muted-foreground text-lg">
				Admin can spy on top hunters and customers who have claimed the most
				vehicles!
			</p>
			<div className="mb-8 flex items-center gap-2">
				<div className="relative flex-1">
					<input
						type="text"
						placeholder="Search by hunter name or email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10 pr-4 py-2 rounded-lg border border-white w-full bg-muted-50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
					/>
					<span className="absolute left-3 top-3">
						<Car className="h-5 w-5 text-gray-400" />
					</span>
				</div>
			</div>

			{loading ? (
				<div className="col-span-2 text-center py-12 text-gray-400">
					<Trophy className="w-12 h-12 mx-auto mb-4 animate-spin" />
					<div className="text-lg font-semibold">Loading trophies...</div>
				</div>
			) : (
				<>
					{/* Elite Hunters */}
					<section className="mb-12">
						<div className="flex items-center gap-3 mb-2">
							{BADGES[0].icon}
							<h2 className="text-2xl font-bold text-yellow-400">
								{BADGES[0].label}
							</h2>
						</div>
						<p className="mb-4 text-muted-foreground">
							{BADGES[0].description}
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{eliteHunters.length > 0 ? (
							 eliteHunters.map((userId) => {
									const { user, trophies } = userTrophies[userId];
									return (
										<div
											key={userId}
											className="bg-muted-50 rounded-lg shadow p-6 border border-white"
										>
											<div className="flex items-center gap-4 mb-2">
												{user.imageUrl ? (
													<Image
														src={user.imageUrl}
														alt={user.name}
														width={48}
														height={48}
														className="rounded-full border border-emerald-200"
													/>
												) : (
													<Star className="w-10 h-10 text-yellow-400" />
												)}
												<div>
													<h3 className="text-lg font-bold text-white">
														{user.name}
													</h3>
													<p className="text-gray-400">{user.email}</p>
													<span className="text-xs text-emerald-700 font-semibold">
														{trophies.length} trophies
													</span>
												</div>
											</div>
											<div className="space-y-2">
												{trophies.map((trophy) => (
													<div
														key={trophy.id}
														className="flex items-center gap-3 bg-muted-100 rounded p-2"
													>
														{trophy.car?.images?.[0] ? (
															<Image
																src={trophy.car.images[0]}
																alt={`${trophy.car.make} ${trophy.car.model}`}
																width={60}
																height={40}
																className="rounded border border-emerald-200"
															/>
														) : (
															<Car className="w-10 h-10 text-emerald-500 bg-muted-100 rounded p-1" />
														)}
														<div>
															<div className="font-bold text-white">
																{trophy.car?.make && trophy.car?.model
																	? `${trophy.car.make} ${trophy.car.model}`
																	: trophy.car?.id
																	? `Car #${trophy.car.id}`
																	: "Car details unavailable"}
															</div>
															<div className="text-gray-400 text-xs">
																Color: {trophy.car?.color || "Unknown"} | Price:{" "}
																{trophy.car?.price
																	? `₹${Number(trophy.car.price).toLocaleString()}`
																	: "N/A"}
															</div>
															<span
																className={`px-2 py-0.5 rounded-full text-xs font-bold ${
																	statusColors[trophy.status] ||
																	"bg-gray-100 text-gray-700"
																}`}
															>
																{trophy.status}
															</span>
														</div>
														<Link
															href={`/admin/cars/${trophy.car?.id}`}
															className="ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-blue-100 text-blue-600 font-semibold"
															title="View Details"
														>
															<Eye className="w-4 h-4" />
															Details
														</Link>
													</div>
												))}
											</div>
										</div>
									);
								})
							) : (
								<div className="col-span-2 text-center text-gray-400 py-8">
									No user achieved this yet
								</div>
							)}
						</div>
					</section>

					{/* Best Customers */}
					<section className="mb-12">
						<div className="flex items-center gap-3 mb-2">
							{BADGES[1].icon}
							<h2 className="text-2xl font-bold text-emerald-400">
								{BADGES[1].label}
							</h2>
						</div>
						<p className="mb-4 text-muted-foreground">
							{BADGES[1].description}
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{bestCustomers.length > 0 ? (
								bestCustomers.map((userId) => {
									const { user, trophies } = userTrophies[userId];
									return (
										<div
											key={userId}
											className="bg-muted-50 rounded-lg shadow p-6 border border-white"
										>
											<div className="flex items-center gap-4 mb-2">
												{user.imageUrl ? (
													<Image
														src={user.imageUrl}
														alt={user.name}
														width={48}
														height={48}
														className="rounded-full border border-emerald-200"
													/>
												) : (
													<Star className="w-10 h-10 text-emerald-400" />
												)}
												<div>
													<h3 className="text-lg font-bold text-white">
														{user.name}
													</h3>
													<p className="text-gray-400">{user.email}</p>
													<span className="text-xs text-emerald-700 font-semibold">
														{trophies.length} trophies
													</span>
												</div>
											</div>
											<div className="space-y-2">
												{trophies.map((trophy) => (
													<div
														key={trophy.id}
														className="flex items-center gap-3 bg-muted-100 rounded p-2"
													>
														{trophy.car?.images?.[0] ? (
															<Image
																src={trophy.car.images[0]}
																alt={`${trophy.car.make} ${trophy.car.model}`}
																width={60}
																height={40}
																className="rounded border border-emerald-200"
															/>
														) : (
															<Car className="w-10 h-10 text-emerald-500 bg-muted-100 rounded p-1" />
														)}
														<div>
															<div className="font-bold text-white">
																{trophy.car?.make && trophy.car?.model
																	? `${trophy.car.make} ${trophy.car.model}`
																	: trophy.car?.id
																	? `Car #${trophy.car.id}`
																	: "Car details unavailable"}
															</div>
															<div className="text-gray-400 text-xs">
																Color: {trophy.car?.color || "Unknown"} | Price:{" "}
																{trophy.car?.price
																	? `₹${Number(trophy.car.price).toLocaleString()}`
																	: "N/A"}
															</div>
															<span
																className={`px-2 py-0.5 rounded-full text-xs font-bold ${
																	statusColors[trophy.status] ||
																	"bg-gray-100 text-gray-700"
																}`}
															>
																{trophy.status}
															</span>
														</div>
														<Link
															href={`/admin/cars/${trophy.car?.id}`}
															className="ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-blue-100 text-blue-600 font-semibold"
															title="View Details"
														>
															<Eye className="w-4 h-4" />
															Details
														</Link>
													</div>
												))}
											</div>
										</div>
									);
								})
							) : (
								<div className="col-span-2 text-center text-gray-400 py-8">
									No user achieved this yet
								</div>
							)}
						</div>
					</section>

					{/* Hunters */}
					<section>
						<div className="flex items-center gap-3 mb-2">
							<Star className="w-7 h-7 text-gray-300" />
							<h2 className="text-2xl font-bold text-gray-300">Hunters</h2>
						</div>
						<p className="mb-4 text-muted-foreground">
							Users who have claimed 1 vehicle.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{hunters.length > 0 ? (
								hunters.map((userId) => {
									const { user, trophies } = userTrophies[userId];
									return (
										<div
											key={userId}
											className="bg-muted-50 rounded-lg shadow p-6 border border-white"
										>
											<div className="flex items-center gap-4 mb-2">
												{user.imageUrl ? (
													<Image
														src={user.imageUrl}
														alt={user.name}
														width={48}
														height={48}
														className="rounded-full border border-emerald-200"
													/>
												) : (
													<Star className="w-10 h-10 text-gray-300" />
												)}
												<div>
													<h3 className="text-lg font-bold text-white">
														{user.name}
													</h3>
													<p className="text-gray-400">{user.email}</p>
													<span className="text-xs text-emerald-700 font-semibold">
														{trophies.length} trophy
													</span>
												</div>
											</div>
											<div className="space-y-2">
												{trophies.map((trophy) => (
													<div
														key={trophy.id}
														className="flex items-center gap-3 bg-muted-100 rounded p-2"
													>
														{trophy.car?.images?.[0] ? (
															<Image
																src={trophy.car.images[0]}
																alt={`${trophy.car.make} ${trophy.car.model}`}
																width={60}
																height={40}
																className="rounded border border-emerald-200"
															/>
														) : (
															<Car className="w-10 h-10 text-emerald-500 bg-muted-100 rounded p-1" />
														)}
														<div>
															<div className="font-bold text-white">
																{trophy.car?.make && trophy.car?.model
																	? `${trophy.car.make} ${trophy.car.model}`
																	: trophy.car?.id
																	? `Car #${trophy.car.id}`
																	: "Car details unavailable"}
															</div>
															<div className="text-gray-400 text-xs">
																Color: {trophy.car?.color || "Unknown"} | Price:{" "}
																{trophy.car?.price
																	? `₹${Number(trophy.car.price).toLocaleString()}`
																	: "N/A"}
															</div>
															<span
																className={`px-2 py-0.5 rounded-full text-xs font-bold ${
																	statusColors[trophy.status] ||
																	"bg-gray-100 text-gray-700"
																}`}
															>
																{trophy.status}
															</span>
														</div>
														<Link
															href={`/admin/cars/${trophy.car?.id}`}
															className="ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-blue-100 text-blue-600 font-semibold"
															title="View Details"
														>
															<Eye className="w-4 h-4" />
															Details
														</Link>
													</div>
												))}
											</div>
										</div>
									);
								})
							) : (
								<div className="col-span-2 text-center text-gray-400 py-8">
									No user achieved this yet
								</div>
							)}
						</div>
					</section>
				</>
			)}
		</div>
	);
}