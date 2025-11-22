import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata = {
  title: "Dashboard | FlexED Systems",
  description: "Dashboard for FlexED Systems",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="ml-[250px] lg:ml-[300px] flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
