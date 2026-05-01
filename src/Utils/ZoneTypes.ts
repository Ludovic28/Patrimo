import React from "react";

type ButtonVariant =
  | "primary"
  | "add"
  | "danger"
  | "ghost"
  | "company";

export type InputZoneProps = {
  type: string;
  placeholder: string;
  email: string;
  setEmail: (value: string) => void;
  handleLogin: () => void;
};

export function InputZone({
  type,
  placeholder,
  email,
  setEmail,
  handleLogin,
}: InputZoneProps) {
  return React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: email,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement>
    ) => setEmail(e.target.value),
    onKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => e.key === "Enter" && handleLogin(),
    className: "w-full rounded border p-3",
  });
}

export function ButtonZone({
  onClick,
  disabled = false,
  children,
  variant = "primary",
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  const styles: Record<ButtonVariant, string> = {
    // Full black button — login, validation
    primary:
      "w-full rounded bg-black p-3 text-white disabled:opacity-50",

    // Dashed add button — for creating new items
    add: "flex items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700 transition",

    // Company bubble button — for displaying existing companies
    company:
      "flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-400 hover:bg-teal-100 transition",

    // Danger button — for destructive actions
    danger:
      "rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition disabled:opacity-50",

    // Ghost button — subtle, no background
    ghost:
      "rounded px-4 py-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50",
  };

  return React.createElement(
    "button",
    {
      onClick,
      disabled,
      className: `${styles[variant]} ${className}`,
    },
    children
  );
}
