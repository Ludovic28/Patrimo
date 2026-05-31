import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import Navbar from "../Utils/navBar";
import { ButtonZone } from "../Utils/ZoneTypes";
import PropertyDashboard from "./sci/PropertyDashboard";

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

export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] =
    useState<Company | null>(null);
  const [companies, setCompanies] = useState<
    Company[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [hasCompanyParent, setHasCompanyParent] =
    useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, siret, created_at, company_types(name), parent_company_id"
        )
        .order("created_at", { ascending: true });

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
        const companyChildren = data.filter(
          (c) => c.parent_company_id === id
        ) as Company[];
        setCompanies(companyChildren);
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

  const companyTypeName = getTypeName(
    company.company_types
  ).toLowerCase();

  return (
    <div className="p-8">
      <Navbar />

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

      {/* SCI — affiche les biens immobiliers */}
      {companyTypeName === "sci" ? (
        <PropertyDashboard companyId={id!} />
      ) : (
        <>
          <h2 className="text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">
            Projets
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

            {companies.map((company) => (
              <ButtonZone
                key={company.id}
                variant="company"
                onClick={() =>
                  navigate(
                    `/company/${company.id}`
                  )
                }
                disabled={false}
                className="aspect-square w-full"
              >
                <span className="text-sm font-medium">
                  {company.name}
                </span>
                <span className="text-xs opacity-60">
                  {getTypeName(
                    company.company_types
                  )}
                </span>
              </ButtonZone>
            ))}
          </div>

          {!loading && companies.length === 0 && (
            <p className="mt-4 text-sm text-gray-400">
              Aucune société pour le moment.
            </p>
          )}
        </>
      )}
    </div>
  );
}
