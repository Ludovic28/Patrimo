import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";

export default function Profil() {
  const navigate = useNavigate();
  const [editEmail, setEditEmail] =
    useState(false);
  const [editPassword, setEditPassword] =
    useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Exemple avec supabase
    const getUser = async () => {
      const { data } =
        await supabase.auth.getUser();
      setEmail(data.user?.email || "");
    };
    getUser();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
        Profil
      </h1>

      {/* Email */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">
          Email
        </label>
        {editEmail ? (
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) =>
                setNewEmail(e.target.value)
              }
              placeholder="Nouvel email"
              className="w-full rounded-lg border border-teal-400 px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={async () => {
                const { error } =
                  await supabase.auth.updateUser({
                    email: newEmail,
                  });

                if (error) {
                  setMessage(
                    "Erreur : " + error.message
                  );
                } else {
                  setMessage(
                    "Un mail de confirmation a été envoyé à " +
                      email
                  );
                  setNewEmail("");
                  setEditEmail(false);
                }
              }}
              className="text-sm font-medium text-teal-500"
            >
              Sauvegarder
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">
              {email}
            </span>
            <button
              onClick={() => setEditEmail(true)}
              className="text-sm font-medium text-teal-500 hover:text-teal-600"
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Mot de passe */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">
          Mot de passe
        </label>
        {editPassword ? (
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Nouveau mot de passe"
              className="w-full rounded-lg border border-teal-400 px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={async () => {
                // Exemple avec Supabase
                const { error } =
                  await supabase.auth.updateUser({
                    password: password,
                  });

                if (error) {
                  console.error(
                    "Erreur :",
                    error.message
                  );
                } else {
                  setEditPassword(false);
                }
              }}
              className="text-sm font-medium text-teal-500"
            >
              Sauvegarder
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">
              ••••••••
            </span>
            <button
              onClick={() =>
                setEditPassword(true)
              }
              className="text-sm font-medium text-teal-500 hover:text-teal-600"
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Boutons */}
      <button
        onClick={() =>
          navigate("/manage-projects")
        }
        className="text-sm font-medium text-gray-500 transition-colors hover:text-teal-500"
      >
        ← Retour
      </button>

      <button
        onClick={() => navigate("/login")}
        className="text-sm font-medium text-red-400 transition-colors hover:text-red-500"
      >
        Se déconnecter
      </button>
      {message && (
        <p className="text-sm text-teal-500">
          {message}
        </p>
      )}
    </div>
  );
}
