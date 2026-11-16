import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  FilePlus,
  Trash2,
  Calendar,
  Phone,
  FileText,
  AlertTriangle,
  Paperclip,
  Eye,
  Filter,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { STATUSES, REPORT_TYPES } from "../constants/config";
import { getPatient, getReports, deletePatient, deleteReport } from "../services/api";

export default function PatientsView({
  patients = [],
  selectedPatientId,
  onSelectPatient,
  onOpenAddPatient,
  onOpenAddReportForPatient,
  onPreviewDocument,
  onPatientDeleted,
  onReportDeleted,
  searchFilter = "",
}) {
  const [activePatient, setActivePatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    report_type: "",
    date_from: "",
    date_to: "",
  });
  const [loadingReports, setLoadingReports] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchFilter);

  // Sync search filter from parent if provided
  useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  // Determine which patient to select
  useEffect(() => {
    if (patients.length === 0) {
      setActivePatient(null);
      setReports([]);
      return;
    }

    const current = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (current && (!activePatient || activePatient.id !== current.id)) {
      loadPatientDetails(current.id);
    }
  }, [selectedPatientId, patients]);

  const loadPatientDetails = async (id) => {
    try {
      const { data } = await getPatient(id);
      setActivePatient(data);
      loadReportsForPatient(id, filters);
    } catch (err) {
      console.error("Failed to load patient:", err);
    }
  };

  const loadReportsForPatient = async (patientId, currentFilters) => {
    setLoadingReports(true);
    try {
      const { data } = await getReports({
        patient_id: patientId,
        ...currentFilters,
      });
      setReports(data);
    } catch (err) {
      console.error("Failed to load patient reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Re-fetch reports when filters change
  useEffect(() => {
    if (activePatient) {
      loadReportsForPatient(activePatient.id, filters);
    }
  }, [filters, activePatient?.id]);

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient profile and all their lab records?")) {
      return;
    }
    try {
      await deletePatient(id);
      if (onPatientDeleted) onPatientDeleted(id);
    } catch (err) {
      alert("Failed to delete patient profile.");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Delete this lab report?")) return;
    try {
      await deleteReport(reportId);
      if (activePatient) {
        loadReportsForPatient(activePatient.id, filters);
      }
      if (onReportDeleted) onReportDeleted();
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  // Filter patients by localSearch
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(localSearch.toLowerCase()) ||
      p.contact.includes(localSearch)
  );

  const abnormalCount = reports.filter((r) => r.status === "Abnormal").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
      {/* LEFT PANE: Patients Directory */}
      <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Directory Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Patients Directory</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {filteredPatients.length}
              </span>
            </div>
            <button
              onClick={onOpenAddPatient}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter by name, ID or phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[680px]">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No matching patients</p>
            </div>
          ) : (
            filteredPatients.map((p) => {
              const isSelected = activePatient?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPatient(p.id);
                    loadPatientDetails(p.id);
                  }}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50/80 border-l-4 border-l-blue-600 pl-3.5 shadow-2xs"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                        <span className="text-[10px] text-slate-400">• {p.age}y</span>
                        <span className="text-[10px] text-slate-400">• {p.gender}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400">{p.contact}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Selected Patient Profile & Related Options */}
      <div className="lg:col-span-8 space-y-6">
        {!activePatient ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No Patient Selected</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Select a patient from the directory on the left or register a new patient to view profile details and diagnostic history.
            </p>
            <button
              onClick={onOpenAddPatient}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>
        ) : (
          <>
            {/* Patient Demographic Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20">
                    {activePatient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                        {activePatient.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {activePatient.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Age: <strong className="text-slate-700">{activePatient.age} yrs</strong></span>
                      <span>•</span>
                      <span>Gender: <strong className="text-slate-700">{activePatient.gender}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700">{activePatient.contact}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onOpenAddReportForPatient(activePatient.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Lab Report</span>
                  </button>
                  <button
                    onClick={() => handleDeletePatient(activePatient.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                    title="Delete patient and all lab records"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Quick Stats Chips */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-400 font-medium">Total Test History</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{reports.length} Reports</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-400 font-medium">Abnormal Results</span>
                  <p className={`text-base font-bold mt-0.5 ${abnormalCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {abnormalCount} Abnormal
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-400 font-medium">Latest Evaluation</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {reports[0]?.report_date || "No tests logged"}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Option: Patient's Lab Reports History */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Filter Toolbar */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Diagnostic Reports History</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {reports.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
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
                    onChange={(e) => setFilters((prev) => ({ ...prev, report_type: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Test Types</option>
                    {REPORT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                    title="From date"
                  />

                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                    title="To date"
                  />
                </div>
              </div>

              {/* Reports Table */}
              {loadingReports ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No lab reports found for this patient</p>
                  <p className="text-xs text-slate-400 mt-1">Record the first clinical test for {activePatient.name}</p>
                  <button
                    onClick={() => onOpenAddReportForPatient(activePatient.id)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                  >
                    + Add Lab Report
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                        <th className="px-6 py-3">Test Type</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Observed Result</th>
                        <th className="px-6 py-3">Reference Interval</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Attachment</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-800">
                            {r.report_type}
                            <span className="block font-mono text-[10px] text-slate-400 font-normal">
                              {r.id}
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
                                    `${r.report_type} - ${activePatient.name} (${r.report_date})`
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
                              onClick={() => handleDeleteReport(r.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Report"
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
          </>
        )}
      </div>
    </div>
  );
}
