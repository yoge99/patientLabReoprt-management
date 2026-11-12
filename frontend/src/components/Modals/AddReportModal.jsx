import { useState, useEffect } from "react";
import { X, FilePlus, Upload, AlertCircle, CheckCircle2, AlertTriangle, Paperclip } from "lucide-react";
import { createReport } from "../../services/api";
import { REPORT_TYPES } from "../../constants/config";

export default function AddReportModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId = null,
  patients = [],
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    patient_id: initialPatientId || "",
    report_type: "Blood Test",
    report_date: todayStr,
    result_value: "",
    unit: "mg/dL",
    ref_min: "",
    ref_max: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPatientId) {
      setForm((prev) => ({ ...prev, patient_id: initialPatientId }));
    } else if (patients.length > 0 && !form.patient_id) {
      setForm((prev) => ({ ...prev, patient_id: patients[0].id }));
    }
  }, [initialPatientId, patients, isOpen]);

  if (!isOpen) return null;

  // Live status preview calculation
  const numVal = parseFloat(form.result_value);
  const minVal = parseFloat(form.ref_min);
  const maxVal = parseFloat(form.ref_max);
  const hasRange = !isNaN(numVal) && !isNaN(minVal) && !isNaN(maxVal);
  const isAbnormal = hasRange && (numVal < minVal || numVal > maxVal);

  const validate = () => {
    const errs = {};
    if (!form.patient_id) errs.patient_id = "Please select a patient";
    if (!form.report_date) errs.report_date = "Date is required";
    if (form.result_value === "" || isNaN(numVal)) errs.result_value = "Valid result value is required";
    if (form.ref_min === "" || isNaN(minVal)) errs.ref_min = "Min reference bound is required";
    if (form.ref_max === "" || isNaN(maxVal)) errs.ref_max = "Max reference bound is required";
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal >= maxVal) {
      errs.ref_max = "Max bound must be greater than min";
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
    formData.append("patient_id", form.patient_id);
    formData.append("report_type", form.report_type);
    formData.append("report_date", form.report_date);
    formData.append("result_value", numVal);
    formData.append("unit", form.unit || "unit");
    formData.append("ref_min", minVal);
    formData.append("ref_max", maxVal);
    if (file) formData.append("file", file);

    try {
      const { data } = await createReport(formData);
      setFile(null);
      setForm({
        patient_id: initialPatientId || (patients[0]?.id || ""),
        report_type: "Blood Test",
        report_date: todayStr,
        result_value: "",
        unit: "mg/dL",
        ref_min: "",
        ref_max: "",
      });
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || "Failed to submit lab report." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Record New Lab Test</h2>
              <p className="text-xs text-slate-500">Auto-evaluates clinical range against reference bounds</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errors.form && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Patient
            </label>
            {initialPatientId ? (
              <div className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-between">
                <span>
                  {patients.find((p) => p.id === initialPatientId)?.name || "Selected Patient"}
                </span>
                <span className="font-mono text-xs bg-slate-200/80 px-2 py-0.5 rounded text-slate-600">
                  {initialPatientId}
                </span>
              </div>
            ) : (
              <select
                value={form.patient_id}
                onChange={(e) => setForm((prev) => ({ ...prev, patient_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700"
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

          {/* Test Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Report Type
              </label>
              <select
                value={form.report_type}
                onChange={(e) => setForm((prev) => ({ ...prev, report_type: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Test Date
              </label>
              <input
                type="date"
                value={form.report_date}
                onChange={(e) => setForm((prev) => ({ ...prev, report_date: e.target.value }))}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                  errors.report_date ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                } focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all`}
              />
              {errors.report_date && <p className="text-xs text-rose-500 mt-1">{errors.report_date}</p>}
            </div>
          </div>

          {/* Measured Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Result Value
              </label>
              <input
                type="number"
                step="any"
                value={form.result_value}
                onChange={(e) => setForm((prev) => ({ ...prev, result_value: e.target.value }))}
                placeholder="e.g. 5.8"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                  errors.result_value ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                } focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400`}
              />
              {errors.result_value && <p className="text-xs text-rose-500 mt-1">{errors.result_value}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit of Measurement
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g. mg/dL, mmol/L"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Reference Interval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reference Min Bound
              </label>
              <input
                type="number"
                step="any"
                value={form.ref_min}
                onChange={(e) => setForm((prev) => ({ ...prev, ref_min: e.target.value }))}
                placeholder="e.g. 3.5"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                  errors.ref_min ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                } focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400`}
              />
              {errors.ref_min && <p className="text-xs text-rose-500 mt-1">{errors.ref_min}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reference Max Bound
              </label>
              <input
                type="number"
                step="any"
                value={form.ref_max}
                onChange={(e) => setForm((prev) => ({ ...prev, ref_max: e.target.value }))}
                placeholder="e.g. 7.2"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                  errors.ref_max ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                } focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400`}
              />
              {errors.ref_max && <p className="text-xs text-rose-500 mt-1">{errors.ref_max}</p>}
            </div>
          </div>

          {/* Instant Clinical Range Evaluation Preview */}
          {hasRange && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                isAbnormal
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {isAbnormal ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  Expected Classification:{" "}
                  <strong>{isAbnormal ? "ABNORMAL (Out of range)" : "NORMAL (Within bounds)"}</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] opacity-80">
                Range: [{minVal} – {maxVal}]
              </span>
            </div>
          )}

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attach Scanned Document (Optional PDF / Image)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
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
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Upload className="w-6 h-6 text-slate-400 mb-0.5" />
                  <p className="text-xs font-medium text-slate-700">Click or drag & drop to upload</p>
                  <p className="text-[11px] text-slate-400">Supports PDF, PNG, JPG up to 10MB</p>
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
              {submitting ? "Evaluating & Saving..." : "Save Lab Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
