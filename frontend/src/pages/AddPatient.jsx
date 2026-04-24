import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient } from "../services/api";
import { GENDERS } from "../constants/config";

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function AddPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", contact: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name    = "Name is required";
    if (!form.age || form.age < 0)   e.age     = "Valid age is required";
    if (!form.contact.trim())        e.contact = "Contact is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);
    try {
      const { data } = await createPatient({ ...form, age: parseInt(form.age) });
      navigate(`/patients/${data.id}`);
    } catch {
      setErrors({ form: "Failed to create patient. Please try again." });
    } finally { setSubmitting(false); }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Patient</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {errors.form && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{errors.form}</p>}

        <Field label="Full Name" error={errors.name}>
          <input className={inp} value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Age" error={errors.age}>
            <input type="number" min="0" max="150" className={inp} value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="35" />
          </Field>
          <Field label="Gender">
            <select className={inp} value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Contact Number" error={errors.contact}>
          <input className={inp} value={form.contact}
            onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="9876543210" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg transition-colors">
            {submitting ? "Saving…" : "Create Patient"}
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