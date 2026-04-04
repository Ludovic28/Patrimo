// src/App.tsx
import { Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import Tabs from "./Components/Tabs";
import Login from "./pages/Login";
import { TABS, type TabKey, getTabByKey } from "./Tabs/TabsRegistry";

function MainApp() {
  const [active, setActive] = useState<TabKey>("sci");
  const Active = getTabByKey(active).Component;

  return (
    <div className="flex min-h-screen flex-col">
      <Tabs
        active={active}
        onChange={(k) => setActive(k as TabKey)}
        items={TABS.map(({ key, label }) => ({ key, label }))}
      />
      <main className="flex-1">
        <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8">Chargement…</div>}>
          <Active />
        </Suspense>
      </main>
    </div>
  );
}

export default function ImmoROIApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
