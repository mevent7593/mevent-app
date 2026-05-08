import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const COULEURS_PIE = ["#C9A84C", "#00BCD4", "#4CAF50", "#f44336", "#9C27B0", "#FF9800", "#2196F3", "#E91E63"];

function montantNum(p) { return Number(p.montant) || 0; }

export default function Finance() {
  const navigate = useNavigate();
  const [prestations, setPrestations] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      fetch("/api/prestations").then(r => r.json()),
      fetch("/api/depenses").then(r => r.json()),
    ]).then(([presta, deps]) => {
      setPrestations(Array.isArray(presta) ? presta : []);
      setCharges(Array.isArray(deps) ? deps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const prestationsAnnee = prestations.filter(p => p.date && new Date(p.date).getFullYear() === annee);

  // Stats résumé
  const caTotalToutesAnnees = prestations.reduce((acc, p) => acc + montantNum(p), 0);
  const caEncaisseToutesAnnees = prestations.filter(p => p.statut === "Évènement terminé").reduce((acc, p) => acc + montantNum(p), 0);
  const caTotal = prestationsAnnee.reduce((acc, p) => acc + montantNum(p), 0);
  const caEncaisse = prestationsAnnee.filter(p => p.statut === "Évènement terminé").reduce((acc, p) => acc + montantNum(p), 0);
  const totalCharges = charges.reduce((acc, c) => acc + (Number(c.montant) || 0), 0);
  const beneficeNet = caEncaisseToutesAnnees - totalCharges;

  // CA par mois
  const caParMois = MOIS_LABELS.map((label, i) => {
    const ca = prestationsAnnee.filter(p => new Date(p.date).getMonth() === i).reduce((acc, p) => acc + montantNum(p), 0);
    return { label, ca, benefice: ca };
  });

  // Répartition par type
  const parType = {};
  prestationsAnnee.forEach(p => {
    const t = p.type || "Autre";
    parType[t] = (parType[t] || 0) + montantNum(p);
  });
  const dataType = Object.entries(parType).map(([name, value]) => ({ name, value }));

  // ROI par machine
  const parMachine = {};
  prestationsAnnee.forEach(p => {
    const machines = p.formule ? p.formule.split(", ") : ["Non défini"];
    machines.forEach(m => { parMachine[m] = (parMachine[m] || 0) + montantNum(p); });
  });
  const dataMachine = Object.entries(parMachine).map(([name, value]) => ({ name: name.replace("Combiné (Photo Booth + Vidéo Booth 360°)", "Combiné"), value }));

  const tooltipStyle = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff" };

  const anneesDispos = [...new Set(prestations.filter(p => p.date).map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ← Retour
        </button>
        <img src="/logo.png" alt="M'event" style={{ height: 80, objectFit: "contain", mixBlendMode: "lighten" }} />
        <h1 style={{ margin: 0, fontSize: 20, color: "#C9A84C", marginLeft: 8 }}>Analyse Financière</h1>
      </div>

      {loading ? (
        <div style={{ color: "#888", textAlign: "center", marginTop: 80 }}>Chargement...</div>
      ) : (
        <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>

          {/* Résumé global toutes années */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "CA Total (toutes années)", value: caTotalToutesAnnees, color: "#C9A84C" },
              { label: "CA Encaissé (toutes années)", value: caEncaisseToutesAnnees, color: "#4CAF50" },
              { label: "Total Charges", value: totalCharges, color: "#f44336" },
              { label: "Bénéfice Net Global", value: beneficeNet, color: beneficeNet >= 0 ? "#4CAF50" : "#f44336" },
            ].map(item => (
              <div key={item.label} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ color: item.color, fontSize: 28, fontWeight: 700 }}>{item.value.toLocaleString("fr-FR")} €</div>
                <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Filtre année */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 13 }}>Année :</span>
            {anneesDispos.map(a => (
              <button key={a} onClick={() => setAnnee(a)} style={{
                background: annee === a ? "#C9A84C" : "#111",
                color: annee === a ? "#000" : "#aaa",
                border: `1px solid ${annee === a ? "#C9A84C" : "#2a2a2a"}`,
                borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontWeight: annee === a ? 700 : 400, fontSize: 13,
              }}>{a}</button>
            ))}
          </div>

          {/* Résumé année sélectionnée */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
            {[
              { label: `CA Total ${annee}`, value: caTotal, color: "#C9A84C" },
              { label: `CA Encaissé ${annee}`, value: caEncaisse, color: "#4CAF50" },
            ].map(item => (
              <div key={item.label} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px 24px" }}>
                <div style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value.toLocaleString("fr-FR")} €</div>
                <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* CA par mois */}
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>CA par mois — {annee}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caParMois}>
                <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v.toLocaleString("fr-FR")} €`} />
                <Legend />
                <Bar dataKey="ca" name="CA" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="charge" name="Charges" fill="#f44336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bénéfice net */}
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Bénéfice net par mois</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={caParMois}>
                <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v.toLocaleString("fr-FR")} €`} />
                <Line type="monotone" dataKey="benefice" name="Bénéfice" stroke="#4CAF50" strokeWidth={2} dot={{ fill: "#4CAF50" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Répartition par type */}
            <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Répartition par type</h3>
              {dataType.length === 0 ? (
                <div style={{ color: "#555", textAlign: "center", padding: 40 }}>Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={dataType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {dataType.map((_, i) => <Cell key={i} fill={COULEURS_PIE[i % COULEURS_PIE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v.toLocaleString("fr-FR")} €`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ROI par machine */}
            <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>ROI par machine</h3>
              {dataMachine.length === 0 ? (
                <div style={{ color: "#555", textAlign: "center", padding: 40 }}>Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dataMachine} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#aaa", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v.toLocaleString("fr-FR")} €`} />
                    <Bar dataKey="value" name="CA" fill="#00BCD4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charges & Dépenses */}
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", color: "#C9A84C", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Charges & Dépenses</h3>
            {charges.length === 0 ? (
              <div style={{ color: "#555", textAlign: "center", padding: "24px 0", fontSize: 14 }}>Aucune charge enregistrée</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {charges.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0a0a0a", borderRadius: 8 }}>
                    <span style={{ color: "#fff", fontSize: 14 }}>{c.label}</span>
                    <span style={{ color: "#f44336", fontWeight: 700 }}>-{Number(c.montant).toLocaleString("fr-FR")} €</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #2a2a2a", marginTop: 8, paddingTop: 12, textAlign: "right" }}>
                  <span style={{ color: "#555", fontSize: 13 }}>Total : </span>
                  <span style={{ color: "#f44336", fontWeight: 700, fontSize: 16 }}>{totalCharges.toLocaleString("fr-FR")} €</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
