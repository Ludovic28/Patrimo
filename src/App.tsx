import {
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CompanyDashboard from "./pages/CompanyDashboard";
import CreateCompany from "./pages/CreateCompany";
import CreateProject from "./pages/CreateProject";
import Login from "./pages/Login";
import ManageProjects from "./pages/ManageProjects";
import Profil from "./pages/Profil";

export default function ImmoROIApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login/*"
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
            <>
              <SignedIn>
                <ManageProjects />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/create-project"
          element={
            <>
              <SignedIn>
                <CreateCompany />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/company/:id"
          element={
            <>
              <SignedIn>
                <CompanyDashboard />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/company/:id/create-project"
          element={
            <>
              <SignedIn>
                <CreateProject />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/profil"
          element={
            <>
              <SignedIn>
                <Profil />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
