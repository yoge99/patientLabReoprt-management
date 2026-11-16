export default function StatusBadge({ status, size = "sm" }) {
  const configs = {
    Normal: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    Abnormal: {
      bg: "bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse-subtle",
      dot: "bg-rose-500",
    },
    Pending: {
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      dot: "bg-amber-500",
    },
  };

  const style = configs[status] || {
    bg: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  const pad = size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${pad}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status || "Unknown"}
    </span>
  );
}
