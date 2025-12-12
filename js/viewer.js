/* viewer.js
   Loads the PDF file referenced by ?file=... .
   Fetches the PDF as a blob and creates a blob: URL for the iframe and download button.
   This method avoids mobile Drive preview issues and cross-origin display problems when files are on the same origin.
*/

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setViewerTitle(text) {
  const t = document.getElementById('viewerTitle');
  if (t) t.textContent = text || 'Viewing PDF';
}

async function loadPdfAsBlob(fileUrl) {
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error('Failed to fetch PDF: ' + resp.status);
    const blob = await resp.blob();
    return blob;
  } catch (err) {
    throw err;
  }
}

window.addEventListener('load', async () => {
  const file = getQueryParam('file');
  const title = getQueryParam('title') || '';
  const iframe = document.getElementById('pdfFrame');
  const downloadBtn = document.getElementById('downloadBtn');
  const openNewTabBtn = document.getElementById('openNewTabBtn');
  const errorBox = document.getElementById('errorBox');

  if (!file) {
    errorBox.hidden = false;
    errorBox.textContent = 'No file specified.';
    return;
  }

  setViewerTitle(title || decodeURIComponent(file.split('/').pop()));

  // Try to fetch as blob (works reliably on mobile)
  try {
    // fetch the PDF as blob (small files recommended)
    const blob = await loadPdfAsBlob(file);
    const blobUrl = URL.createObjectURL(blob);

    iframe.src = blobUrl;
    // enable download via blob (keeps correct filename)
    const filename = file.split('/').pop();
    downloadBtn.href = blobUrl;
    downloadBtn.setAttribute('download', filename);

    // also allow opening direct raw file url in new tab
    openNewTabBtn.href = file;

    // revoke blob when unload to release memory
    window.addEventListener('unload', () => {
      try { URL.revokeObjectURL(blobUrl); } catch(e) {}
    });
  } catch (err) {
    console.error('viewer error', err);
    // fallback: set iframe to direct url (may or may not work depending on browser)
    iframe.src = file;
    downloadBtn.href = file;
    openNewTabBtn.href = file;

    errorBox.hidden = false;
    errorBox.innerHTML = `Could not fetch PDF as blob. Attempting to open direct file. If PDF does not display, try \"Open in new tab\". <br/><small>${err.message}</small>`;
  }
});
