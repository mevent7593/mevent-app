const DB_ID = process.env.NOTION_DB_MEMBRES;

async function queryDatabase(database_id) {
  const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const data = await queryDatabase(DB_ID);

  const membres = (data.results || []).map((page) => ({
    id: page.id,
    nom: page.properties["Nom"]?.title?.[0]?.plain_text ?? "",
    telephone: page.properties["Téléphone"]?.phone_number ?? "",
    email: page.properties["Email"]?.email ?? "",
    role: page.properties["Rôle"]?.select?.name ?? "",
  }));

  return res.status(200).json(membres);
}
