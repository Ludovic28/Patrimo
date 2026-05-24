import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Accueil", path: "/" },
    { label: "Schéma", path: "/" },
  ];

  return (
    <nav className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      {/* Liens */}
      <ul className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <li key={link.path}>
            <button
              onClick={() => navigate(link.path)}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "border-b-2 border-teal-500 text-teal-500"
                  : "text-gray-500 hover:text-teal-500"
              }`}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
      {/* Profil / Déconnexion */}²
      <button
        onClick={() => navigate("/profil")}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-teal-500"
      >
        Profil
      </button>
    </nav>
  );
}
