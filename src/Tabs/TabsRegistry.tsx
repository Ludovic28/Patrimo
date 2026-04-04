// src/tabs/TabRegistry.tsx
import LaundryTab from "./Laundry";
import LogoutButton from "./LogoutButton";
import SciTab from "./SciTab";

export type TabKey = "sci" | "laundry" | "deconnexion";

export interface TabItem {
  key: TabKey;
  label: string;
  Component: () => JSX.Element;
}

export const TABS: TabItem[] = [
  { key: "sci", label: "SCI", Component: SciTab },
  { key: "laundry", label: "Laverie", Component: LaundryTab },
  { key: "deconnexion", label: "Déconnexion", Component: LogoutButton },
];

// Helper
export const getTabByKey = (key: TabKey) => TABS.find((t) => t.key === key) ?? TABS[0];
