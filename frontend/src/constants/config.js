export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const REPORT_TYPES = ["Blood Test", "Lipid Panel", "Urine Test", "Custom"];
export const GENDERS = ["Male", "Female", "Other"];
export const STATUSES = ["Normal", "Abnormal", "Pending"];

export const STATUS_COLORS = {
  Normal:   "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  Abnormal: "bg-rose-50 text-rose-700 border-rose-200/80",
  Pending:  "bg-amber-50 text-amber-700 border-amber-200/80",
};

export const STANDARD_PANELS = {
  "Lipid Panel": [
    { name: "Total Cholesterol", unit: "mg/dL", ref_min: 125, ref_max: 200, result_value: "" },
    { name: "HDL Cholesterol", unit: "mg/dL", ref_min: 40, ref_max: 60, result_value: "" },
    { name: "LDL Cholesterol", unit: "mg/dL", ref_min: 0, ref_max: 100, result_value: "" },
    { name: "Triglycerides", unit: "mg/dL", ref_min: 50, ref_max: 150, result_value: "" },
  ],
  "Blood Test": [
    { name: "Fasting Blood Glucose", unit: "mg/dL", ref_min: 70, ref_max: 99, result_value: "" },
    { name: "Hemoglobin (Hb)", unit: "g/dL", ref_min: 12.0, ref_max: 17.5, result_value: "" },
    { name: "White Blood Cells (WBC)", unit: "10^3/µL", ref_min: 4.5, ref_max: 11.0, result_value: "" },
    { name: "Platelet Count", unit: "10^3/µL", ref_min: 150, ref_max: 450, result_value: "" },
    { name: "Serum Creatinine", unit: "mg/dL", ref_min: 0.7, ref_max: 1.3, result_value: "" },
  ],
  "Urine Test": [
    { name: "Urine Routine (pH)", unit: "pH", ref_min: 4.5, ref_max: 8.0, result_value: "" },
    { name: "Urine Specific Gravity", unit: "SG", ref_min: 1.005, ref_max: 1.030, result_value: "" },
    { name: "Urine Protein", unit: "mg/dL", ref_min: 0, ref_max: 14, result_value: "" },
    { name: "Urine Pregnancy (hCG)", unit: "", ref_min: null, ref_max: null, result_value: "Negative" },
  ],
  "Custom": [
    { name: "Diagnostic Parameter", unit: "mg/dL", ref_min: 0, ref_max: 100, result_value: "" },
  ],
};
