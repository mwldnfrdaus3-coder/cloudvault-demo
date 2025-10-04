// Upload File
const form = document.getElementById('form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = document.getElementById('file').files[0];
  if (!f) return alert('Pick a file');
  const fd = new FormData();
  fd.append('file', f);
  const r = await fetch('/upload', { method: 'POST', body: fd });
  alert(JSON.stringify(await r.json()));
});

// Simpan Teks
document.getElementById('textForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const filename = document.getElementById('textFilename').value
  const content = document.getElementById('textContent').value

  const res = await fetch('/save-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content })
  })

  const result = await res.json()
  alert(result.message || result.error)
})

// List File
document.getElementById('list').addEventListener('click', async () => {
  const r = await fetch('/files');
  const j = await r.json();
  const ul = document.getElementById('files'); ul.innerHTML = '';
  j.files.forEach(f => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/files/${encodeURIComponent(f.filename)}`;
    a.textContent = `${f.filename} (${Math.round(f.size/1024)} KB)`;
    a.target = '_blank';
    li.appendChild(a);

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.style.marginLeft = '8px';
    del.onclick = async () => {
      const resp = await fetch(`/files/${encodeURIComponent(f.filename)}`, { method: 'DELETE' });
      alert((await resp.json()).message);
    };
    li.appendChild(del);

    ul.appendChild(li);
  });
});