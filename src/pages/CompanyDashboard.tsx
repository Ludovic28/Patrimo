import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import sql from "../Lib/neon/client";
import Navbar from "../Utils/navBar";
import { ButtonZone } from "../Utils/ZoneTypes";
import PropertyDashboard from "./sci/PropertyDashboard";

type Company = {
  id: string;
  name: string;
  siret: string | null;
  created_at: string;
  company_type_name: string | null;
  parent_company_id: string | null;
};

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
      if (!id) return;

      try {
        // Fetch current company with its type
        const companyData = await sql`
          select
            c.id,
            c.name,
            c.siret,
            c.created_at,
            c.parent_company_id,
            ct.name as company_type_name
          from companies c
          left join company_types ct on ct.id = c.type_id
          where c.id = ${id}
          limit 1
        `;

        if (companyData.length === 0) return;

        const current = companyData[0] as Company;
        setCompany(current);
        setHasCompanyParent(
          current.parent_company_id !== null
        );

        // Fetch child companies (subsidiaries)
        const childrenData = await sql`
          select
            c.id,
            c.name,
            c.siret,
            c.created_at,
            c.parent_company_id,
            ct.name as company_type_name
          from companies c
          left join company_types ct on ct.id = c.type_id
          where c.parent_company_id = ${id}
          order by c.created_at asc
        `;

        setCompanies(childrenData as Company[]);
      } catch (err) {
        console.error(
          "Error fetching company:",
          err
        );
      } finally {
        setLoading(false);
      }
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

  const companyTypeName =
    company.company_type_name?.toLowerCase() ??
    "";

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
            {company.company_type_name}
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
                  {company.company_type_name}
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
