import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BOSSEURS = ["Tous", "Lassana", "Hamza", "Ibrahima", "Moussa", "Joseph"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function couleurStatut(statut) {
  if (statut === "Acompte payé") return "#00BCD4";
  if (statut === "Évènement terminé") return "#555";
  if (statut === "En cours") return "#4CAF50";
  return "#C9A84C";
}

export default function Planning() {
  const navigate = useNavigate();
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bosseur, setBosseur] = useState("Tous");
  const aujourd = new Date();
  const [mois, setMois] = useState(aujourd.getMonth());
  const [annee, setAnnee] = useState(aujourd.getFullYear());

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => { setPrestations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const moisPrecedent = () => {
    if (mois === 0) { setMois(11); setAnnee(a => a - 1); }
    else setMois(m => m - 1);
  };
  const moisSuivant = () => {
    if (mois === 11) { setMois(0); setAnnee(a => a + 1); }
    else setMois(m => m + 1);
  };

  const filtrées = bosseur === "Tous"
    ? prestations
    : prestations.filter(p => p.bosseurs?.includes(bosseur));

  const prestationsParJour = (jour) => {
    return filtrées.filter(p => {
      if (!p.date) return false;
      const d = new Date(p.date);
      return d.getFullYear() === annee && d.getMonth() === mois && d.getDate() === jour;
    });
  };

  const premierJour = new Date(annee, mois, 1).getDay();
  const decalage = premierJour === 0 ? 6 : premierJour - 1;
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases = decalage + nbJours;
  const totalCases = Math.ceil(cases / 7) * 7;

  const aujourdDate = new Date();
  const estAujourd = (jour) =>
    jour === aujourdDate.getDate() && mois === aujourdDate.getMonth() && annee === aujourdDate.getFullYear();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ← Retour
        </button>
        <img src="/logo.png" alt="M'event" style={{ height: 80, objectFit: "contain", mixBlendMode: "lighten" }} />
      </div>

      <div style={{ padding: "32px" }}>
        {/* Contrôles */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          {/* Navigation mois */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={moisPrecedent} style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 16 }}>‹</button>
            <h2 style={{ margin: 0, fontSize: 20, color: "#C9A84C", minWidth: 180, textAlign: "center" }}>
              {MOIS[mois]} {annee}
            </h2>
            <button onClick={moisSuivant} style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 16 }}>›</button>
          </div>

          {/* Filtre bosseur */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BOSSEURS.map(b => (
              <button key={b} onClick={() => setBosseur(b)} style={{
                background: bosseur === b ? "#C9A84C" : "#111",
                color: bosseur === b ? "#000" : "#aaa",
                border: `1px solid ${bosseur === b ? "#C9A84C" : "#2a2a2a"}`,
                borderRadius: 20, padding: "6px 14px", cursor: "pointer",
                fontWeight: bosseur === b ? 700 : 400, fontSize: 13,
              }}>{b}</button>
            ))}
          </div>
        </div>

        {/* Grille calendrier */}
        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Chargement...</div>
        ) : (
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
            {/* Entêtes jours */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #2a2a2a" }}>
              {JOURS.map(j => (
                <div key={j} style={{ padding: "10px 0", textAlign: "center", color: "#555", fontSize: 12, fontWeight: 600 }}>{j}</div>
              ))}
            </div>

            {/* Cases */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: totalCases }).map((_, i) => {
                const jour = i - decalage + 1;
                const valide = jour >= 1 && jour <= nbJours;
                const prestas = valide ? prestationsParJour(jour) : [];
                return (
                  <div key={i} style={{
                    minHeight: 90,
                    padding: "6px 4px",
                    borderRight: (i + 1) % 7 !== 0 ? "1px solid #1a1a1a" : "none",
                    borderBottom: "1px solid #1a1a1a",
                    background: !valide ? "#0d0d0d" : "transparent",
                  }}>
                    {valide && (
                      <>
                        <div style={{
                          fontSize: 12, fontWeight: 600, marginBottom: 4, textAlign: "right", paddingRight: 4,
                          color: estAujourd(jour) ? "#000" : "#555",
                          background: estAujourd(jour) ? "#C9A84C" : "transparent",
                          borderRadius: estAujourd(jour) ? "50%" : 0,
                          width: estAujourd(jour) ? 22 : "auto",
                          height: estAujourd(jour) ? 22 : "auto",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginLeft: "auto",
                        }}>{jour}</div>
                        {prestas.map(p => (
                          <div
                            key={p.id}
                            onClick={() => navigate(`/prestation/${p.id}`)}
                            style={{
                              background: couleurStatut(p.statut),
                              borderRadius: 4,
                              padding: "3px 5px",
                              marginBottom: 3,
                              cursor: "pointer",
                              fontSize: 11,
                              color: p.statut === "Évènement terminé" ? "#aaa" : "#000",
                              fontWeight: 600,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                            title={`${p.client} — ${p.lieu || ""}`}
                          >
                            {p.client}
                            {p.extras?.length > 0 && (
                              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                +{p.extras.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Légende */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "À venir / Confirmé", color: "#C9A84C" },
            { label: "Acompte payé", color: "#00BCD4" },
            { label: "En cours", color: "#4CAF50" },
            { label: "Terminé", color: "#555" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
              <span style={{ color: "#666", fontSize: 12 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
