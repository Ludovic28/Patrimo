import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import {
  ButtonZone,
  InputZone,
} from "../Utils/ZoneTypes";

type ProjectType = {
  id: string;
  name: string;
  description: string | null;
  can_have_revenues: boolean;
};

type Company = {
  id: string;
  name: string;
  company_types:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

function getTypeName(
  companyTypes: Company["company_types"]
): string {
  if (!companyTypes) return "";
  if (Array.isArray(companyTypes))
    return companyTypes[0]?.name ?? "";
  return companyTypes.name;
}

function getPageLabel(companyTypeName: string): {
  title: string;
  placeholder: string;
} {
  switch (companyTypeName.toLowerCase()) {
    case "holding":
      return {
        title: "Associer une filiale",
        placeholder: "Rechercher une société...",
      };
    case "sci":
      return {
        title: "Ajouter un bien immobilier",
        placeholder:
          "Nom du bien (ex: Appart Paris 11e)",
      };
    case "sas":
    case "sarl":
    case "sa":
      return {
        title: "Ajouter une opération",
        placeholder: "Nom de l'opération",
      };
    case "auto-entrepreneur":
      return {
        title: "Ajouter un contrat",
        placeholder: "Nom du contrat ou client",
      };
    default:
      return {
        title: "Ajouter un projet",
        placeholder: "Nom du projet",
      };
  }
}

export default function CreateProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] =
    useState<Company | null>(null);
  const [isHolding, setIsHolding] =
    useState(false);

  // Standard project form fields
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [projectTypeId, setProjectTypeId] =
    useState("");
  const [projectTypes, setProjectTypes] =
    useState<ProjectType[]>([]);

  // Holding — list of existing companies to link as subsidiaries
  const [allCompanies, setAllCompanies] =
    useState<{ id: string; name: string }[]>([]);
  const [
    selectedSubsidiaryId,
    setSelectedSubsidiaryId,
  ] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const [subsidiaryTypes, setSubsidiaryTypes] =
    useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: companyData } = await supabase
        .from("companies")
        .select(
          "id, name, company_types(id, name)"
        )
        .eq("id", id)
        .single();

      if (companyData) {
        setCompany(companyData as Company);

        const companyTypes =
          companyData.company_types;
        const typeName = Array.isArray(
          companyTypes
        )
          ? (companyTypes[0]?.name ?? "")
          : ((
              companyTypes as {
                id: string;
                name: string;
              } | null
            )?.name ?? "");

        // If holding — fetch all other companies to link as subsidiaries
        if (
          typeName.toLowerCase() === "holding"
        ) {
          setIsHolding(true);

          // Fetch all company types to create a new subsidiary
          const { data: companyTypesData } =
            await supabase
              .from("company_types")
              .select("id, name")
              .neq("name", "Holding"); // Une holding ne peut pas contenir une autre holding

          if (companyTypesData)
            setSubsidiaryTypes(companyTypesData);
        } else {
          // Standard flow — fetch allowed project types
          const companyTypeId = Array.isArray(
            companyTypes
          )
            ? companyTypes[0]?.id
            : (
                companyTypes as {
                  id: string;
                  name: string;
                } | null
              )?.id;

          if (companyTypeId) {
            const { data: typesData } =
              await supabase
                .from(
                  "company_type_project_types"
                )
                .select(
                  "project_types(id, name, description, can_have_revenues)"
                )
                .eq(
                  "company_type_id",
                  companyTypeId
                );

            if (typesData) {
              const types = typesData
                .map(
                  (row: any) => row.project_types
                )
                .filter(Boolean)
                .flat();
              setProjectTypes(types);
            }
          }
        }
      }
    };
    fetchData();
  }, [id]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    // Holding — link a subsidiary by updating its parent_company_id
    if (isHolding) {
      if (!name || !projectTypeId) {
        setError(
          "Le nom et le type sont obligatoires."
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("companies")
        .insert({
          name,
          type_id: projectTypeId,
          user_id: user?.id,
          parent_company_id: id, // Lié à la holding
        });

      if (error) {
        setError("Erreur lors de la création.");
        setLoading(false);
      } else {
        navigate(`/company/${id}`);
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

    const { error } = await supabase
      .from("projects")
      .insert({
        name,
        description,
        project_type_id: projectTypeId,
        company_id: id,
        status: "active",
      });

    if (error) {
      setError(
        "Erreur lors de la création du projet."
      );
      setLoading(false);
    } else {
      navigate(`/company/${id}`);
    }
  };

  const companyTypeName = getTypeName(
    company?.company_types ?? null
  );
  const { title, placeholder } = getPageLabel(
    companyTypeName
  );

  return (
    <div className="p-8">
      {/* Back button — top left, outside the centered container */}
      <ButtonZone
        variant="ghost"
        onClick={() => navigate(`/company/${id}`)}
        disabled={false}
      >
        ← Retour
      </ButtonZone>
      <div className="mx-auto max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">
          {title}
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

        {/* Holding — dropdown of existing companies */}
        {isHolding ? (
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
        ) : (
          // Standard form
          <>
            <InputZone
              type="text"
              placeholder={placeholder}
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
        )}

        <ButtonZone
          onClick={handleCreate}
          disabled={loading}
        >
          {loading
            ? "En cours..."
            : isHolding
              ? "Associer"
              : "Créer"}
        </ButtonZone>
      </div>
    </div>
  );
}
