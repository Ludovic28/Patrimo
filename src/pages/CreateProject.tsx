import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import sql from "../Lib/neon/client";
import {
  ButtonZone,
  InputZone,
} from "../Utils/ZoneTypes";
import SCIForm from "./sci/SCIForm";

type ProjectType = {
  id: string;
  name: string;
  description: string | null;
  can_have_revenues: boolean;
};

type Company = {
  id: string;
  name: string;
  company_type_id: string;
  company_type_name: string;
};

export default function CreateProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [company, setCompany] =
    useState<Company | null>(null);
  const [isHolding, setIsHolding] =
    useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [projectTypeId, setProjectTypeId] =
    useState("");

  // Standard project types
  const [projectTypes, setProjectTypes] =
    useState<ProjectType[]>([]);

  // Holding — company types for creating a subsidiary
  const [subsidiaryTypes, setSubsidiaryTypes] =
    useState<{ id: string; name: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch company with its type
        const companyData = await sql`
          select 
            c.id,
            c.name,
            ct.id as company_type_id,
            ct.name as company_type_name
          from companies c
          left join company_types ct on ct.id = c.type_id
          where c.id = ${id}
          limit 1
        `;

        if (companyData.length === 0) return;

        const company = companyData[0] as Company;
        setCompany(company);

        const typeName =
          company.company_type_name?.toLowerCase() ??
          "";

        if (typeName === "holding") {
          setIsHolding(true);

          // Fetch all company types except Holding
          const typesData = await sql`
            select id, name
            from company_types
            where name != 'Holding'
            order by name asc
          `;

          setSubsidiaryTypes(
            typesData as {
              id: string;
              name: string;
            }[]
          );
        } else {
          // Fetch allowed project types for this company type
          const typesData = await sql`
            select 
              pt.id,
              pt.name,
              pt.description,
              pt.can_have_revenues
            from project_types pt
            inner join company_type_project_types ctpt on ctpt.project_type_id = pt.id
            where ctpt.company_type_id = ${company.company_type_id}
            order by pt.name asc
          `;

          setProjectTypes(
            typesData as ProjectType[]
          );
        }
      } catch (err) {
        console.error(
          "Error fetching data:",
          err
        );
      }
    };
    fetchData();
  }, [id]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    // Holding — create a new company linked to this holding
    if (isHolding) {
      if (!name || !projectTypeId) {
        setError(
          "Le nom et le type sont obligatoires."
        );
        setLoading(false);
        return;
      }

      try {
        await sql`
          insert into companies (name, type_id, user_id, parent_company_id)
          values (${name}, ${projectTypeId}, ${userId}, ${id})
        `;
        navigate(`/company/${id}`);
      } catch (err) {
        setError("Erreur lors de la création.");
        setLoading(false);
      }
      return;
    }

    // Standard flow — create a new project
    if (!name || !projectTypeId) {
      setError(
        "Le nom et le type sont obligatoires."
      );
      setLoading(false);
      return;
    }

    try {
      await sql`
        insert into projects (name, description, project_type_id, company_id, status)
        values (${name}, ${description}, ${projectTypeId}, ${id}, 'active')
      `;
      navigate(`/company/${id}`);
    } catch (err) {
      setError(
        "Erreur lors de la création du projet."
      );
      setLoading(false);
    }
  };

  const companyTypeName =
    company?.company_type_name?.toLowerCase() ??
    "";

  const renderForm = () => {
    switch (companyTypeName) {
      case "sci":
        return <SCIForm companyId={id!} />;
      case "holding":
        return (
          <>
            <InputZone
              type="text"
              placeholder="Nom de la société filiale"
              email={name}
              setEmail={setName}
              handleLogin={handleCreate}
            />
            <select
              value={projectTypeId}
              onChange={(e) =>
                setProjectTypeId(e.target.value)
              }
              className="w-full rounded border p-3"
            >
              <option value="">
                -- Type de société --
              </option>
              {subsidiaryTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </>
        );
      default:
        return (
          <>
            <InputZone
              type="text"
              placeholder="Nom du projet"
              email={name}
              setEmail={setName}
              handleLogin={handleCreate}
            />
            <InputZone
              type="text"
              placeholder="Description (optionnel)"
              email={description}
              setEmail={setDescription}
              handleLogin={handleCreate}
            />
            <select
              value={projectTypeId}
              onChange={(e) =>
                setProjectTypeId(e.target.value)
              }
              className="w-full rounded border p-3"
            >
              <option value="">
                -- Type de projet --
              </option>
              {projectTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.description
                    ? ` — ${t.description}`
                    : ""}
                </option>
              ))}
            </select>
          </>
        );
    }
  };

  return (
    <div className="p-8">
      {/* Back button — top left */}
      <ButtonZone
        variant="ghost"
        onClick={() => navigate(`/company/${id}`)}
        disabled={false}
      >
        ← Retour
      </ButtonZone>

      <div className="mx-auto mt-4 max-w-md space-y-4">
        <h1 className="text-2xl font-bold">
          {companyTypeName === "sci"
            ? "Ajouter un bien immobilier"
            : companyTypeName === "holding"
              ? "Créer une filiale"
              : "Ajouter un projet"}
        </h1>
        {company && (
          <p className="text-sm text-gray-400">
            dans {company.name}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {renderForm()}

        {/* Hide submit button for SCI since SCIForm handles it */}
        {companyTypeName !== "sci" && (
          <ButtonZone
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "En cours..." : "Créer"}
          </ButtonZone>
        )}
      </div>
    </div>
  );
}
