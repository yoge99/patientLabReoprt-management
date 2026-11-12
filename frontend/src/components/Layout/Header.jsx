import { Search, Plus, Calendar, Bell } from "lucide-react";

export default function Header({
  activeTab,
  searchQuery,
  setSearchQuery,
  onOpenAddPatient,
  onOpenAddReport,
}) {
  const titles = {
    dashboard: {
      title: "Clinical Dashboard",
      subtitle: "Real-time diagnostic analytics, abnormal triage, and daily metrics",
    },
    patients: {
      title: "Patient Management",
      subtitle: "Patient profiles, demographic records, and individual test history",
    },
    reports: {
      title: "Diagnostic Reports Registry",
      subtitle: "Universal test archive with range evaluations and scanned attachments",
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="bg-white border-b border-slate-200/90 px-8 py-4 sticky top-0 z-10 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-500">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, IDs, test types..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Add Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === "patients" ? onOpenAddPatient : onOpenAddReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === "patients" ? "Add Patient" : "New Report"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
