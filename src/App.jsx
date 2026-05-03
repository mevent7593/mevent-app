import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Prestation from "./pages/Prestation";
import Disponibilite from "./pages/Disponibilite";
import Planning from "./pages/Planning";
import Finance from "./pages/Finance";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prestation/:id" element={<Prestation />} />
        <Route path="/dispo/:prestationId" element={<Disponibilite />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/finance" element={<Finance />} />
      </Routes>
    </BrowserRouter>
  );
}
