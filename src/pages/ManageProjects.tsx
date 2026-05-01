import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import { ButtonZone } from "../Utils/ZoneTypes";

// Handles both object and array return from Supabase join
type CompanyType =
  | { name: string }
  | { name: string }[]
  | null;

type Company = {
  id: string;
  name: string;
  siret: string | null;
  created_at: string;
  company_types: CompanyType;
};

// Helper to extract the type name regardless of Supabase return format
function getTypeName(
  companyTypes: CompanyType
): string {
  if (!companyTypes) return "";
  if (Array.isArray(companyTypes))
    return companyTypes[0]?.name ?? "";
  return companyTypes.name;
}

// Page for managing companies
// Displays all companies belonging to the current user as a responsive grid
export default function ManageProjects() {
  const navigate = useNavigate();

  // List of companies fetched from Supabase
  const [companies, setCompanies] = useState<
    Company[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch all companies for the current user on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, siret, created_at, company_types(name)"
        )
        .order("created_at", {
          ascending: true,
        });

      if (error)
        console.error(
          "Error fetching companies:",
          error
        );
      if (data) setCompanies(data as Company[]);
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Gestion des sociétés
      </h1>

      {/* Loading state */}
      {loading && (
        <p className="mt-6 text-sm text-gray-400">
          Chargement...
        </p>
      )}

      {/* Responsive grid — 2 cols mobile, 3 tablet, 4 md, 6 desktop */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {/* Add new company button — always first */}
        <ButtonZone
          variant="add"
          onClick={() =>
            navigate("/create-project")
          }
          disabled={false}
          className="aspect-square w-full"
        >
          +
        </ButtonZone>

        {/* Existing companies — oldest left, newest right */}
        {companies.map((company) => (
          <ButtonZone
            key={company.id}
            variant="company"
            onClick={() =>
              navigate(`/company/${company.id}`)
            }
            disabled={false}
            className="aspect-square w-full"
          >
            <span className="text-sm font-medium">
              {company.name}
            </span>
            <span className="text-xs opacity-60">
              {getTypeName(company.company_types)}
            </span>
          </ButtonZone>
        ))}
      </div>

      {/* Empty state */}
      {!loading && companies.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">
          Aucune société pour le moment.
        </p>
      )}
    </div>
  );
}
