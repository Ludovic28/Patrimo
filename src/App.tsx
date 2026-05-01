// src/App.tsx
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import CreateCompany from "./pages/CreateCompany";
import Login from "./pages/Login";
import ManageProjects from "./pages/ManageProjects";

export default function ImmoROIApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/"
          element={
            <Navigate
              to="/manage-projects"
              replace
            />
          }
        />
        <Route
          path="/manage-projects"
          element={
            <ProtectedRoute>
              <ManageProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateCompany />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
