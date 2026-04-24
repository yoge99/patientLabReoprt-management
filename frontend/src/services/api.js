import axios from "axios";
import { API_BASE_URL } from "../constants/config";

const api = axios.create({ baseURL: API_BASE_URL });

// Patients
export const getPatients   = (search = "") => api.get(`/patients/?search=${search}`);
export const getPatient    = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post("/patients/", data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// Reports
export const getReports = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  return api.get(`/reports/?${params.toString()}`);
};
export const createReport = (formData) =>
  api.post("/reports/", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateReport = (id, data) => api.patch(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Dashboard
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getRecentReports    = (status = "") =>
  api.get(`/dashboard/recent-reports${status ? `?status=${status}` : ""}`);