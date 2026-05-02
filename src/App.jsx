import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Prestation from "./pages/Prestation";
import Disponibilite from "./pages/Disponibilite";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prestation/:id" element={<Prestation />} />
        <Route path="/dispo/:prestationId" element={<Disponibilite />} />
      </Routes>
    </BrowserRouter>
  );
}
