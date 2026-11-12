import {
  Activity,
  Users,
  FileText,
  Plus,
  FlaskConical,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenAddPatient,
  onOpenAddReport,
  totalPatients = 0,
  totalReports = 0,
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Activity,
      badge: null,
      desc: "Analytics & Overview",
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      badge: totalPatients > 0 ? totalPatients : null,
      desc: "Directory & Medical Records",
    },
    {
      id: "reports",
      label: "All Reports",
      icon: FileText,
      badge: totalReports > 0 ? totalReports : null,
      desc: "Diagnostic Test Registry",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen shrink-0 sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 tracking-tight text-base leading-tight">
            PSS Diagnostics
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Lab Management System</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={onOpenAddPatient}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>

        <button
          onClick={onOpenAddReport}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-[0.98] rounded-xl transition-all"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Record Lab Test</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Clinical Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-50/80 text-blue-700 shadow-xs border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span className="text-left">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-blue-200/60 text-blue-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Database & System Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <Database className="w-4 h-4 text-slate-400" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-700 truncate">SQLite DB Connected</p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Backend Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
