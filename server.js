const express = require("express");
const cheerio = require("cheerio");
const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_HOSTS = new Set(["example.com", "www.example.com"]);
app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 150) : "";
  if (!q) return res.status(400).json({ error: "Enter a search term." });
  try {
    const url = new URL("https://en.wikipedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "query", list: "search", srsearch: q,
      srlimit: "10", format: "json", utf8: "1"
    }).toString();
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "NebulaSearch/1.0 (educational search demo)" }
    });
    if (!response.ok) throw new Error("Search service unavailable.");
    const data = await response.json();
    res.json({ results: (data.query?.search || []).map(item => ({
      title: item.title,
      description: cheerio.load(item.snippet || "").text(),
      url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(item.title.replace(/ /g, "_"))
    })) });
  } catch (err) { res.status(502).json({ error: "Search unavailable. Try again shortly." }); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    if (typeof req.query.url !== "string") return res.status(400).json({error:"Enter a URL."});
    const target = new URL(req.query.url);
    if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname) || target.port || target.username || target.password) {
      return res.status(403).json({error:"This website is not on the approved list."});
    }
    const response = await fetch(target, {redirect:"manual", signal:AbortSignal.timeout(8000)});
    if (response.status >= 300 && response.status < 400) throw new Error("Redirects are not supported.");
    if (!response.ok) throw new Error("Website returned " + response.status);
    if (!(response.headers.get("content-type") || "").includes("text/html")) throw new Error("HTML only.");
    const html = await response.text();
    if (html.length > 1000000) throw new Error("Page too large.");
    const $ = cheerio.load(html);
    $("script,style,iframe,object,embed,form").remove();
    res.json({title:$("title").text(),content:$("body").text().replace(/\s+/g," ").trim().slice(0,20000)});
  } catch (error) { res.status(400).json({error:error.message}); }
});
app.listen(PORT, () => console.log("Nebula running on port " + PORT));
