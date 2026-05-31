// src/App.tsx
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import CompanyDashboard from "./pages/CompanyDashboard";
import CreateCompany from "./pages/CreateCompany";
import CreateProject from "./pages/CreateProject";
import Login from "./pages/Login";
import ManageProjects from "./pages/ManageProjects";
import Profil from "./pages/Profil";
import SCIForm from "./pages/sci/SCIForm";

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
        <Route
          path="/company/:id"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/create-project"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sci/createproperty"
          element={<SCIForm companyId={""} />}
        />
        {/* <Route
          path="/property/:id"
          element={<PropertyDetail />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}
