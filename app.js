const SUPABASE_URL = 'https://qtxxgapxvlwapeaxhige.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-QM6PMs910v1BnCg46uAaw_mj2VQZuy';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const productosGrid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");

let productos = [];

init();

async function init() {

  await cargarProductos();

  searchInput.addEventListener("input", filtrarProductos);
}

async function cargarProductos() {

  productosGrid.innerHTML = `
    <p>Cargando productos...</p>
  `;

  try {

    const { data, error } = await supabaseClient
      .from("productos")
      .select("*")
      .order("nombre");

    if(error) throw error;

    productos = data;

    renderProductos(productos);

  } catch(err) {

    console.error(err);

    productosGrid.innerHTML = `
      <p>Error cargando productos</p>
    `;
  }
}

function renderProductos(lista) {

  productosGrid.innerHTML = "";

  if(lista.length === 0){

    productosGrid.innerHTML = `
      <p>No se encontraron productos</p>
    `;

    return;
  }

  lista.forEach(producto => {

    const stockClass =
      producto.cantidad <= 5
        ? "critico"
        : producto.cantidad <= 15
          ? "bajo"
          : "ok";

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <img
        src="${producto.imagen || 'https://placehold.co/400x300?text=DYSTECH'}"
        alt="${producto.nombre}"
      >

      <div class="card-body">

        <div class="codigo">
          ${producto.codigo}
        </div>

        <div class="nombre">
          ${producto.nombre}
        </div>

        <div class="precio">
          ${Number(producto.precio || 0).toLocaleString('es-CO', {
            style:'currency',
            currency:'COP',
            minimumFractionDigits:0
          })}
        </div>

        <div class="stock ${stockClass}">
          Stock: ${producto.cantidad || 0}
        </div>

      </div>
    `;

    productosGrid.appendChild(card);
  });
}

function filtrarProductos() {

  const texto = searchInput.value.toLowerCase();

  const filtrados = productos.filter(p => {

    return (
      p.nombre?.toLowerCase().includes(texto) ||
      p.codigo?.toLowerCase().includes(texto)
    );
  });

  renderProductos(filtrados);
}