import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatient, getReports, deleteReport } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { STATUSES, REPORT_TYPES } from "../constants/config";

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ status: "", report_type: "", date_from: "", date_to: "" });

  const loadReports = () => getReports({ patient_id: id, ...filters }).then(r => setReports(r.data));

  useEffect(() => { getPatient(id).then(r => setPatient(r.data)); }, [id]);
  useEffect(() => { loadReports(); }, [id, filters]);

  const handleDelete = async (rid) => {
    if (!confirm("Delete this report?")) return;
    await deleteReport(rid);
    loadReports();
  };

  if (!patient) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{patient.name}</h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{patient.id}</p>
          </div>
          <Link to={`/patients/${id}/report`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
            + Add Report
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-400">Age</span><p className="font-medium text-gray-700 mt-0.5">{patient.age}</p></div>
          <div><span className="text-gray-400">Gender</span><p className="font-medium text-gray-700 mt-0.5">{patient.gender}</p></div>
          <div><span className="text-gray-400">Contact</span><p className="font-medium text-gray-700 mt-0.5">{patient.contact}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700">Lab Reports</h2>
          <div className="flex gap-2">
            {[["status", STATUSES], ["report_type", REPORT_TYPES]].map(([key, opts]) => (
              <select key={key} value={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                <option value="">{key === "status" ? "All statuses" : "All types"}</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <input type="date" value={filters.date_from}
              onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
            <input type="date" value={filters.date_to}
              onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No reports yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                {["Type","Date","Result","Unit","Range","Status",""].map(h => (
                  <th key={h} className="pb-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-700">{r.report_type}</td>
                  <td className="py-2.5 text-gray-500">{r.report_date}</td>
                  <td className="py-2.5 font-medium text-gray-800">{r.result_value}</td>
                  <td className="py-2.5 text-gray-500">{r.unit}</td>
                  <td className="py-2.5 text-gray-500">{r.ref_min}–{r.ref_max}</td>
                  <td className="py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="py-2.5">
                    <button onClick={() => handleDelete(r.id)}
                      className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}