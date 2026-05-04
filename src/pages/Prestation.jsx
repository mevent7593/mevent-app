import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StatutBadge from "../components/StatutBadge";

export default function Prestation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestation, setPrestation] = useState(null);
  const [dispos, setDispos] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => {
        const p = (Array.isArray(data) ? data : []).find(x => x.id === id);
        setPrestation(p);
        if (p?.statut === "Confirmé") setConfirme(true);
      });

    fetch(`/api/disponibilite?prestationId=${id}`)
      .then(r => r.json())
      .then(d => setDispos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [id]);

  const handleValiderDevis = async () => {
    setValidating(true);
    await fetch("/api/statut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId: id, statut: "À venir" }),
    });
    setPrestation(p => ({ ...p, statut: "À venir" }));
    setValidating(false);
  };

  const handleConfirmer = async () => {
    setConfirming(true);
    await fetch("/api/confirmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestationId: id }),
    });
    setConfirme(true);
    setConfirming(false);
    setPrestation(p => ({ ...p, statut: "Confirmé" }));
  };

  if (!prestation) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      Chargement...
    </div>
  );

  const date = prestation.date
    ? new Date(prestation.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "Date non définie";

  const disponibles = dispos.filter(d => d.disponible === "Oui").length;
  const nonDisponibles = dispos.filter(d => d.disponible === "Non").length;
  const enAttente = dispos.filter(d => d.disponible === "En attente").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ← Retour
        </button>
        <img src="/logo.png" alt="M'event" style={{ height: 125, objectFit: "contain", mixBlendMode: "lighten" }} />
      </div>

      <div style={{ padding: "32px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>{prestation.client}</h1>
            {prestation.type && <div style={{ color: "#C9A84C", fontSize: 15 }}>{prestation.type}{prestation.formule ? ` — ${prestation.formule}` : ""}</div>}
          </div>
          <StatutBadge statut={prestation.statut} />
        </div>

        {/* Détails */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Détails</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Date", value: date },
              { label: "Lieu", value: prestation.lieu || "—" },
              { label: "Prix", value: prestation.montant ? `${prestation.montant}€` : "—" },
              { label: "Acompte payé", value: prestation.acompte ? `${prestation.acompte}€` : "—" },
              { label: "Téléphone", value: prestation.telephone || "—" },
              { label: "Email", value: prestation.email || "—" },
              { label: "Filtre", value: prestation.filtre || "—" },
              { label: "Équipe", value: prestation.bosseurs?.join(", ") || "—" },
              { label: "Extras", value: prestation.extras?.length ? prestation.extras.join(", ") : "—" },
            ].map(d => (
              <div key={d.label}>
                <div style={{ color: "#555", fontSize: 12, marginBottom: 4 }}>{d.label}</div>
                <div style={{ color: "#fff", fontSize: 14 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Valider devis */}
        {prestation.statut === "Devis" && (
          <div style={{ background: "#111", border: "1px solid #FF9800", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 14 }}>
              Le client a accepté le devis ? Validez pour le passer en prestation à venir.
            </p>
            <button onClick={handleValiderDevis} disabled={validating} style={{ background: "#FF9800", color: "#000", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              {validating ? "Validation..." : "Valider le devis"}
            </button>
          </div>
        )}

        {/* Confirmer */}
        {!confirme && (prestation.statut === "À venir" || prestation.statut === "En attente de l'acompte") && (
          <div style={{ background: "#111", border: "1px solid #C9A84C", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 14 }}>
              Prestation confirmée par le client ? Notifiez tous les membres pour connaître leurs disponibilités.
            </p>
            <button onClick={handleConfirmer} disabled={confirming} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              {confirming ? "Envoi en cours..." : "Confirmer et notifier les membres"}
            </button>
          </div>
        )}

        {confirme && (
          <div style={{ background: "#1a2e1a", border: "1px solid #4CAF50", borderRadius: 12, padding: 16, marginBottom: 24, color: "#4CAF50", textAlign: "center", fontSize: 14 }}>
            Prestation confirmée — notifications envoyées aux membres
          </div>
        )}

        {/* Disponibilités */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Disponibilités membres</h3>
            <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#4CAF50" }}>{disponibles} ✓</span>
              <span style={{ color: "#f44336" }}>{nonDisponibles} ✗</span>
              <span style={{ color: "#888" }}>{enAttente} en attente</span>
            </div>
          </div>

          {dispos.length === 0 ? (
            <div style={{ color: "#555", textAlign: "center", padding: "24px 0", fontSize: 14 }}>
              Aucune réponse pour l'instant
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dispos.map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0a0a0a", borderRadius: 8 }}>
                  <span style={{ color: "#fff" }}>{d.membre || "Membre"}</span>
                  <span style={{ color: d.disponible === "Oui" ? "#4CAF50" : d.disponible === "Non" ? "#f44336" : "#888", fontWeight: 600, fontSize: 13 }}>
                    {d.disponible === "Oui" ? "Disponible" : d.disponible === "Non" ? "Non disponible" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
