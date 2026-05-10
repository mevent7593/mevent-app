import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Prestation from "./pages/Prestation";
import Disponibilite from "./pages/Disponibilite";
import Planning from "./pages/Planning";
import Finance from "./pages/Finance";
import Login from "./pages/Login";
import LaisserAvis from "./pages/LaisserAvis";
import AvisValidation from "./pages/AvisValidation";

function ProtectedApp() {
  const [authed, setAuthed] = useState(localStorage.getItem("mevent_auth") === "1");
  const location = useLocation();

  // Routes publiques : /dispo/ et /laisser-avis (liens envoyés aux membres/clients)
  if (location.pathname.startsWith("/dispo/")) {
    return (
      <Routes>
        <Route path="/dispo/:prestationId" element={<Disponibilite />} />
      </Routes>
    );
  }
  if (location.pathname === "/laisser-avis") {
    return (
      <Routes>
        <Route path="/laisser-avis" element={<LaisserAvis />} />
      </Routes>
    );
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/prestation/:id" element={<Prestation />} />
      <Route path="/planning" element={<Planning />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/avis-validation" element={<AvisValidation />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProtectedApp />
    </BrowserRouter>
  );
}
