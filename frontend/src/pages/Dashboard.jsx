import { useEffect, useState } from "react";
import { getDashboardSummary, getRecentReports } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { STATUSES } from "../constants/config";

const SummaryCard = ({ label, value, color }) => (
  <div className={`rounded-xl p-5 ${color} text-white`}>
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary]   = useState(null);
  const [reports, setReports]   = useState([]);
  const [filter, setFilter]     = useState("");

  useEffect(() => {
    getDashboardSummary().then(r => setSummary(r.data));
  }, []);

  useEffect(() => {
    getRecentReports(filter).then(r => setReports(r.data));
  }, [filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Patients"  value={summary?.total_patients}  color="bg-blue-600" />
        <SummaryCard label="Total Reports"   value={summary?.total_reports}   color="bg-indigo-600" />
        <SummaryCard label="Abnormal"        value={summary?.abnormal_reports} color="bg-red-500" />
        <SummaryCard label="Today's Reports" value={summary?.reports_today}   color="bg-green-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-700">Recent Reports</h2>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No reports found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Patient</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 text-gray-800">{r.patient_name}</td>
                  <td className="py-2.5 text-gray-600">{r.report_type}</td>
                  <td className="py-2.5 text-gray-500">{r.report_date}</td>
                  <td className="py-2.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}