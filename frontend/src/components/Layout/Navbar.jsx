import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/",         label: "Dashboard" },
  { to: "/patients", label: "Patients" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-8">
      <span className="font-semibold text-blue-700 text-lg">PSS Lab Reports</span>
      <div className="flex gap-4">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors
              ${pathname === l.to
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900"}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}