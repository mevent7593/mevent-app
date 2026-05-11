export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = (process.env.NOTION_DB_PRESTATIONS || "").trim();
  const WEBHOOK = process.env.RELANCE_HOOK || process.env.MAKE_RELANCE_AVIS_WEBHOOK;

  const dbInfo = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    headers: { "Authorization": `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
  }).then(r => r.json());

  const props = dbInfo.properties || {};
  const findProp = (keywords) => Object.keys(props).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));

  const nomStatut = findProp(["Statut"]);
  const nomDate = findProp(["Date"]);
  const nomEmail = findProp(["mail"]);
  const nomPrenom = findProp(["Prénom"]);
  const nomRelance = findProp(["Relance"]);

  if (req.method === "GET") {
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    const data = await queryRes.json();

    const limite = "2026-05-08";
    const eligibles = (data.results || [])
      .filter(p => {
        const statut = p.properties[nomStatut]?.select?.name;
        if (statut !== "Évènement terminé") return false;
        const date = p.properties[nomDate]?.date?.start;
        if (!date || date >= limite) return false;
        const email = p.properties[nomEmail]?.email;
        if (!email || !email.trim()) return false;
        const relanceEnvoyee = nomRelance ? p.properties[nomRelance]?.checkbox : false;
        if (relanceEnvoyee) return false;
        return true;
      })
      .map(p => ({
        id: p.id,
        nom: p.properties["Nom"]?.title?.[0]?.plain_text ?? "",
        prenom: p.properties[nomPrenom]?.rich_text?.[0]?.plain_text ?? "",
        email: p.properties[nomEmail]?.email ?? "",
        date: p.properties[nomDate]?.date?.start ?? null,
        lien_avis: `https://mevent-app.vercel.app/laisser-avis?prestation=${p.id}`,
      }));

    return res.status(200).json(eligibles);
  }

  if (req.method === "POST") {
    if (!WEBHOOK) return res.status(500).json({ error: "Webhook Make.com non configuré" });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "Aucun ID" });

    const queryRes = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    const data = await queryRes.json();
    const map = new Map((data.results || []).map(p => [p.id, p]));

    let envoyes = 0;
    let erreurs = [];

    for (const id of ids) {
      const page = map.get(id);
      if (!page) { erreurs.push({ id, erreur: "Prestation introuvable" }); continue; }

      const email = page.properties[nomEmail]?.email;
      const prenom = page.properties[nomPrenom]?.rich_text?.[0]?.plain_text || "";
      if (!email) { erreurs.push({ id, erreur: "Email manquant" }); continue; }

      try {
        await fetch(WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            prenom: prenom || "cher client",
            lien_avis: `https://mevent-app.vercel.app/laisser-avis?prestation=${id}`,
          }),
        });

        if (nomRelance) {
          await fetch(`https://api.notion.com/v1/pages/${id}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${TOKEN}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: { [nomRelance]: { checkbox: true } },
            }),
          });
        }
        envoyes++;
      } catch (e) {
        erreurs.push({ id, erreur: String(e) });
      }
    }

    return res.status(200).json({ envoyes, erreurs });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
