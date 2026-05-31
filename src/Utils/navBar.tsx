import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Accueil", path: "/" },
    { label: "Schéma", path: "/t" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      {/* Liens — cachés sur mobile */}
      <ul className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <li key={link.path}>
            {" "}
            <button
              onClick={() => {
                navigate(link.path);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </button>{" "}
          </li>
        ))}
      </ul>

      {/* Burger — visible uniquement sur mobile */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Menu mobile — s'ouvre sous la navbar */}
      {menuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-gray-200 bg-white md:hidden">
          <ul className="flex flex-col gap-4 px-6 py-4">
            {links.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => {
                    navigate(link.path);
                    setMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Profil */}
      <button onClick={() => navigate("/profil")}>
        Profil
      </button>
    </nav>
  );
}
