// -----------------------------
// Load Papers JSON
// -----------------------------
async function loadPapers() {
  try {
    const res = await fetch("papers.json");
    return await res.json();
  } catch (e) {
    console.error("Failed to load papers.json", e);
    return [];
  }
}

// -----------------------------
// Populate Filters
// -----------------------------
function populateFilters(papers) {
  const subjectFilter = document.getElementById("subjectFilter");
  const yearFilter = document.getElementById("yearFilter");

  // Subject list
  const subjects = [...new Set(papers.map(p => p.subject))].sort();
  subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = capitalize(sub);
    subjectFilter.appendChild(opt);
  });

  // Year list
  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearFilter.appendChild(opt);
  });
}

// -----------------------------
// Apply Filters
// -----------------------------
function applyFilters(papers) {
  const subject = document.getElementById("subjectFilter").value;
  const year = document.getElementById("yearFilter").value;
  const query = document.getElementById("searchBox").value.toLowerCase();

  const filtered = papers.filter(p => {
    return (
      (subject === "all" || p.subject === subject) &&
      (year === "all" || p.year.toString() === year) &&
      (p.title.toLowerCase().includes(query) ||
       p.subject.toLowerCase().includes(query))
    );
  });

  renderPapers(filtered);
}

// -----------------------------
// Render Paper List
// -----------------------------
function renderPapers(list) {
  const container = document.getElementById("paperList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="no-results">No papers found.</p>`;
    return;
  }

  list.forEach(p => {
    const item = document.createElement("div");
    item.className = "paper-item";

    item.innerHTML = `
      <div class="paper-details">
        <a class="paper-title" href="viewer.html?file=${encodeURIComponent(p.file)}">
          ${p.title}
        </a>
        <div class="paper-meta">
          ${capitalize(p.subject)} • ${p.year}
        </div>
      </div>

      <div class="paper-actions">
        <a class="button open" href="viewer.html?file=${encodeURIComponent(p.file)}">Open</a>
        <button class="button download" onclick="downloadFile('${p.file}')">Download</button>
      </div>
    `;

    container.appendChild(item);
  });
}

// -----------------------------
// iPhone-safe Download Function
// -----------------------------
function downloadFile(url) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop(); // filename
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => console.error("Download failed:", err));
}

// -----------------------------
// Capitalize Helper
// -----------------------------
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// -----------------------------
// Initialize
// -----------------------------
window.addEventListener("load", async () => {
  const papers = await loadPapers();
  populateFilters(papers);
  renderPapers(papers);

  document.getElementById("subjectFilter").addEventListener("change", () => applyFilters(papers));
  document.getElementById("yearFilter").addEventListener("change", () => applyFilters(papers));
  document.getElementById("searchBox").addEventListener("input", () => applyFilters(papers));
});
