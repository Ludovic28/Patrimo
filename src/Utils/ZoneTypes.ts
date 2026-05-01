import React from "react";

export type InputZoneProps = {
  type: string;
  placeholder: string;
  email: string;
  setEmail: (value: string) => void;
  handleLogin: () => void;
};

export function InputZone({ type, placeholder, email, setEmail, handleLogin }: InputZoneProps) {
  return React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: email,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleLogin(),
    className: "w-full rounded border p-3",
  });
}

export function ButtonZone({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return React.createElement(
    "button",
    {
      onClick: onClick,
      disabled: disabled,
      className: "w-full rounded bg-black p-3 text-white disabled:opacity-50",
    },
    children
  );
}
