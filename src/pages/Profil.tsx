import {
  useClerk,
  useUser,
} from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profil() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const [editEmail, setEditEmail] =
    useState(false);
  const [editPassword, setEditPassword] =
    useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Update email via Clerk
  const handleUpdateEmail = async () => {
    if (!user) return;
    try {
      const emailAddress =
        await user.createEmailAddress({
          email: newEmail,
        });
      await emailAddress.prepareVerification({
        strategy: "email_code",
      });
      setMessage(
        "Un mail de confirmation a été envoyé à " +
          newEmail
      );
      setNewEmail("");
      setEditEmail(false);
    } catch (err: any) {
      setError(
        "Erreur : " + err.errors?.[0]?.message
      );
    }
  };

  // Update password via Clerk
  const handleUpdatePassword = async () => {
    if (!user) return;
    try {
      await user.updatePassword({
        newPassword: password,
      });
      setPassword("");
      setEditPassword(false);
      setMessage(
        "Mot de passe mis à jour avec succès."
      );
    } catch (err: any) {
      setError(
        "Erreur : " + err.errors?.[0]?.message
      );
    }
  };

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
              onClick={handleUpdateEmail}
              className="text-sm font-medium text-teal-500"
            >
              Sauvegarder
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">
              {
                user?.primaryEmailAddress
                  ?.emailAddress
              }
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
              onClick={handleUpdatePassword}
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

      {/* Messages */}
      {message && (
        <p className="text-sm text-teal-500">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

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
        onClick={async () => {
          await signOut();
          navigate("/login");
        }}
        className="text-sm font-medium text-red-400 transition-colors hover:text-red-500"
      >
        Se déconnecter
      </button>
    </div>
  );
}
