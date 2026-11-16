import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { STATUSES } from "../constants/config";
import { getDashboardSummary, getRecentReports } from "../services/api";

export default function DashboardView({
  onSelectPatient,
  onOpenAddPatient,
  onOpenAddReport,
  onPreviewDocument,
  refreshTrigger,
}) {
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDashboardSummary(), getRecentReports(statusFilter)])
      .then(([summaryRes, reportsRes]) => {
        setSummary(summaryRes.data);
        setReports(reportsRes.data);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, [statusFilter, refreshTrigger]);

  const cards = [
    {
      label: "Total Registered Patients",
      value: summary?.total_patients ?? "—",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      accent: "from-blue-600 to-indigo-600",
      subtext: "Active medical profiles",
    },
    {
      label: "Diagnostic Tests Run",
      value: summary?.total_reports ?? "—",
      icon: FileText,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      accent: "from-indigo-600 to-purple-600",
      subtext: "Total lab records cataloged",
    },
    {
      label: "Abnormal Diagnostic Flags",
      value: summary?.abnormal_reports ?? "—",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      accent: "from-rose-500 to-red-600",
      subtext: "Require physician review",
      alert: summary?.abnormal_reports > 0,
    },
    {
      label: "Today's Test Volume",
      value: summary?.reports_today ?? "—",
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accent: "from-emerald-500 to-teal-600",
      subtext: "Logged today",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className={`p-2 rounded-xl border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
                  {c.value}
                </span>
                {c.alert && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Attention
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{c.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Clinical Warning Banner if abnormal tests exist */}
      {summary?.abnormal_reports > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">
                {summary.abnormal_reports} Lab Report{summary.abnormal_reports > 1 ? "s" : ""} Flagged as Abnormal
              </p>
              <p className="text-xs text-rose-700">
                Results fell outside the prescribed reference bounds and require attention.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("Abnormal")}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs shrink-0"
          >
            Filter Abnormal Tests
          </button>
        </div>
      )}

      {/* Recent Activity Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Lab Tests</h3>
            <p className="text-xs text-slate-500">Latest diagnostic entries across all patients</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No test reports found</p>
            <p className="text-xs text-slate-400 mt-1">Get started by recording a new patient test</p>
            <button
              onClick={onOpenAddReport}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              + Record Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <th className="px-6 py-3">Report ID</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Test Category</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500 font-medium">{r.id}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-800">{r.patient_name}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {r.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{r.report_date}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onSelectPatient(r.patient_id || r.patient_name)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>View Patient</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
