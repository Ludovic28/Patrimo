import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sql from "../Lib/neon/client";
import { ButtonZone } from "../Utils/ZoneTypes";
import Navbar from "../Utils/navBar";

// Company type from database
type CompanyType = { name: string } | null;

type Company = {
  id: string;
  name: string;
  siret: string | null;
  created_at: string;
  company_type_name: string | null;
  parent_company_id: string | null;
};

// Page for managing companies
// Displays all companies belonging to the current user as a responsive grid
export default function ManageProjects() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // List of companies fetched from Neon
  const [companies, setCompanies] = useState<
    Company[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch all companies for the current user on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!userId) return;

      try {
        // Join with company_types to get the type name directly
        const data = await sql`
          select 
            c.id,
            c.name,
            c.siret,
            c.created_at,
            c.parent_company_id,
            ct.name as company_type_name
          from companies c
          left join company_types ct on ct.id = c.type_id
          where c.user_id = ${userId}
          order by c.created_at asc
        `;

        setCompanies(data as Company[]);
      } catch (error) {
        console.error(
          "Error fetching companies:",
          error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [userId]);

  return (
    <div className="p-8">
      <Navbar />
      <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
        Gestion des sociétés
      </h1>

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
            navigate("/create-project")
          }
          disabled={false}
          className="aspect-square w-full"
        >
          +
        </ButtonZone>

        {/* Existing companies — oldest left, newest right */}
        {companies
          .filter(
            (company) =>
              company.parent_company_id === null
          )
          .map((company) => (
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
                {company.company_type_name}
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
