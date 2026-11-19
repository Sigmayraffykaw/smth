const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const result = document.getElementById("result");
document.getElementById("clearBtn").addEventListener("click", () => {
  input.value = "";
  result.replaceChildren();
  input.focus();
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  const isURL = !query.includes(" ") &&
    (/^https?:\/\//i.test(query) || /^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(query));
  result.textContent = isURL ? "Loading website preview..." : "Searching Nebula...";
  try {
    const url = isURL
      ? "/api/proxy?url=" + encodeURIComponent(/^https?:\/\//i.test(query) ? query : "https://" + query)
      : "/api/search?q=" + encodeURIComponent(query);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    result.replaceChildren();
    if (isURL) {
      const heading = document.createElement("h2");
      heading.textContent = data.title || "Website Preview";
      const content = document.createElement("p");
      content.textContent = data.content || "No text found.";
      result.append(heading, content);
      return;
    }
    const heading = document.createElement("h2");
    heading.textContent = "Search results for " + query;
    result.append(heading);
    if (!data.results.length) {
      const empty = document.createElement("p");
      empty.textContent = "No results found.";
      result.append(empty);
    }
    for (const item of data.results) {
      const article = document.createElement("article");
      article.style.marginBottom = "24px";
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.title;
      const desc = document.createElement("p");
      desc.textContent = item.description;
      article.append(link, desc);
      result.append(article);
    }
    const note = document.createElement("small");
    note.textContent = "Results provided by Wikipedia. Links open articles in a new tab.";
    result.append(note);
  } catch (error) {
    result.textContent = error.message;
  }
});
