import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ButtonZone,
  InputZone,
} from "../Utils/ZoneTypes";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signIn, isLoaded, setActive } =
    useSignIn();

  const handleLogin = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });
        console.log(
          "User authenticated, session set active"
        );
        navigate("/manage-projects");
      }
    } catch (err) {
      console.log("erreur complète:", err);
      if (err instanceof Error) {
        console.log(
          "erreur message:",
          err.message
        );
      }
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">
          Connexion
        </h1>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <InputZone
          type="email"
          placeholder="Email"
          email={email}
          setEmail={setEmail}
          handleLogin={handleLogin}
        />

        <InputZone
          type="password"
          placeholder="Mot de passe"
          email={password}
          setEmail={setPassword}
          handleLogin={handleLogin}
        />

        <ButtonZone
          variant="primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading
            ? "Connexion..."
            : "Se connecter"}
        </ButtonZone>
      </div>
    </div>
  );
}
