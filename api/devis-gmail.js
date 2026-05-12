export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { from, subject, body, date } = req.body;

  const sujet = (subject || "").toLowerCase().trim();
  const expediteur = (from || "").toLowerCase();

  const MOTS_CLES = ["devis", "reservation", "réservation", "demande de location", "demande de devis", "demande de réservation"];
  const sujetValide = MOTS_CLES.some(mot => sujet.includes(mot));
  if (!sujetValide) return res.status(200).json({ ignore: "Sujet sans mot-clé" });

  if (/^(re|tr|fwd|fw)\s*:/i.test((subject || "").trim())) {
    return res.status(200).json({ ignore: "Réponse ou transfert" });
  }

  const DOMAINES_EXCLUS = ["notion.so", "notion.com", "formspree", "noreply", "no-reply", "mailchimp", "sendgrid", "hubspot", "linkedin", "facebook", "instagram", "twitter", "youtube", "google.com", "stripe.com", "vercel.com", "make.com"];
  if (DOMAINES_EXCLUS.some(d => expediteur.includes(d))) {
    return res.status(200).json({ ignore: "Expéditeur exclu" });
  }

  const nomMatch = from?.match(/^([^<]+)</);
  const nom = nomMatch ? nomMatch[1].trim() : (from || "Inconnu");
  const email = from?.match(/<(.+)>/)?.[1] || from || "";

  const TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = (process.env.NOTION_DB_PRESTATIONS || "").trim();

  const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
  }).then(r => r.json());

  const props = dbInfo.properties || {};
  const findProp = (keywords) => Object.keys(props).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));

  const nomStatut = findProp(["Statut"]);
  const nomEmail = findProp(["mail"]);
  const nomLieu = findProp(["Lieu"]);

  const properties = {
    "Nom": { title: [{ text: { content: nom } }] },
  };
  if (nomStatut) properties[nomStatut] = { select: { name: "Devis" } };
  if (nomEmail && email) properties[nomEmail] = { email };
  if (nomLieu && subject) properties[nomLieu] = { rich_text: [{ text: { content: subject } }] };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: DB_ID }, properties }),
  });

  const data = await response.json();
  if (data.object === "error") return res.status(500).json({ error: data.message });
  return res.status(201).json({ id: data.id });
}
