export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const REPORT_TYPES = ["Blood Test", "Lipid Panel", "Urine Test", "Custom"];
export const GENDERS = ["Male", "Female", "Other"];
export const STATUSES = ["Normal", "Abnormal", "Pending"];

export const STATUS_COLORS = {
  Normal:   "bg-green-100 text-green-800",
  Abnormal: "bg-red-100 text-red-800",
  Pending:  "bg-gray-100 text-gray-600",
};

export const COMMON_TEST_PRESETS = [
  // Blood Test Parameters
  {
    name: "Fasting Blood Glucose",
    report_type: "Blood Test",
    unit: "mg/dL",
    ref_min: 70,
    ref_max: 99,
    description: "Blood sugar screening"
  },
  {
    name: "Hemoglobin (Hb)",
    report_type: "Blood Test",
    unit: "g/dL",
    ref_min: 12.0,
    ref_max: 17.5,
    description: "Red blood cell / Anemia test"
  },
  {
    name: "Serum Creatinine",
    report_type: "Blood Test",
    unit: "mg/dL",
    ref_min: 0.7,
    ref_max: 1.3,
    description: "Kidney function marker"
  },
  {
    name: "White Blood Cells (WBC)",
    report_type: "Blood Test",
    unit: "10^3/µL",
    ref_min: 4.5,
    ref_max: 11.0,
    description: "Immune / Infection count"
  },
  {
    name: "Platelet Count",
    report_type: "Blood Test",
    unit: "10^3/µL",
    ref_min: 150,
    ref_max: 450,
    description: "Blood clotting evaluation"
  },

  // Lipid Panel Parameters
  {
    name: "Total Cholesterol",
    report_type: "Lipid Panel",
    unit: "mg/dL",
    ref_min: 125,
    ref_max: 200,
    description: "Overall blood cholesterol"
  },
  {
    name: "HDL Cholesterol",
    report_type: "Lipid Panel",
    unit: "mg/dL",
    ref_min: 40,
    ref_max: 60,
    description: "High-density good cholesterol"
  },
  {
    name: "LDL Cholesterol",
    report_type: "Lipid Panel",
    unit: "mg/dL",
    ref_min: 0,
    ref_max: 100,
    description: "Low-density bad cholesterol"
  },
  {
    name: "Triglycerides",
    report_type: "Lipid Panel",
    unit: "mg/dL",
    ref_min: 50,
    ref_max: 150,
    description: "Blood fat content"
  },

  // Urine Test Parameters
  {
    name: "Urine Routine (pH)",
    report_type: "Urine Test",
    unit: "pH",
    ref_min: 4.5,
    ref_max: 8.0,
    description: "Acidity / chemical balance"
  },
  {
    name: "Urine Specific Gravity",
    report_type: "Urine Test",
    unit: "SG",
    ref_min: 1.005,
    ref_max: 1.030,
    description: "Hydration & kidney concentration"
  },
  {
    name: "Urine Protein",
    report_type: "Urine Test",
    unit: "mg/dL",
    ref_min: 0,
    ref_max: 14,
    description: "Kidney barrier filtration"
  },
];
