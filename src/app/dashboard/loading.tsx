export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
      <div className="h-4 bg-slate-100 rounded w-72"></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <div className="h-48 bg-slate-100 rounded-2xl"></div>
        <div className="h-48 bg-slate-100 rounded-2xl"></div>
        <div className="h-48 bg-slate-100 rounded-2xl"></div>
      </div>
    </div>
  );
}
