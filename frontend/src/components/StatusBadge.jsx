import { STATUS_COLORS } from "../constants/config";

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}