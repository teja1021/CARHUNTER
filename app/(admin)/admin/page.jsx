import { getDashboardData } from "@/actions/admin";
import { Dashboard } from "./_components/dashboard";

export const metadata = {
  title: "Dashboard | Vehiql Admin",
  description: "Admin dashboard for Vehiql car marketplace",
};

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const dashboardData = await getDashboardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  );
}
