import { useNavigate } from "react-router-dom";
import StatutBadge from "./StatutBadge";

const statutsCouleurs = {
  "À venir": "#C9A84C",
  "Confirmé": "#C9A84C",
  "En cours": "#4CAF50",
  "Terminé": "#555",
};

export default function PrestationCard({ prestation }) {
  const navigate = useNavigate();
  const date = prestation.date
    ? new Date(prestation.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "Date non définie";

  return (
    <div
      onClick={() => navigate(`/prestation/${prestation.id}`)}
      style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#C9A84C"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "#fff", fontSize: 18 }}>{prestation.client}</h3>
        <StatutBadge statut={prestation.statut} />
      </div>
      {prestation.type && (
        <div style={{ color: "#C9A84C", fontSize: 13, marginBottom: 8 }}>
          {prestation.type}{prestation.formule ? ` — ${prestation.formule}` : ""}
        </div>
      )}
      <div style={{ color: "#888", fontSize: 13, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>📅 {date}</span>
        {prestation.lieu && <span>📍 {prestation.lieu}</span>}
        {prestation.montant > 0 && <span>💶 {prestation.montant}€</span>}
        {prestation.bosseurs?.length > 0 && <span>👥 {prestation.bosseurs.join(", ")}</span>}
        {prestation.extras?.length > 0 && <span>➕ {prestation.extras.join(", ")}</span>}
      </div>
    </div>
  );
}
