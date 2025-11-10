const CATEGORIAS = ["Entrada","Piedad","Aspersión","Gloria","Aleluya","Ofertorio","Santo","Cordero","Comunión","Salida","Animación"];
let db;

document.addEventListener('DOMContentLoaded', () => {
  initDB().then(() => {
    cargarCantos().then(renderCategorias);
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
});

function initDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open('CantoralDB', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cantos')) {
        db.createObjectStore('cantos', { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };
  });
}

function cargarCantos() {
  return new Promise((resolve) => {
    const tx = db.transaction('cantos', 'readonly');
    const req = tx.objectStore('cantos').getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

function renderCategorias(cantos) {
  const el = document.getElementById('contenido');
  el.innerHTML = `<h2 style="color:#6b1c23;margin:1rem 0;">Categorías</h2>` + 
    CATEGORIAS.map(cat =>
      `<button class="btn" onclick="mostrarCantos('${cat}')">${cat}</button>`
    ).join('');
}

window.mostrarCantos = async function(cat) {
  const cantos = await cargarCantos();
  const filtrados = cantos.filter(c => c.categoria === cat);
  const el = document.getElementById('contenido');
  el.innerHTML = `
    <button class="btn" style="background:#888;" onclick="cargarCantos().then(renderCategorias)">← Volver</button>
    <h2 style="color:#6b1c23">${cat}</h2>
  `;
  if (filtrados.length === 0) {
    el.innerHTML += `<p>No hay cantos en esta categoría.</p>`;
  } else {
    filtrados.forEach(c => {
      el.innerHTML += `
        <div class="btn" style="background:#f8f5f0;color:#000;text-align:left;" onclick="mostrarLetra(${JSON.stringify(c)})">
          ${c.titulo}
        </div>
      `;
    });
  }
};

window.mostrarLetra = function(canto) {
  const el = document.getElementById('contenido');
  el.innerHTML = `
    <button class="btn" style="background:#888;" onclick="mostrarCantos('${canto.categoria}')">← Volver</button>
    <h2 style="color:#6b1c23">${canto.titulo}</h2>
    <pre style="background:#fcfaf6;padding:1rem;border-radius:8px;white-space:pre-wrap;">${canto.letra}</pre>
  `;
};

function mostrarToast(mensaje) {
  const t = document.getElementById('toast');
  t.textContent = mensaje;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}