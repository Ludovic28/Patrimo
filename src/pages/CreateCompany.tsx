import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase/supabase";
import {
  ButtonZone,
  InputZone,
} from "../Utils/ZoneTypes";

// Page for creating a new company
// Fetches company types from Supabase and saves the new company to the database
export default function CreateCompany() {
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState("");
  const [siret, setSiret] = useState("");
  const [typeId, setTypeId] = useState("");

  // Company types fetched from the database (used to populate the dropdown)
  const [companyTypes, setCompanyTypes] =
    useState<{ id: string; name: string }[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  // Fetch all available company types from Supabase on component mount
  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase
        .from("company_types")
        .select("id, name");
      if (data) setCompanyTypes(data);
    };
    fetchTypes();
  }, []);

  // Handle form submission — validates, inserts into Supabase, then redirects
  const handleCreate = async () => {
    // Basic validation: name and type are required
    if (!name || !typeId) {
      setError(
        "Company name and type are required."
      );
      return;
    }

    setLoading(true);
    setError(null);

    // Get the currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert the new company into the database
    const { error } = await supabase
      .from("companies")
      .insert({
        name,
        siret,
        type_id: typeId,
        user_id: user?.id,
      });

    if (error) {
      // Show error message and stop loading if the insert fails
      setError(
        "An error occurred while creating the company."
      );
      setLoading(false);
    } else {
      // Redirect to the dashboard on success
      navigate("/manage-projects");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-bold">
        Nouvelle société
      </h1>

      {/* Display error message if any */}
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

      {/* SIRET number input (optional) */}
      <InputZone
        type="text"
        placeholder="SIRET (optional)"
        email={siret}
        setEmail={setSiret}
        handleLogin={handleCreate}
      />

      {/* Company type dropdown — populated from company_types table */}
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

      {/* Submit button — disabled while loading */}
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
