export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { prestationId, statut } = req.body;
  const TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = (process.env.NOTION_DB_PRESTATIONS || "").trim();

  const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
  }).then(r => r.json());

  const props = dbInfo.properties || {};
  const nomStatut = Object.keys(props).find(k => k.toLowerCase().includes("statut"));

  const properties = {};
  if (nomStatut) properties[nomStatut] = { select: { name: statut } };

  await fetch(`https://api.notion.com/v1/pages/${prestationId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  return res.status(200).json({ success: true });
}
