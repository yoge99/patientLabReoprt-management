import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function PatientList() {
  const { patients, loading, fetchPatients, searchQuery, setSearchQuery } = useApp();
  const [input, setInput] = useState(searchQuery);

  useEffect(() => { fetchPatients(searchQuery); }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(input);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Patients</h1>
        <Link to="/patients/add"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Patient
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Search by name or patient ID…"
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <button type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : patients.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No patients found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Patient ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Gender</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.age}</td>
                  <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{p.contact}</td>
                  <td className="px-4 py-3">
                    <Link to={`/patients/${p.id}`}
                      className="text-blue-600 hover:underline text-xs">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}