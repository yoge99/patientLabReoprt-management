import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import DashboardView from "./pages/DashboardView";
import PatientsView from "./pages/PatientsView";
import ReportsView from "./pages/ReportsView";
import AddPatientModal from "./components/Modals/AddPatientModal";
import AddReportModal from "./components/Modals/AddReportModal";
import DocumentPreviewModal from "./components/Modals/DocumentPreviewModal";
import { getPatients, getDashboardSummary } from "./services/api";

export default function App() {
  // Navigation State: 'dashboard' | 'patients' | 'reports'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");

  // Data & Metrics
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal States
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [reportTargetPatientId, setReportTargetPatientId] = useState(null);
  const [docPreview, setDocPreview] = useState({ isOpen: false, filePath: null, title: "" });

  // Load initial patients & summary
  const loadData = useCallback(async () => {
    try {
      const [patientsRes, summaryRes] = await Promise.all([
        getPatients(),
        getDashboardSummary(),
      ]);
      setPatients(patientsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to load initial lab data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Handle switching to a specific patient
  const handleSelectPatient = (patientIdOrName) => {
    let target = patients.find((p) => p.id === patientIdOrName);
    if (!target) {
      target = patients.find((p) => p.name === patientIdOrName);
    }
    if (target) {
      setSelectedPatientId(target.id);
    }
    setActiveTab("patients");
  };

  // Open Add Report modal with specific patient
  const handleOpenAddReportForPatient = (patientId) => {
    setReportTargetPatientId(patientId);
    setIsAddReportOpen(true);
  };

  // Open Add Report globally
  const handleOpenAddReportGlobal = () => {
    setReportTargetPatientId(null);
    setIsAddReportOpen(true);
  };

  // Open Document Preview Modal
  const handlePreviewDocument = (filePath, title) => {
    setDocPreview({ isOpen: true, filePath, title });
  };

  // Callbacks for data mutations
  const handlePatientCreated = (newPatient) => {
    setRefreshKey((k) => k + 1);
    setSelectedPatientId(newPatient.id);
    setActiveTab("patients");
  };

  const handleReportCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  const handlePatientDeleted = (deletedId) => {
    setRefreshKey((k) => k + 1);
    if (selectedPatientId === deletedId) {
      setSelectedPatientId(null);
    }
  };

  const handleReportDeleted = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-100/60 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
        onOpenAddReport={handleOpenAddReportGlobal}
        totalPatients={summary?.total_patients || patients.length}
        totalReports={summary?.total_reports || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          onOpenAddPatient={() => setIsAddPatientOpen(true)}
          onOpenAddReport={handleOpenAddReportGlobal}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              onSelectPatient={handleSelectPatient}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenAddReport={handleOpenAddReportGlobal}
              onPreviewDocument={handlePreviewDocument}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === "patients" && (
            <PatientsView
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenAddReportForPatient={handleOpenAddReportForPatient}
              onPreviewDocument={handlePreviewDocument}
              onPatientDeleted={handlePatientDeleted}
              onReportDeleted={handleReportDeleted}
              searchFilter={globalSearch}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              onSelectPatient={handleSelectPatient}
              onOpenAddReport={handleOpenAddReportGlobal}
              onPreviewDocument={handlePreviewDocument}
              refreshTrigger={refreshKey}
              onReportDeleted={handleReportDeleted}
              searchFilter={globalSearch}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSuccess={handlePatientCreated}
      />

      <AddReportModal
        isOpen={isAddReportOpen}
        onClose={() => {
          setIsAddReportOpen(false);
          setReportTargetPatientId(null);
        }}
        onSuccess={handleReportCreated}
        initialPatientId={reportTargetPatientId}
        patients={patients}
      />

      <DocumentPreviewModal
        isOpen={docPreview.isOpen}
        onClose={() => setDocPreview({ isOpen: false, filePath: null, title: "" })}
        filePath={docPreview.filePath}
        title={docPreview.title}
      />
    </div>
  );
}
