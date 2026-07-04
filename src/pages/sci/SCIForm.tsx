import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sql from "../../Lib/neon/client";

type Props = {
  companyId: string;
};

export default function SCIForm({
  companyId,
}: Props) {
  const [currentStep, setCurrentStep] =
    useState(1);
  const navigate = useNavigate();

  // Step 1
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

  // Step 2
  const [rent_amount, setRent_amount] =
    useState("");
  const [charges_amount, setCharges_amount] =
    useState("");
  const [lease_start_date, setLease_start_date] =
    useState("");
  const [lease_end_date, setLease_end_date] =
    useState("");

  // Step 3
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
  const [error, setError] = useState<
    string | null
  >(null);

  const nextStep = () =>
    setCurrentStep((prev) => prev + 1);
  const prevStep = () =>
    setCurrentStep((prev) => prev - 1);

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
        if (lender_type === "none") return true;
        return (
          bank_amount !== "" &&
          duration_months !== "" &&
          monthly_payment !== "" &&
          loan_start_date !== "" &&
          loan_end_date !== ""
        );
      default:
        return false;
    }
  };

  // Fetch the project type id for "Real estate asset"
  useEffect(() => {
    const fetchProjectTypeId = async () => {
      try {
        const data = await sql`
          select id from project_types
          where name = 'Real estate asset'
          limit 1
        `;
        if (data.length > 0)
          setProjectTypeId(data[0].id);
      } catch (err) {
        console.error(
          "Error fetching project type:",
          err
        );
      }
    };
    fetchProjectTypeId();
  }, []);

  const handleSubmit = async () => {
    // Validate all steps before inserting anything
    if (
      !name ||
      !adress ||
      !purchase_price ||
      !purchase_date
    ) {
      setError(
        "Le nom, l'adresse, le prix et la date d'achat sont obligatoires."
      );
      return;
    }

    if (!rent_amount || !lease_start_date) {
      setError(
        "Le loyer et la date de début du bail sont obligatoires."
      );
      return;
    }

    if (lender_type === "") {
      setError(
        "Veuillez sélectionner un type de financement."
      );
      return;
    }

    if (lender_type !== "none") {
      if (
        !bank_amount ||
        !duration_months ||
        !monthly_payment ||
        !loan_start_date ||
        !loan_end_date
      ) {
        setError(
          "Les informations du prêt sont obligatoires."
        );
        return;
      }
    }

    // All validations passed — start inserting
    try {
      // 1. Insert into projects
      const projectData = await sql`
      insert into projects (name, company_id, project_type_id, purchase_price, purchase_date, status)
      values (
        ${name},
        ${companyId},
        ${projectTypeId},
        ${parseFloat(purchase_price)},
        ${purchase_date},
        'active'
      )
      returning id
    `;

      if (
        !projectData ||
        projectData.length === 0
      ) {
        setError(
          "Erreur lors de la création du bien."
        );
        return;
      }

      const projectId = projectData[0].id;

      // 2. Insert into project_details
      await sql`
      insert into project_details (project_id, key, value)
      values 
        (${projectId}, 'address', ${adress}),
        (${projectId}, 'renovation_amount', ${renovation_amount || "0"})
    `;

      // 3. Insert into leases
      await sql`
      insert into leases (project_id, rent_amount, charges_amount, start_date, end_date, status)
      values (
        ${projectId},
        ${parseFloat(rent_amount)},
        ${charges_amount ? parseFloat(charges_amount) : 0},
        ${lease_start_date},
        ${lease_end_date || null},
        'actif'
      )
    `;

      // 4. Insert into loans — only if not cash purchase
      if (lender_type !== "none") {
        await sql`
        insert into loans (project_id, lender_type, lender_company_id, bank_amount, duration_months, monthly_payment, start_date, end_date)
        values (
          ${projectId},
          ${lender_type},
          ${lender_type === "company" ? companyId : null},
          ${parseFloat(bank_amount)},
          ${parseInt(duration_months)},
          ${parseFloat(monthly_payment)},
          ${loan_start_date},
          ${loan_end_date}
        )
      `;
      }

      // 5. Redirect on success
      navigate(`/company/${companyId}`);
    } catch (err) {
      console.error(
        "Error creating property:",
        err
      );
      setError(
        "Une erreur est survenue lors de la création."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
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
                -- Sélectionnez un type de prêteur
                --
              </option>
              <option value="none">
                Achat comptant — pas de prêt
              </option>
              <option value="bank">Banque</option>
              <option value="company">
                Société du patrimoine
              </option>
            </select>
          </div>
          {/* Champs prêt — masqués si achat comptant */}
          {lender_type !== "none" &&
            lender_type !== "" && (
              <>
                <div>
                  <label>Montant emprunté</label>
                  <input
                    type="number"
                    value={bank_amount}
                    onChange={(e) =>
                      setBank_amount(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-3"
                  />
                </div>
                <div>
                  <label>
                    Durée du prêt (en mois)
                  </label>
                  <input
                    type="number"
                    value={duration_months}
                    onChange={(e) =>
                      setDuration_months(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-3"
                  />
                </div>
                <div>
                  <label>Mensualité</label>
                  <input
                    type="number"
                    value={monthly_payment}
                    onChange={(e) =>
                      setMonthly_payment(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-3"
                  />
                </div>
                <div>
                  <label>
                    Date de début du prêt
                  </label>
                  <input
                    type="date"
                    value={loan_start_date}
                    onChange={(e) =>
                      setLoan_start_date(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-3"
                  />
                </div>
                <div>
                  <label>
                    Date de fin du prêt
                  </label>
                  <input
                    type="date"
                    value={loan_end_date}
                    onChange={(e) =>
                      setLoan_end_date(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-3"
                  />
                </div>
              </>
            )}
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
