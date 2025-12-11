function getFileFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('file');
}

window.onload = () => {
  const fileUrl = getFileFromQuery();
  const iframe = document.getElementById('pdfFrame');
  const downloadBtn = document.getElementById('downloadBtn');

  if (fileUrl) {
    iframe.src = `${fileUrl}#toolbar=1`;
    downloadBtn.href = fileUrl;
  } else {
    iframe.outerHTML = '<p>No PDF file specified.</p>';
  }
};