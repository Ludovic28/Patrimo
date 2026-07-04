import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sql from "../Lib/neon/client";
import {
  ButtonZone,
  InputZone,
} from "../Utils/ZoneTypes";

// Page for creating a new company
// Fetches company types from Neon and saves the new company to the database
export default function CreateCompany() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // Form fields
  const [name, setName] = useState("");
  const [siret, setSiret] = useState("");
  const [typeId, setTypeId] = useState("");

  // Company types fetched from the database
  const [companyTypes, setCompanyTypes] =
    useState<{ id: string; name: string }[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  // Fetch all available company types on component mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await sql`
          select id, name from company_types
          order by name asc
        `;
        setCompanyTypes(
          data as { id: string; name: string }[]
        );
      } catch (err) {
        console.error(
          "Error fetching company types:",
          err
        );
      }
    };
    fetchTypes();
  }, []);

  // Handle form submission — validates, inserts into Neon, then redirects
  const handleCreate = async () => {
    if (!name || !typeId) {
      setError(
        "Le nom et le type sont obligatoires."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Insert the new company linked to the current Clerk user
      await sql`
        insert into companies (name, siret, type_id, user_id)
        values (${name}, ${siret || null}, ${typeId}, ${userId})
      `;
      navigate("/manage-projects");
    } catch (err) {
      setError(
        "Une erreur est survenue lors de la création."
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-bold">
        Nouvelle société
      </h1>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Company name input */}
      <InputZone
        type="text"
        placeholder="Nom de la société"
        email={name}
        setEmail={setName}
        handleLogin={handleCreate}
      />

      {/* SIRET input (optional) */}
      <InputZone
        type="text"
        placeholder="SIRET (optionnel)"
        email={siret}
        setEmail={setSiret}
        handleLogin={handleCreate}
      />

      {/* Company type dropdown */}
      <select
        value={typeId}
        onChange={(e) =>
          setTypeId(e.target.value)
        }
        className="w-full rounded border p-3"
      >
        <option value="">
          -- Sélectionnez un type de société --
        </option>
        {companyTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Submit button */}
      <ButtonZone
        onClick={handleCreate}
        disabled={loading}
      >
        {loading
          ? "Création..."
          : "Créer la société"}
      </ButtonZone>
    </div>
  );
}
