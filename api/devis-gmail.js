export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { from, subject, body, date } = req.body;

  // Extraire le nom depuis l'adresse mail (ex: "Marie Dupont <marie@gmail.com>" → "Marie Dupont")
  const nomMatch = from?.match(/^([^<]+)</);
  const nom = nomMatch ? nomMatch[1].trim() : (from || "Inconnu");

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DB_PRESTATIONS },
      properties: {
        "Nom": { title: [{ text: { content: nom } }] },
        "E-mail": { email: from?.match(/<(.+)>/)?.[1] || from || "" },
        "Statut de l'évènement": { select: { name: "Devis" } },
        "Lieu": { rich_text: [{ text: { content: subject || "" } }] },
      },
    }),
  });

  const data = await response.json();
  return res.status(201).json({ id: data.id });
}
