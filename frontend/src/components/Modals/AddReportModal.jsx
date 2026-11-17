import { useState, useEffect } from "react";
import {
  X,
  FilePlus,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Plus,
  Trash2,
  Layers,
  Sparkles,
} from "lucide-react";
import { createReport } from "../../services/api";
import { REPORT_TYPES, STANDARD_PANELS } from "../../constants/config";

// Helper function to evaluate individual metric status
function evaluateStatus(val, min, max) {
  if (val === "" || val === null || val === undefined) return "Pending";
  const s = String(val).trim().toLowerCase();

  // Qualitative checks
  if (["positive", "reactive", "detected", "abnormal", "present"].includes(s)) {
    return "Abnormal";
  }
  if (["negative", "non-reactive", "not detected", "normal", "absent", "nil", "clear"].includes(s)) {
    return "Normal";
  }

  // Numeric checks
  const num = parseFloat(val);
  if (!isNaN(num)) {
    const minVal = min !== null && min !== "" ? parseFloat(min) : null;
    const maxVal = max !== null && max !== "" ? parseFloat(max) : null;
    if (minVal !== null && num < minVal) return "Abnormal";
    if (maxVal !== null && num > maxVal) return "Abnormal";
    return "Normal";
  }

  return "Normal";
}

export default function AddReportModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId = null,
  patients = [],
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [reportType, setReportType] = useState("Lipid Panel");
  const [reportDate, setReportDate] = useState(todayStr);
  const [metrics, setMetrics] = useState(STANDARD_PANELS["Lipid Panel"] || []);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPatientId) {
      setPatientId(initialPatientId);
    } else if (patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [initialPatientId, patients, isOpen]);

  // When report type changes, populate standard panel template
  const handleCategoryChange = (newType) => {
    setReportType(newType);
    const template = STANDARD_PANELS[newType] || STANDARD_PANELS["Custom"];
    setMetrics(template.map((m) => ({ ...m, result_value: m.result_value || "" })));
  };

  if (!isOpen) return null;

  // Metric updates
  const handleUpdateMetric = (index, field, value) => {
    setMetrics((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveMetric = (index) => {
    if (metrics.length <= 1) {
      alert("A lab report must contain at least one metric.");
      return;
    }
    setMetrics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMetric = () => {
    setMetrics((prev) => [
      ...prev,
      {
        name: "New Parameter",
        unit: "",
        ref_min: null,
        ref_max: null,
        result_value: "",
      },
    ]);
  };

  // Compute live statuses
  const evaluatedMetrics = metrics.map((m) => ({
    ...m,
    status: evaluateStatus(m.result_value, m.ref_min, m.ref_max),
  }));

  const hasAbnormal = evaluatedMetrics.some((m) => m.status === "Abnormal");
  const allFilled = evaluatedMetrics.every(
    (m) => m.result_value !== "" && m.result_value !== null
  );

  const overallStatus = hasAbnormal ? "Abnormal" : "Normal";

  const validate = () => {
    const errs = {};
    if (!patientId) errs.patient_id = "Please select a patient";
    if (!reportDate) errs.report_date = "Date is required";
    if (metrics.length === 0) errs.metrics = "At least one metric is required";

    const emptyMetric = metrics.some((m) => !m.name.trim() || m.result_value === "");
    if (emptyMetric) {
      errs.metrics = "Please enter values for all metrics in the panel.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("patient_id", patientId);
    formData.append("report_type", reportType);
    formData.append("report_date", reportDate);
    formData.append("items_json", JSON.stringify(metrics));
    if (file) formData.append("file", file);

    try {
      const { data } = await createReport(formData);
      setFile(null);
      handleCategoryChange("Lipid Panel");
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || "Failed to submit lab report panel." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Record Clinical Diagnostic Panel
              </h2>
              <p className="text-xs text-slate-500">
                Multi-metric report with auto-evaluated numeric & qualitative results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errors.form && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Assigned Patient & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Patient
              </label>
              {initialPatientId ? (
                <div className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-between">
                  <span>
                    {patients.find((p) => p.id === initialPatientId)?.name || "Selected Patient"}
                  </span>
                  <span className="font-mono text-xs bg-slate-200/80 px-2 py-0.5 rounded text-slate-600">
                    {initialPatientId}
                  </span>
                </div>
              ) : (
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition-all text-slate-700"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              )}
              {errors.patient_id && <p className="text-xs text-rose-500 mt-1">{errors.patient_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Panel Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnostic Panel Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REPORT_TYPES.map((t) => {
                const isActive = reportType === t;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => handleCategoryChange(t)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Metric Test Items Box */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/50">
            <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Panel Test Metrics ({metrics.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Enter observed numbers (e.g. 140) or qualitative text (e.g. Positive / Negative)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMetric}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            {/* Metrics List */}
            <div className="p-3 space-y-2.5 max-h-[260px] overflow-y-auto">
              {evaluatedMetrics.map((m, idx) => {
                const isAbnormal = m.status === "Abnormal";
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border bg-white flex flex-col sm:flex-row sm:items-center gap-2.5 transition-all ${
                      isAbnormal
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Status Dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        m.status === "Abnormal"
                          ? "bg-rose-500"
                          : m.status === "Normal"
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                      title={`Status: ${m.status}`}
                    />

                    {/* Metric Name */}
                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMetric(idx, "name", e.target.value)}
                        placeholder="Parameter Name"
                        className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {m.ref_min !== null ? `${m.ref_min}–${m.ref_max}` : "Qualitative / Std"} {m.unit}
                      </span>
                    </div>

                    {/* Observed Result Value Input */}
                    <div className="w-full sm:w-36">
                      <input
                        type="text"
                        value={m.result_value}
                        onChange={(e) => handleUpdateMetric(idx, "result_value", e.target.value)}
                        placeholder="Result (e.g. 150 or Negative)"
                        className={`w-full px-2.5 py-1 text-xs rounded-lg border ${
                          isAbnormal
                            ? "border-rose-300 font-bold text-rose-700 bg-rose-50/50"
                            : "border-slate-200 font-semibold text-slate-800 bg-white"
                        } focus:outline-none focus:border-indigo-500`}
                      />
                    </div>

                    {/* Unit */}
                    <div className="w-20">
                      <input
                        type="text"
                        value={m.unit || ""}
                        onChange={(e) => handleUpdateMetric(idx, "unit", e.target.value)}
                        placeholder="Unit"
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-slate-50/50 font-mono text-[11px] focus:outline-none"
                      />
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        m.status === "Abnormal"
                          ? "bg-rose-100 text-rose-700"
                          : m.status === "Normal"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.status}
                    </span>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(idx)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors shrink-0"
                      title="Remove Parameter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {errors.metrics && (
              <p className="text-xs text-rose-500 px-4 py-2 border-t border-rose-100 bg-rose-50">
                {errors.metrics}
              </p>
            )}
          </div>

          {/* Live Overall Panel Evaluation Banner */}
          {allFilled && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                hasAbnormal
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {hasAbnormal ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  Overall Panel Status:{" "}
                  <strong>
                    {hasAbnormal
                      ? "ABNORMAL (One or more parameters outside normal limits)"
                      : "NORMAL (All parameters within reference bounds)"}
                  </strong>
                </span>
              </div>
              <span className="font-bold text-[11px] uppercase tracking-wider">
                {overallStatus}
              </span>
            </div>
          )}

          {/* Single Shared File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attach Physical Lab Slip / Report Scan (1 Shared PDF or Image)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-indigo-700 text-xs font-medium">
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-0.5 text-slate-500">
                  <Upload className="w-5 h-5 text-slate-400 mb-0.5" />
                  <p className="text-xs font-medium text-slate-700">
                    Click or drag & drop the scanned lab sheet
                  </p>
                  <p className="text-[11px] text-slate-400">One slip covers all metrics in this panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 rounded-xl shadow-sm transition-all"
            >
              {submitting ? "Evaluating Panel..." : `Save ${reportType} (${metrics.length} Tests)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
