import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
    >
      Se déconnecter
    </button>
  );
}
