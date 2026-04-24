export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const REPORT_TYPES = ["Blood Test", "Urine Test", "Lipid Panel", "Custom"];
export const GENDERS = ["Male", "Female", "Other"];
export const STATUSES = ["Normal", "Abnormal", "Pending"];

export const STATUS_COLORS = {
  Normal:   "bg-green-100 text-green-800",
  Abnormal: "bg-red-100 text-red-800",
  Pending:  "bg-gray-100 text-gray-600",
};