import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import { ButtonZone, InputZone } from "../Utils/ZoneTypes";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      navigate("/manage-projects");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Connexion</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
        <ButtonZone variant="primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </ButtonZone>
      </div>
    </div>
  );
}
