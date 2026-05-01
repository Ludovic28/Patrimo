import React from "react";

type ButtonVariant =
  | "primary"
  | "add"
  | "danger"
  | "ghost";

export type InputZoneProps = {
  type: string;
  placeholder: string;
  email: string;
  setEmail: (
    value: string
  ) => void;
  handleLogin: () => void;
};

export function InputZone({
  type,
  placeholder,
  email,
  setEmail,
  handleLogin,
}: InputZoneProps) {
  return React.createElement(
    "input",
    {
      type: type,
      placeholder:
        placeholder,
      value: email,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement>
      ) =>
        setEmail(
          e.target.value
        ),
      onKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>
      ) =>
        e.key === "Enter" &&
        handleLogin(),
      className:
        "w-full rounded border p-3",
    }
  );
}

export function ButtonZone({
  onClick,
  disabled = false,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
}) {
  const styles: Record<
    ButtonVariant,
    string
  > = {
    // Bouton noir plein — connexion, validation
    primary:
      "w-full rounded bg-black p-3 text-white disabled:opacity-50",

    // Bouton d'ajout rectangulaire gris — ton cas
    add: "flex items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 bg-gray-50 px-20 py-12 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700 transition",

    // Bouton de suppression
    danger:
      "rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition disabled:opacity-50",

    // Bouton discret sans fond
    ghost:
      "rounded px-4 py-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50",
  };

  return React.createElement(
    "button",
    {
      onClick,
      disabled,
      className:
        styles[variant],
    },
    children
  );
}
