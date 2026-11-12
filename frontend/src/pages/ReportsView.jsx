import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Users,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { STATUSES, REPORT_TYPES } from "../constants/config";
import { getReports, deleteReport } from "../services/api";

export default function ReportsView({
  onSelectPatient,
  onOpenAddReport,
  onPreviewDocument,
  refreshTrigger,
  onReportDeleted,
  searchFilter = "",
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    report_type: "",
    date_from: "",
    date_to: "",
  });
  const [localSearch, setLocalSearch] = useState(searchFilter);

  useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const { data } = await getReports(filters);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [filters, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lab report?")) return;
    try {
      await deleteReport(id);
      loadAllReports();
      if (onReportDeleted) onReportDeleted();
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const filteredReports = reports.filter((r) => {
    const term = localSearch.toLowerCase();
    const patientName = (r.patient_name || "").toLowerCase();
    const patientId = (r.patient_id || "").toLowerCase();
    const reportId = (r.id || "").toLowerCase();
    const type = (r.report_type || "").toLowerCase();
    return (
      patientName.includes(term) ||
      patientId.includes(term) ||
      reportId.includes(term) ||
      type.includes(term)
    );
  });

  const abnormalCount = filteredReports.filter((r) => r.status === "Abnormal").length;
  const normalCount = filteredReports.filter((r) => r.status === "Normal").length;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Filtered Reports</p>
            <p className="text-xl font-extrabold text-slate-800">{filteredReports.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Normal Results</p>
            <p className="text-xl font-extrabold text-emerald-600">{normalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Abnormal Results</p>
            <p className="text-xl font-extrabold text-rose-600">{abnormalCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by patient, ID, or report type..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filters.report_type}
              onChange={(e) => setFilters((f) => ({ ...f, report_type: e.target.value }))}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="">All Types</option>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
              title="From date"
            />

            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
              title="To date"
            />

            <button
              onClick={onOpenAddReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Report</span>
            </button>
          </div>
        </div>

        {/* Master Reports Table */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading diagnostic registry...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No diagnostic reports found</h4>
            <p className="text-xs text-slate-400 mt-1">Adjust filters or record a new lab test report</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <th className="px-6 py-3">Report ID</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Observed Result</th>
                  <th className="px-6 py-3">Reference Interval</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Attachment</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500 font-medium">{r.id}</td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => onSelectPatient(r.patient_id)}
                        className="font-bold text-slate-800 hover:text-blue-600 hover:underline text-left block"
                      >
                        {r.patient_name || "Patient"}
                      </button>
                      <span className="font-mono text-[10px] text-slate-400">{r.patient_id}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {r.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{r.report_date}</td>
                    <td className="px-6 py-3.5 font-extrabold text-slate-800">
                      {r.result_value} <span className="font-normal text-slate-500 text-[11px]">{r.unit}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {r.ref_min} – {r.ref_max} {r.unit}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3.5">
                      {r.file_path ? (
                        <button
                          onClick={() =>
                            onPreviewDocument(
                              r.file_path,
                              `${r.report_type} - ${r.patient_name} (${r.report_date})`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
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
