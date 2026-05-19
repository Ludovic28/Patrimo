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
  parent_company_id: string | null;
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
  const [companies, setCompanies] = useState<
    Company[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [hasCompanyParent, setHasCompanyParent] =
    useState(false);

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, siret, created_at, company_types(name), parent_company_id"
        )
        .order("created_at", {
          ascending: true,
        });

      if (error)
        console.error(
          "Error fetching company:",
          error
        );
      if (data) {
        const companyData = data.find(
          (c) => c.id === id
        );
        if (companyData)
          setCompany(companyData as Company);
        const companyChlildren = data.filter(
          (c) => c.parent_company_id === id
        ) as Company[];
        setCompanies(companyChlildren);
        setHasCompanyParent(
          companyData?.parent_company_id !== null
        );
      }
      setLoading(false);
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm sm:text-base md:text-lg lg:text-xl">
        Chargement...
      </p>
    );
  }

  if (!company) {
    return (
      <p className="text-sm sm:text-base md:text-lg lg:text-xl">
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
            navigate(
              hasCompanyParent
                ? `/company/${company.parent_company_id}`
                : `/manage-projects`
            )
          }
          disabled={false}
        >
          ← Retour
        </ButtonZone>

        <div>
          <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
            {company.name}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl">
            {getTypeName(company.company_types)}
            {company.siret &&
              ` • ${company.siret}`}
          </p>
        </div>
      </div>

      {/* Projects section */}
      <h2 className="text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">
        Projets
      </h2>

      {/* Loading state */}
      {loading && (
        <p className="text-sm sm:text-base md:text-lg lg:text-xl">
          Chargement...
        </p>
      )}

      {/* Responsive grid — 2 cols mobile, 3 tablet, 4 md, 6 desktop */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Add new company button — always first */}
        <ButtonZone
          variant="add"
          onClick={() =>
            navigate(
              `/company/${id}/create-project`
            )
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
        <p className="text-sm sm:text-base md:text-lg lg:text-xl">
          Aucune société pour le moment.
        </p>
      )}
    </div>
  );
}
