import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReport } from "../services/api";
import { REPORT_TYPES } from "../constants/config";

export default function AddReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    report_type: "Blood Test", report_date: "", result_value: "",
    unit: "mg/dL", ref_min: "", ref_max: ""
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.report_date)     e.report_date   = "Date is required";
    if (!form.result_value)    e.result_value  = "Result value is required";
    if (!form.ref_min)         e.ref_min       = "Min range is required";
    if (!form.ref_max)         e.ref_max       = "Max range is required";
    if (parseFloat(form.ref_min) >= parseFloat(form.ref_max))
                               e.ref_max       = "Max must be greater than min";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);

    const fd = new FormData();
    fd.append("patient_id",   id);
    fd.append("report_type",  form.report_type);
    fd.append("report_date",  form.report_date);
    fd.append("result_value", parseFloat(form.result_value));
    fd.append("unit",         form.unit);
    fd.append("ref_min",      parseFloat(form.ref_min));
    fd.append("ref_max",      parseFloat(form.ref_max));
    if (file) fd.append("file", file);

    try {
      await createReport(fd);
      navigate(`/patients/${id}`);
    } catch {
      setErrors({ form: "Failed to submit report." });
    } finally { setSubmitting(false); }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Lab Report</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {errors.form && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{errors.form}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Report Type">
            <select className={inp} value={form.report_type}
              onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))}>
              {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Report Date" error={errors.report_date}>
            <input type="date" className={inp} value={form.report_date}
              onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Result Value" error={errors.result_value}>
            <input type="number" step="any" className={inp} value={form.result_value}
              onChange={e => setForm(f => ({ ...f, result_value: e.target.value }))} placeholder="5.4" />
          </Field>
          <Field label="Unit">
            <input className={inp} value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="mg/dL" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Reference Min" error={errors.ref_min}>
            <input type="number" step="any" className={inp} value={form.ref_min}
              onChange={e => setForm(f => ({ ...f, ref_min: e.target.value }))} placeholder="3.5" />
          </Field>
          <Field label="Reference Max" error={errors.ref_max}>
            <input type="number" step="any" className={inp} value={form.ref_max}
              onChange={e => setForm(f => ({ ...f, ref_max: e.target.value }))} placeholder="7.0" />
          </Field>
        </div>

        <Field label="Upload Report (PDF / Image)">
          <input type="file" accept=".pdf,image/*"
            onChange={e => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg transition-colors">
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}