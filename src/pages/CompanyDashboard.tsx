import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import { ButtonZone } from "../Utils/ZoneTypes";

// Company with its type name joined
type Company = {
  id: string;
  name: string;
  siret: string | null;
  created_at: string;
  company_types:
    | { name: string }
    | { name: string }[]
    | null;
};

// Helper to extract type name regardless of Supabase return format
function getTypeName(
  companyTypes: Company["company_types"]
): string {
  if (!companyTypes) return "";
  if (Array.isArray(companyTypes))
    return companyTypes[0]?.name ?? "";
  return companyTypes.name;
}

// Dashboard for a specific company
// Displays company info and allows managing its projects
export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Company data fetched from Supabase
  const [company, setCompany] =
    useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, siret, created_at, company_types(name)"
        )
        .eq("id", id)
        .single();

      if (error)
        console.error(
          "Error fetching company:",
          error
        );
      if (data) setCompany(data as Company);
      setLoading(false);
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <p className="p-8 text-sm text-gray-400">
        Chargement...
      </p>
    );
  }

  if (!company) {
    return (
      <p className="p-8 text-sm text-red-400">
        Société introuvable.
      </p>
    );
  }

  return (
    <div className="p-8">
      {/* Header with back button */}
      <div className="mb-8 flex items-center gap-4">
        <ButtonZone
          variant="ghost"
          onClick={() =>
            navigate("/manage-projects")
          }
          disabled={false}
        >
          ← Retour
        </ButtonZone>
        <div>
          <h1 className="text-2xl font-bold">
            {company.name}
          </h1>
          <p className="text-sm text-gray-400">
            {getTypeName(company.company_types)}
            {company.siret &&
              ` • ${company.siret}`}
          </p>
        </div>
      </div>

      {/* Projects section */}
      <h2 className="mb-4 text-lg font-medium">
        Projets
      </h2>

      <div className="flex flex-wrap gap-4">
        {/* Add new project button */}
        <ButtonZone
          variant="add"
          onClick={() =>
            navigate(
              `/company/${id}/create-project`
            )
          }
          disabled={false}
          className="h-32 w-32"
        >
          +
        </ButtonZone>
      </div>
    </div>
  );
}
