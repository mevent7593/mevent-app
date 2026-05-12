export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = (process.env.NOTION_DB_AVIS || "").trim();

  if (!DB_ID) return res.status(500).json({ error: "NOTION_DB_AVIS non configuré" });

  const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
  }).then(r => r.json());

  const props = dbInfo.properties || {};
  const findProp = (keywords) => Object.keys(props).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));

  const nomNomClient = findProp(["Nom"]);
  const nomNote = findProp(["Note"]);
  const nomCommentaire = findProp(["Commentaire"]);
  const nomType = findProp(["Type"]);
  const nomLieu = findProp(["Lieu"]);
  const nomValide = findProp(["Validé", "Valide"]);

  if (req.method === "GET") {
    const onlyNonValides = req.query.nonValides === "1";
    const filter = nomValide ? { property: nomValide, checkbox: { equals: !onlyNonValides ? true : false } } : undefined;

    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
        page_size: 100,
      }),
    });
    const data = await response.json();

    const avis = (data.results || []).map((page) => ({
      id: page.id,
      nom: page.properties[nomNomClient]?.title?.[0]?.plain_text ?? "",
      note: page.properties[nomNote]?.number ?? 0,
      commentaire: page.properties[nomCommentaire]?.rich_text?.map(r => r.plain_text).join("") ?? "",
      type: page.properties[nomType]?.select?.name ?? "",
      lieu: page.properties[nomLieu]?.rich_text?.[0]?.plain_text ?? "",
      valide: page.properties[nomValide]?.checkbox ?? false,
      date: page.created_time,
    }));

    return res.status(200).json(avis);
  }

  if (req.method === "POST") {
    const { nom, note, commentaire, type, lieu } = req.body;
    if (!nom || !note || !commentaire) return res.status(400).json({ error: "Champs manquants" });

    const properties = {
      [nomNomClient]: { title: [{ text: { content: nom } }] },
    };
    if (nomNote) properties[nomNote] = { number: Number(note) };
    if (nomCommentaire) properties[nomCommentaire] = { rich_text: [{ text: { content: commentaire } }] };
    if (nomType && type) properties[nomType] = { select: { name: type } };
    if (nomLieu && lieu) properties[nomLieu] = { rich_text: [{ text: { content: lieu } }] };
    if (nomValide) properties[nomValide] = { checkbox: false };

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

    const NOUVEL_AVIS_HOOK = process.env.NOUVEL_AVIS_HOOK || process.env.NOUVELLE_AVIS_HOOK;
    if (NOUVEL_AVIS_HOOK) {
      fetch(NOUVEL_AVIS_HOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          note,
          commentaire,
          type: type || "—",
          lieu: lieu || "—",
          lien_validation: "https://mevent-app.vercel.app/avis-validation",
        }),
      }).catch(() => {});
    }

    return res.status(201).json({ id: data.id });
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID manquant" });

    const properties = {};
    if (nomValide) properties[nomValide] = { checkbox: true };

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
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

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID manquant" });

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archived: true }),
    });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
