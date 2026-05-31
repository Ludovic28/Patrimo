import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../../Lib/supabase/supabase";
import { ButtonZone } from "../../Utils/ZoneTypes";

type Props = {
  companyId: string;
};
type Property = {
  id: string;
  name: string;
  address: string;
};

export default function PropertyDashboard({
  companyId,
}: Props) {
  const [properties, setProperties] = useState<
    Property[]
  >([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
        id,
        name,
        project_details(key, value)
      `
        )
        .eq("company_id", companyId);

      if (error) {
        console.error("Erreur:", error);
        return;
      }

      if (data) {
        const mapped = data.map((project) => ({
          id: project.id,
          name: project.name,
          address:
            project.project_details?.find(
              (d: any) => d.key === "address"
            )?.value ?? "",
        }));
        setProperties(mapped);
      }
    };
    fetchProperties();
  }, [id]);

  return (
    <div className="p-8">
      <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
        Mes biens
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Bouton ajouter */}
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
        {/* Cartes des biens */}
        {properties.map((property) => (
          <ButtonZone
            key={property.id}
            variant="company"
            onClick={() =>
              navigate(`/property/${property.id}`)
            }
            disabled={false}
            className="aspect-square w-full"
          >
            <span className="text-sm font-medium">
              {property.name}
            </span>
            <span className="text-xs opacity-60">
              {property.address}
            </span>
          </ButtonZone>
        ))}
      </div>

      {properties.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">
          Aucun bien pour le moment.
        </p>
      )}
    </div>
  );
}
