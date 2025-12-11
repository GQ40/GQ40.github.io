async function loadData() {
  const papers = await fetch('papers.json').then(r => r.json());
  return papers;
}

function populateFilters(papers) {
  const subjectSelect = document.getElementById('subjectFilter');
  const yearSelect = document.getElementById('yearFilter');

  subjectSelect.innerHTML = `<option value="all">All Subjects</option>`;
  const uniqueSubjects = [...new Set(papers.map(p => p.subject))];
  uniqueSubjects.forEach(sub => {
    subjectSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
  });

  yearSelect.innerHTML = `<option value="all">All Years</option>`;
  const years = [...new Set(papers.map(p => p.year))].sort((a,b)=>b-a);
  years.forEach(y => {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  });
}

function renderPapers(papers) {
  const container = document.getElementById('papersContainer');
  container.innerHTML = '';

  papers.forEach(p => {
    const item = document.createElement('div');
    item.className = 'paper-item';
    item.innerHTML = `
      <a href="viewer.html?file=${encodeURIComponent(p.file)}">
        ${p.title} (${p.year})
      </a>`;
    container.appendChild(item);
  });
}

function applyFilters(allPapers) {
  const subject = document.getElementById('subjectFilter').value;
  const year = document.getElementById('yearFilter').value;

  const filtered = allPapers.filter(p =>
    (subject === 'all' || p.subject === subject) &&
    (year === 'all' || p.year == year)
  );

  renderPapers(filtered);
}

window.onload = async () => {
  const papers = await loadData();

  populateFilters(papers);
  renderPapers(papers);

  document.getElementById('subjectFilter').addEventListener('change', () => applyFilters(papers));
  document.getElementById('yearFilter').addEventListener('change', () => applyFilters(papers));
};