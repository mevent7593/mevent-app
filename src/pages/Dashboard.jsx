import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrestationCard from "../components/PrestationCard";

const FILTRES = ["Tous", "À venir", "Acompte payé", "Évènement terminé"];
const STATUTS_A_VENIR = ["À venir", "Confirmé", "En cours", "Acompte payé"];
const TYPES = ["Photo Booth", "Vidéo Booth 360°", "Pack Photo & Vidéo", "Autre"];
const MACHINES = ["Photo Booth", "Vidéo Booth 360°", "Combiné (Photo Booth + Vidéo Booth 360°)"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [prestations, setPrestations] = useState([]);
  const [filtre, setFiltre] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/prestations")
      .then(r => r.json())
      .then(data => { setPrestations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const affichees = filtre === "Tous"
    ? prestations
    : filtre === "À venir"
      ? prestations.filter(p => STATUTS_A_VENIR.includes(p.statut))
      : prestations.filter(p => p.statut === filtre);


  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="M'event" style={{ height: 125, objectFit: "contain", mixBlendMode: "lighten" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/planning")}
            style={{ background: "transparent", color: "#C9A84C", border: "1px solid #C9A84C", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            📅 Planning
          </button>
          <button
            onClick={() => navigate("/finance")}
            style={{ background: "transparent", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            📊 Finances
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
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
            { label: "À venir", count: prestations.filter(p => [...STATUTS_A_VENIR, "Acompte payé"].includes(p.statut)).length },
            { label: "En cours", count: prestations.filter(p => p.statut === "En cours").length },
            { label: "Terminées", count: prestations.filter(p => p.statut === "Évènement terminé").length },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ color: "#C9A84C", fontSize: 32, fontWeight: 700 }}>{s.count}</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {FILTRES.map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              background: filtre === f ? "#C9A84C" : "#111",
              color: filtre === f ? "#000" : "#aaa",
              border: `1px solid ${filtre === f ? "#C9A84C" : "#2a2a2a"}`,
              borderRadius: 20, padding: "6px 16px", cursor: "pointer",
              fontWeight: filtre === f ? 700 : 400, fontSize: 13,
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Chargement...</div>
        ) : affichees.length === 0 ? (
          <div style={{ color: "#555", textAlign: "center", marginTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div>Aucune prestation {filtre !== "Tous" ? `"${filtre}"` : ""}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {affichees.map(p => <PrestationCard key={p.id} prestation={p} />)}
          </div>
        )}
      </div>

      {showForm && (
        <NouvellePrestation
          onClose={() => setShowForm(false)}
          onSaved={(p) => { setPrestations(prev => [p, ...prev]); setShowForm(false); }}
        />
      )}
    </div>
  );
}

const BOSSEURS = ["Lassana", "Hamza", "Ibrahima", "Moussa", "Joseph"];
const STATUTS = ["À venir", "Acompte payé", "En cours", "Évènement terminé"];

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
