import React from "react";
import "./index.css";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemStatement from "./pages/ProblemStatment.jsx";
import SessionPage from "./pages/SessionPage.jsx";
import EnvTest from "./components/EnvTest.jsx";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />}
        />

        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />}
        />

        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemStatement /> : <Navigate to="/" />}
        />

        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage/> : <Navigate to="/" />}
        />
      </Routes>

      <Toaster />
      <EnvTest/>
       

    </>
  );
}

export default App