import Dashboard from "../chat/Dashboard";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <div className="flex-1 flex flex-col min-w-0">
        <Dashboard />
      </div>
    </div>
  );
}
