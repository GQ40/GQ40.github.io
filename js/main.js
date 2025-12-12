/* -------------------------------
   Main JS for Question Paper Site
   Google-style UI + iPhone-safe download
-------------------------------- */

// Load JSON data
async function loadPapers() {
  const response = await fetch("papers.json");
  return await response.json();
}

async function loadSubjects() {
  const response = await fetch("subjects.json");
  return await response.json();
}

async function loadYears(papers) {
  return [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
}

/* -------------------------------
   Initial Page Load
-------------------------------- */
window.addEventListener("load", async () => {
  const papers = await loadPapers();
  const subjects = await loadSubjects();
  const years = await loadYears(papers);

  populateSubjectFilter(subjects);
  populateYearFilter(years);
  renderPapers(papers);

  // Event listeners
  document.getElementById("subjectFilter").addEventListener("change", () => applyFilters(papers));
  document.getElementById("yearFilter").addEventListener("change", () => applyFilters(papers));
  document.getElementById("searchBox").addEventListener("input", () => applyFilters(papers));
});

/* -------------------------------
   Filters
-------------------------------- */
function populateSubjectFilter(subjects) {
  const select = document.getElementById("subjectFilter");
  select.innerHTML = `<option value="all">All Subjects</option>`;

  subjects.forEach(sub => {
    select.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
  });
}

function populateYearFilter(years) {
  const select = document.getElementById("yearFilter");
  select.innerHTML = `<option value="all">All Years</option>`;

  years.forEach(year => {
    select.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

function applyFilters(allPapers) {
  const subjectValue = document.getElementById("subjectFilter").value;
  const yearValue = document.getElementById("yearFilter").value;
  const searchQuery = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allPapers.filter(paper => {
    const matchesSubject = subjectValue === "all" || paper.subject === subjectValue;
    const matchesYear = yearValue === "all" || paper.year == yearValue;
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery);
    return matchesSubject && matchesYear && matchesSearch;
  });

  renderPapers(filtered);
}

/* -------------------------------
   Render Papers (Google UI Style)
-------------------------------- */
function renderPapers(papers) {
  const container = document.getElementById("paperList");
  container.innerHTML = "";

  if (papers.length === 0) {
    container.innerHTML = `<p class="no-results">No matching papers found.</p>`;
    return;
  }

  papers.forEach(p => {
    const card = document.createElement("div");
    card.className = "paper-card";

    card.innerHTML = `
      <div class="paper-info">
        <a class="paper-title" href="viewer.html?file=${encodeURIComponent(p.file)}">
          ${p.title}
        </a>
        <div class="paper-meta">${capitalize(p.subject)} • ${p.year}</div>
      </div>

      <div class="paper-actions">
        <a class="btn open-btn" 
           href="viewer.html?file=${encodeURIComponent(p.file)}">
          Open
        </a>

        <button class="btn download-btn" onclick="downloadFile('${p.file}')">
          Download
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

/* -------------------------------
   iPhone-Safe PDF Download Fix
-------------------------------- */
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

/* -------------------------------
   Helpers
-------------------------------- */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
