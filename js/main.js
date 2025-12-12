/* main.js
   Responsible for loading papers.json, populating filters and rendering results.
   Uses safe relative paths (./) so it works from GitHub Pages root.
*/

async function loadPapers() {
  try {
    const res = await fetch('./papers.json', {cache: "no-cache"});
    if (!res.ok) throw new Error('Failed to load papers.json (' + res.status + ')');
    const papers = await res.json();
    return papers;
  } catch (err) {
    console.error('loadPapers error', err);
    document.getElementById('papersContainer').innerHTML =
      `<div class="error">Could not load papers data. Check console for details.</div>`;
    return [];
  }
}

function capitalizeWords(s) {
  return s.replace(/(^|\-|\s)\w/g, c => c.toUpperCase());
}

function populateFilters(papers) {
  const subjectSelect = document.getElementById('subjectFilter');
  const yearSelect = document.getElementById('yearFilter');

  // build unique sorted lists
  const subjects = [...new Set(papers.map(p => p.subject))].sort();
  const years = [...new Set(papers.map(p => p.year))].sort((a,b)=>b-a);

  subjectSelect.innerHTML = `<option value="all">All Subjects</option>`;
  subjects.forEach(s => {
    subjectSelect.innerHTML += `<option value="${s}">${capitalizeWords(s)}</option>`;
  });

  yearSelect.innerHTML = `<option value="all">All Years</option>`;
  years.forEach(y => {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  });
}

function renderPapers(papers) {
  const container = document.getElementById('papersContainer');
  container.innerHTML = '';

  if (papers.length === 0) {
    container.innerHTML = `<div class="error">No papers found for the selected filters.</div>`;
    return;
  }

  papers.forEach(p => {
    const div = document.createElement('article');
    div.className = 'paper-item';

    const meta = document.createElement('div');
    meta.className = 'paper-meta';
    const title = document.createElement('a');
    title.className = 'paper-title';
    title.href = `viewer.html?file=${encodeURIComponent(p.file)}&title=${encodeURIComponent(p.title)}`;
    title.textContent = `${p.title} (${p.year})`;
    title.setAttribute('aria-label', p.title);

    const sub = document.createElement('div');
    sub.className = 'paper-sub';
    sub.textContent = `${capitalizeWords(p.subject)} • ${p.year}`;

    meta.appendChild(title);
    meta.appendChild(sub);

    // right-side quick actions (open new tab + download)
    const actions = document.createElement('div');
    const openNew = document.createElement('a');
    openNew.className = 'button open-new';
    openNew.href = p.file;
    openNew.target = '_blank';
    openNew.rel = 'noopener';
    openNew.textContent = 'Open';

    const dl = document.createElement('a');
    dl.className = 'button download';
    dl.href = p.file;
    dl.download = '';
    dl.textContent = 'Download';

    actions.appendChild(openNew);
    actions.appendChild(dl);

    div.appendChild(meta);
    div.appendChild(actions);

    container.appendChild(div);
  });
}

function applyFilters(allPapers) {
  const subject = document.getElementById('subjectFilter').value;
  const year = document.getElementById('yearFilter').value;
  const search = document.getElementById('searchBox').value.trim().toLowerCase();

  const filtered = allPapers.filter(p => {
    const matchesSubject = (subject === 'all' || p.subject === subject);
    const matchesYear = (year === 'all' || String(p.year) === String(year));
    const text = (p.title + ' ' + p.subject + ' ' + p.year).toLowerCase();
    const matchesSearch = search.length === 0 || text.includes(search);
    return matchesSubject && matchesYear && matchesSearch;
  });

  renderPapers(filtered);
}

window.addEventListener('load', async () => {
  const papers = await loadPapers();
  populateFilters(papers);
  renderPapers(papers);

  document.getElementById('subjectFilter').addEventListener('change', () => applyFilters(papers));
  document.getElementById('yearFilter').addEventListener('change', () => applyFilters(papers));
  document.getElementById('searchBox').addEventListener('input', () => applyFilters(papers));
});
