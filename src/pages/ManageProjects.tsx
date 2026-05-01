import { useNavigate } from "react-router-dom";
import { ButtonZone } from "../Utils/ZoneTypes";

export default function ManageProjects() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Gestion des projets</h1>
      <ButtonZone onClick={() => navigate("/create-project")} disabled={false}>
        +
      </ButtonZone>
    </div>
  );
}
