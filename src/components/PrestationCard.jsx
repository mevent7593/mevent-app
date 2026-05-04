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
        padding: "12px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 16,
        minHeight: 52,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#161616"}
      onMouseLeave={e => e.currentTarget.style.background = "#111"}
    >
      {/* Nom client */}
      <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", minWidth: 160, flex: "0 0 auto" }}>
        {prestation.client || "—"}
      </div>

      {/* Date */}
      <div style={{ color: "#666", fontSize: 13, minWidth: 110, flex: "0 0 auto" }}>
        📅 {date}
      </div>

      {/* Lieu tronqué */}
      <div style={{ color: "#555", fontSize: 13, flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {prestation.lieu ? `📍 ${tronquer(prestation.lieu, 40)}` : ""}
      </div>

      {/* Montant */}
      {prestation.montant > 0 && (
        <div style={{ color: "#C9A84C", fontSize: 14, fontWeight: 600, flex: "0 0 auto" }}>
          {prestation.montant.toLocaleString("fr-FR")} €
        </div>
      )}

      {/* Statut */}
      <div style={{ flex: "0 0 auto" }}>
        <StatutBadge statut={prestation.statut} />
      </div>

      {/* Flèche */}
      <div style={{ color: "#333", fontSize: 18, flex: "0 0 auto" }}>›</div>
    </div>
  );
}
