import { useNavigate } from "react-router-dom";
import StatutBadge from "./StatutBadge";

const couleurBordure = {
  "Devis": "#FF9800",
  "À venir": "#C9A84C",
  "Confirmé": "#C9A84C",
  "En attente de l'acompte": "#FFA500",
  "Acompte payé": "#00BCD4",
  "En cours": "#4CAF50",
  "Évènement terminé": "#333",
};

function tronquer(texte, max) {
  if (!texte) return "";
  const propre = texte.replace(/\s*See More\s*/gi, "").trim();
  return propre.length > max ? propre.slice(0, max) + "…" : propre;
}

export default function PrestationCard({ prestation }) {
  const navigate = useNavigate();
  const date = prestation.date
    ? new Date(prestation.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const couleur = couleurBordure[prestation.statut] ?? "#C9A84C";

  return (
    <div
      onClick={() => navigate(`/prestation/${prestation.id}`)}
      style={{
        background: "#111",
        borderLeft: `4px solid ${couleur}`,
        borderTop: "1px solid #1a1a1a",
        borderRight: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
        borderRadius: 8,
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#161616"}
      onMouseLeave={e => e.currentTarget.style.background = "#111"}
    >
      {/* Infos principales */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Ligne 1 : Nom client */}
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {prestation.client || "—"}
        </div>
        {/* Ligne 2 : Date + Lieu */}
        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>📅 {date}</span>
          {prestation.lieu && (
            <span style={{ color: "#555", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              📍 {tronquer(prestation.lieu, 20)}
            </span>
          )}
        </div>
      </div>

      {/* Montant + Statut + Flèche */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {prestation.montant > 0 && (
          <div style={{ color: "#C9A84C", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
            {prestation.montant.toLocaleString("fr-FR")} €
          </div>
        )}
        <StatutBadge statut={prestation.statut} />
        <div style={{ color: "#333", fontSize: 18 }}>›</div>
      </div>
    </div>
  );
}
