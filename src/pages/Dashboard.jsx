import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrestationCard from "../components/PrestationCard";

const STATUTS_A_VENIR = ["À venir", "Confirmé", "En cours", "Acompte payé"];
const TYPES = ["Photo Booth", "Vidéo Booth 360°", "Pack Photo & Vidéo", "Autre"];
const MACHINES = ["Photo Booth", "Vidéo Booth 360°", "Combiné (Photo Booth + Vidéo Booth 360°)"];

const DOSSIERS = [
  { label: "Devis", couleur: "#FF9800", icone: "📋", statuts: ["Devis"] },
  { label: "À venir", couleur: "#C9A84C", icone: "📅", statuts: ["À venir", "Confirmé", "En cours", "Acompte payé"] },
  { label: "Acompte payé", couleur: "#00BCD4", icone: "💳", statuts: ["Acompte payé"] },
  { label: "Évènement terminé", couleur: "#555", icone: "✅", statuts: ["Évènement terminé"] },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ouverts, setOuverts] = useState({ "Devis": true, "À venir": true, "Acompte payé": false, "Évènement terminé": false });
  const [avisEnAttente, setAvisEnAttente] = useState(0);
  const [showRelances, setShowRelances] = useState(false);

  const chargerPrestations = () => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => { setPrestations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    chargerPrestations();
    fetch("/api/avis?nonValides=1")
      .then(r => r.json())
      .then(d => setAvisEnAttente(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, []);

  const toggleDossier = (label) => setOuverts(prev => ({ ...prev, [label]: !prev[label] }));


  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <img src="/logo.png" alt="M'event" style={{ height: 100, objectFit: "contain", mixBlendMode: "lighten" }} />
        <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/planning")}
            style={{ background: "transparent", color: "#C9A84C", border: "1px solid #C9A84C", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            📅 Planning
          </button>
          <button
            onClick={() => navigate("/finance")}
            style={{ background: "transparent", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            📊 Finances
          </button>
          <button
            onClick={() => navigate("/avis-validation")}
            style={{ background: "transparent", color: "#FF9800", border: "1px solid #FF9800", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13, position: "relative" }}
          >
            💬 Avis
            {avisEnAttente > 0 && (
              <span style={{ position: "absolute", top: -8, right: -8, background: "#f44336", color: "#fff", borderRadius: 20, padding: "2px 7px", fontSize: 11, fontWeight: 700, minWidth: 20 }}>
                {avisEnAttente}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowRelances(true)}
            style={{ background: "transparent", color: "#9C27B0", border: "1px solid #9C27B0", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            📤 Relances
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            + Nouvelle prestation
          </button>
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total", count: prestations.length },
            { label: "À venir", count: prestations.filter(p => STATUTS_A_VENIR.includes(p.statut)).length },
            { label: "En cours", count: prestations.filter(p => p.date === new Date().toISOString().slice(0, 10) && p.statut !== "Évènement terminé").length },
            { label: "Terminées", count: prestations.filter(p => p.statut === "Évènement terminé").length },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ color: "#C9A84C", fontSize: 32, fontWeight: 700 }}>{s.count}</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Chargement...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DOSSIERS.map(dossier => {
              const items = prestations.filter(p => dossier.statuts.includes(p.statut));
              const ouvert = ouverts[dossier.label];
              return (
                <div key={dossier.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
                  {/* En-tête dossier */}
                  <div
                    onClick={() => toggleDossier(dossier.label)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer", borderLeft: `4px solid ${dossier.couleur}` }}
                  >
                    <span style={{ fontSize: 18 }}>{ouvert ? "📂" : "📁"}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", flex: 1 }}>{dossier.label}</span>
                    <span style={{ background: dossier.couleur, color: dossier.couleur === "#555" ? "#aaa" : "#000", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                      {items.length}
                    </span>
                    <span style={{ color: "#555", fontSize: 18 }}>{ouvert ? "▲" : "▼"}</span>
                  </div>

                  {/* Contenu dossier */}
                  {ouvert && (
                    <div style={{ borderTop: "1px solid #1a1a1a" }}>
                      {items.length === 0 ? (
                        <div style={{ color: "#555", textAlign: "center", padding: "20px", fontSize: 14 }}>Aucune prestation</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {items.map(p => <PrestationCard key={p.id} prestation={p} />)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <NouvellePrestation
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); setTimeout(chargerPrestations, 1500); }}
        />
      )}

      {showRelances && <RelancesAvis onClose={() => setShowRelances(false)} />}
    </div>
  );
}

function RelancesAvis({ onClose }) {
  const [eligibles, setEligibles] = useState([]);
  const [selection, setSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);

  useEffect(() => {
    fetch("/api/relances-avis")
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setEligibles(arr);
        setSelection(arr.reduce((acc, e) => ({ ...acc, [e.id]: true }), {}));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id) => setSelection(s => ({ ...s, [id]: !s[id] }));
  const toggleAll = (val) => setSelection(eligibles.reduce((acc, e) => ({ ...acc, [e.id]: val }), {}));
  const idsSelectionnes = eligibles.filter(e => selection[e.id]).map(e => e.id);

  const envoyer = async () => {
    if (idsSelectionnes.length === 0) return;
    if (!window.confirm(`Envoyer la relance à ${idsSelectionnes.length} client${idsSelectionnes.length > 1 ? "s" : ""} ?`)) return;
    setEnvoi(true);
    const res = await fetch("/api/relances-avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsSelectionnes }),
    });
    const data = await res.json();
    setResultat(data);
    setEnvoi(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>📤 Relances avis</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>Fermer</button>
        </div>

        {resultat ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ margin: "0 0 8px", color: "#4CAF50" }}>{resultat.envoyes} email{resultat.envoyes > 1 ? "s" : ""} envoyé{resultat.envoyes > 1 ? "s" : ""}</h3>
            {resultat.erreurs && resultat.erreurs.length > 0 && (
              <div style={{ color: "#f44336", fontSize: 13, marginTop: 12 }}>
                {resultat.erreurs.length} erreur{resultat.erreurs.length > 1 ? "s" : ""}
              </div>
            )}
            <button onClick={onClose} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 24 }}>OK</button>
          </div>
        ) : loading ? (
          <div style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>Chargement...</div>
        ) : eligibles.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>
            Aucun client éligible pour une relance.
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>(prestations terminées avant le 8 mai 2026, avec email, sans relance déjà envoyée)</div>
          </div>
        ) : (
          <>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 12px" }}>
              {eligibles.length} client{eligibles.length > 1 ? "s" : ""} éligible{eligibles.length > 1 ? "s" : ""} pour une relance avis + code FIDELITE20.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => toggleAll(true)} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Tout cocher</button>
              <button onClick={() => toggleAll(false)} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Tout décocher</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto", marginBottom: 16 }}>
              {eligibles.map(e => {
                const date = e.date ? new Date(e.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                const checked = !!selection[e.id];
                return (
                  <label key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#0a0a0a", borderRadius: 8, cursor: "pointer", border: `1px solid ${checked ? "#9C27B0" : "transparent"}` }}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(e.id)} style={{ accentColor: "#9C27B0" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                        {e.prenom ? `${e.prenom} ` : ""}{e.nom}
                      </div>
                      <div style={{ color: "#666", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.email} · {date}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              onClick={envoyer}
              disabled={envoi || idsSelectionnes.length === 0}
              style={{ width: "100%", background: "#9C27B0", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontWeight: 700, cursor: idsSelectionnes.length === 0 ? "not-allowed" : "pointer", fontSize: 15, opacity: idsSelectionnes.length === 0 ? 0.5 : 1 }}
            >
              {envoi ? "Envoi en cours..." : `Envoyer à ${idsSelectionnes.length} client${idsSelectionnes.length > 1 ? "s" : ""}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const BOSSEURS = ["Lassana", "Hamza", "Ibrahima", "Moussa", "Joseph"];
const STATUTS = ["Devis", "À venir", "Acompte payé", "En cours", "Évènement terminé"];

function NouvellePrestation({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: "", prenom: "", type: "Photo Booth", machine: [], date: "", creneau: "", lieu: "", montant: "", acompte: "", telephone: "", email: "", filtre: "", musique: "", bosseurs: [], extras: "", statut: "À venir" });
  const [saving, setSaving] = useState(false);

  const toggleMachine = (m) => setForm(p => ({ ...p, machine: p.machine.includes(m) ? p.machine.filter(x => x !== m) : [...p.machine, m] }));
  const toggleBosseur = (b) => setForm(p => ({ ...p, bosseurs: p.bosseurs.includes(b) ? p.bosseurs.filter(x => x !== b) : [...p.bosseurs, b] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/prestations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, montant: Number(form.montant), acompte: Number(form.acompte), extras: form.extras ? form.extras.split(",").map(e => e.trim()).filter(Boolean) : [] }),
    });
    const data = await res.json();
    onSaved({ ...form, id: data.id, client: `${form.nom} ${form.prenom}`.trim(), formule: form.machine.join(", "), montant: Number(form.montant), acompte: Number(form.acompte) });
  };

  const inputStyle = { width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box" };
  const labelStyle = { color: "#888", fontSize: 12, display: "block", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 24px", color: "#fff" }}>Nouvelle prestation</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} style={inputStyle} placeholder="Dupont" />
            </div>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} style={inputStyle} placeholder="Marie" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Créneau horaire</label>
              <input value={form.creneau} onChange={e => setForm(p => ({ ...p, creneau: e.target.value }))} style={inputStyle} placeholder="18h - 23h" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Lieu</label>
            <input value={form.lieu} onChange={e => setForm(p => ({ ...p, lieu: e.target.value }))} style={inputStyle} placeholder="Paris 8e" />
          </div>
          <div>
            <label style={labelStyle}>Type d'événement</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Machine utilisée</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MACHINES.map(m => (
                <button key={m} type="button" onClick={() => toggleMachine(m)} style={{
                  background: form.machine.includes(m) ? "#C9A84C" : "#0a0a0a",
                  color: form.machine.includes(m) ? "#000" : "#aaa",
                  border: `1px solid ${form.machine.includes(m) ? "#C9A84C" : "#2a2a2a"}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: form.machine.includes(m) ? 700 : 400
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Prix (€)</label>
              <input type="number" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} style={inputStyle} placeholder="300" />
            </div>
            <div>
              <label style={labelStyle}>Acompte payé (€)</label>
              <input type="number" value={form.acompte} onChange={e => setForm(p => ({ ...p, acompte: e.target.value }))} style={inputStyle} placeholder="100" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} style={inputStyle} placeholder="06 00 00 00 00" />
            </div>
            <div>
              <label style={labelStyle}>Email client</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="client@email.com" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nom sur le filtre</label>
            <input value={form.filtre} onChange={e => setForm(p => ({ ...p, filtre: e.target.value }))} style={inputStyle} placeholder="Marie & Thomas" />
          </div>
          <div>
            <label style={labelStyle}>Musique choisie (lien)</label>
            <input value={form.musique} onChange={e => setForm(p => ({ ...p, musique: e.target.value }))} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Les Bosseurs</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BOSSEURS.map(b => (
                <button key={b} type="button" onClick={() => toggleBosseur(b)} style={{
                  background: form.bosseurs.includes(b) ? "#C9A84C" : "#0a0a0a",
                  color: form.bosseurs.includes(b) ? "#000" : "#aaa",
                  border: `1px solid ${form.bosseurs.includes(b) ? "#C9A84C" : "#2a2a2a"}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: form.bosseurs.includes(b) ? 700 : 400
                }}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Extras (noms séparés par des virgules)</label>
            <input value={form.extras} onChange={e => setForm(p => ({ ...p, extras: e.target.value }))} style={inputStyle} placeholder="Karim, Samir" />
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} style={inputStyle}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "12px", cursor: "pointer" }}>Annuler</button>
            <button type="submit" disabled={saving} style={{ flex: 1, background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Sauvegarde..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
