import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Lib/supabase/supabase";

type Props = {
  companyId: string;
};

export default function SCIForm({
  companyId,
}: Props) {
  const [currentStep, setCurrentStep] =
    useState(1);
  const navigate = useNavigate();
  {
    /* Step 1 */
  }
  const [name, setName] = useState("");
  const [adress, setAdress] = useState("");
  const [purchase_price, setPurchase_price] =
    useState("");
  const [purchase_date, setPurchase_date] =
    useState("");
  const [
    renovation_amount,
    setrenovation_amount,
  ] = useState("");
  {
    /* Step 2 */
  }
  const [rent_amount, setRent_amount] =
    useState("");
  const [charges_amount, setCharges_amount] =
    useState("");
  const [lease_start_date, setLease_start_date] =
    useState("");
  const [lease_end_date, setLease_end_date] =
    useState("");
  {
    /* Step 3 */
  }
  const [lender_type, setLender_type] =
    useState("");
  const [bank_amount, setBank_amount] =
    useState("");
  const [duration_months, setDuration_months] =
    useState("");
  const [monthly_payment, setMonthly_payment] =
    useState("");
  const [loan_start_date, setLoan_start_date] =
    useState("");
  const [loan_end_date, setLoan_end_date] =
    useState("");
  const [projectTypeId, setProjectTypeId] =
    useState("");

  const nextStep = () =>
    setCurrentStep((prev) => prev + 1);
  const prevStep = () =>
    setCurrentStep((prev) => prev - 1);

  const [error, setError] = useState<
    string | null
  >(null);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          name !== "" &&
          adress !== "" &&
          purchase_price !== "" &&
          purchase_date !== ""
        );
      case 2:
        return (
          rent_amount !== "" &&
          lease_start_date !== ""
        );
      case 3:
        return (
          bank_amount !== "" &&
          duration_months !== "" &&
          monthly_payment !== "" &&
          loan_start_date !== "" &&
          loan_end_date !== "" &&
          lender_type !== ""
        );
      default:
        return false;
    }
  };

  useEffect(() => {
    const fetchProjectTypeId = async () => {
      const { data } = await supabase
        .from("project_types")
        .select("id")
        .eq("name", "Real estate asset") // adapte selon ton nom exact dans la BDD
        .single();
      if (data) setProjectTypeId(data.id);
    };
    fetchProjectTypeId();
  }, []);

  const handleSubmit = async () => {
    // 1. INSERT dans projects

    if (!name || !adress || !purchase_price) {
      setError(
        "Le nom, l'adresse et le prix d'achat sont obligatoires."
      );
      return;
    }
    const {
      data: projectData,
      error: projectError,
    } = await supabase
      .from("projects")
      .insert({
        name,
        company_id: companyId,
        project_type_id: projectTypeId,
        purchase_price: purchase_price
          ? parseFloat(purchase_price)
          : null,
        purchase_date: purchase_date || null,
        status: "active",
      })
      .select("id")
      .single();

    if (projectError || !projectData) {
      setError(
        "Erreur lors de la création du bien."
      );
      return;
    }

    const projectId = projectData.id;

    // 2. INSERT dans project_details (adresse + rénovations)
    const { error: detailsError } = await supabase
      .from("project_details")
      .insert([
        {
          project_id: projectId,
          key: "address",
          value: adress,
        },
        {
          project_id: projectId,
          key: "renovation_amount",
          value: renovation_amount || "0",
        },
      ]);

    if (detailsError) {
      setError(
        "Erreur lors de l'enregistrement de l'adresse."
      );
      return;
    }

    // 3. INSERT dans leases

    if (!rent_amount || !lease_start_date) {
      setError(
        "Le loyer et la date de début du bail sont obligatoires."
      );
      return;
    }

    const { error: leaseError } = await supabase
      .from("leases")
      .insert({
        project_id: projectId,
        rent_amount: parseFloat(rent_amount),
        charges_amount: charges_amount
          ? parseFloat(charges_amount)
          : 0,
        start_date: lease_start_date,
        end_date: lease_end_date || null,
        status: "actif",
      });

    if (leaseError) {
      setError(
        "Erreur lors de l'enregistrement du bail."
      );
      return;
    }

    // 4. INSERT dans loans

    if (
      !bank_amount ||
      !duration_months ||
      !monthly_payment
    ) {
      setError(
        "Les informations du prêt sont obligatoires."
      );
      return;
    }

    const { error: loanError } = await supabase
      .from("loans")
      .insert({
        project_id: projectId,
        lender_type,
        lender_company_id:
          lender_type === "company"
            ? companyId
            : null,
        bank_amount: parseFloat(bank_amount),
        duration_months: parseInt(
          duration_months
        ),
        monthly_payment: parseFloat(
          monthly_payment
        ),
        start_date: loan_start_date,
        end_date: loan_end_date,
      });

    if (loanError) {
      setError(
        "Erreur lors de l'enregistrement du prêt."
      );
      return;
    }

    // 5. Redirection après succès

    navigate(`/company/${companyId}`);
  };

  return (
    <div className="space-y-6">
      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {currentStep}/3
        </span>
        <div className="h-1 w-full rounded-full bg-gray-200">
          <div
            className="h-1 rounded-full bg-teal-500 transition-all"
            style={{
              width: `${(currentStep / 3) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step 1 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du bien
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              value={adress}
              onChange={(e) =>
                setAdress(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prix d'achat
            </label>
            <input
              type="number"
              value={purchase_price}
              onChange={(e) =>
                setPurchase_price(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date d'achat
            </label>
            <input
              type="date"
              value={purchase_date}
              onChange={(e) =>
                setPurchase_date(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant des rénovations
            </label>
            <input
              type="number"
              value={renovation_amount}
              onChange={(e) =>
                setrenovation_amount(
                  e.target.value
                )
              }
              className="w-full rounded border p-3"
            />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loyer mensuel
            </label>
            <input
              type="number"
              value={rent_amount}
              onChange={(e) =>
                setRent_amount(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant des charges mensuelles
            </label>
            <input
              type="number"
              value={charges_amount}
              onChange={(e) =>
                setCharges_amount(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de début du bail
            </label>
            <input
              type="date"
              value={lease_start_date}
              onChange={(e) =>
                setLease_start_date(
                  e.target.value
                )
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de fin du bail
            </label>
            <input
              type="date"
              value={lease_end_date}
              onChange={(e) =>
                setLease_end_date(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de prêteur
            </label>
            <select
              value={lender_type}
              onChange={(e) =>
                setLender_type(e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            >
              <option value="">
                -- Type de prêteur --
              </option>
              <option value="bank">Banque</option>
              <option value="company">
                Société du patrimoine
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant emprunté
            </label>
            <input
              type="number"
              value={bank_amount}
              onChange={(e) =>
                setBank_amount(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Durée du prêt (en mois)
            </label>
            <input
              type="number"
              value={duration_months}
              onChange={(e) =>
                setDuration_months(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mensualité
            </label>
            <input
              type="number"
              value={monthly_payment}
              onChange={(e) =>
                setMonthly_payment(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de début du prêt
            </label>
            <input
              type="date"
              value={loan_start_date}
              onChange={(e) =>
                setLoan_start_date(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de fin du prêt
            </label>
            <input
              type="date"
              value={loan_end_date}
              onChange={(e) =>
                setLoan_end_date(e.target.value)
              }
              className="w-full rounded border p-3"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <button onClick={prevStep}>
            ← Précédent
          </button>
        )}
        {currentStep < 3 && (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`${!isStepValid() ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Suivant →
          </button>
        )}
        {currentStep === 3 && (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid()}
            className={`${!isStepValid() ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Créer le bien
          </button>
        )}
      </div>
    </div>
  );
}
