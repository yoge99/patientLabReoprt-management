import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientDetail from "./pages/PatientDetail";
import AddPatient from "./pages/AddPatient";
import AddReport from "./pages/AddReport";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/"                      element={<Dashboard />} />
              <Route path="/patients"              element={<PatientList />} />
              <Route path="/patients/add"          element={<AddPatient />} />
              <Route path="/patients/:id"          element={<PatientDetail />} />
              <Route path="/patients/:id/report"   element={<AddReport />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}