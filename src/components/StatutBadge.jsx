const couleurs = {
  "À venir": { bg: "#1a1a2e", text: "#C9A84C", border: "#C9A84C" },
  "En cours": { bg: "#1a2e1a", text: "#4CAF50", border: "#4CAF50" },
  "Terminé": { bg: "#1a1a1a", text: "#aaa", border: "#555" },
  "Évènement terminé": { bg: "#1a1a1a", text: "#aaa", border: "#555" },
  "Confirmé": { bg: "#2e1a2e", text: "#fff", border: "#C9A84C" },
  "En attente de l'acompte": { bg: "#2e2a1a", text: "#FFA500", border: "#FFA500" },
  "Acompte payé": { bg: "#1a2e2e", text: "#00BCD4", border: "#00BCD4" },
};

export default function StatutBadge({ statut }) {
  const c = couleurs[statut] ?? couleurs["À venir"];
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.5,
    }}>
      {statut}
    </span>
  );
}
