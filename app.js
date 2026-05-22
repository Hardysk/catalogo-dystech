/* ========================================
   DYSTECH Catálogo – Application Logic
   ======================================== */

// ─── Supabase Config ───
const SUPABASE_URL = 'https://qtxxgapxvlwapeaxhige.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-QM6PMs910v1BnCg46uAaw_mj2VQZuy';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ─── WhatsApp ───
const WHATSAPP_NUMBER = '573503411501';

// ─── DOM Elements ───

// Productos
const productosGrid = document.getElementById('productosGrid');
const productCount  = document.getElementById('productCount');

// Search
const searchInput = document.getElementById('searchInput');

// Filtros
const filtroLista        = document.getElementById('filtroLista');
const filtroCategoria    = document.getElementById('filtroCategoria');
const filtroSubcategoria = document.getElementById('filtroSubcategoria');
const filtrosActivos     = document.getElementById('filtrosActivos');

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalImg     = document.getElementById('modalImg');

const modalCodigo  = document.getElementById('modalCodigo');
const modalNombre  = document.getElementById('modalNombre');
const modalEspec   = document.getElementById('modalEspecificacion');

const modalMeta    = document.getElementById('modalMeta');
const modalPrecio  = document.getElementById('modalPrecio');
const modalStock   = document.getElementById('modalStock');

const qtyInput     = document.getElementById('qtyInput');
const qtyMinus     = document.getElementById('qtyMinus');
const qtyPlus      = document.getElementById('qtyPlus');

const addToCartBtn = document.getElementById('addToCartBtn');

// Cart
const cartBtn         = document.getElementById('cartBtn');
const cartBadge       = document.getElementById('cartBadge');
const cartOverlay     = document.getElementById('cartOverlay');
const cartDrawer      = document.getElementById('cartDrawer');
const cartDrawerClose = document.getElementById('cartDrawerClose');

const cartItemsCont   = document.getElementById('cartItemsContainer');
const cartEmpty       = document.getElementById('cartEmpty');
const cartFooter      = document.getElementById('cartFooter');
const cartTotal       = document.getElementById('cartTotal');

const checkoutBtn     = document.getElementById('checkoutBtn');

// Toast
const toast    = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Logo
const logoLink = document.getElementById('logoLink');

// ─── State ───

let productos      = [];
let productoActual = null;

let carrito = JSON.parse(
  localStorage.getItem('dystech_carrito') || '[]'
);

// ─── Init ───

init();

async function init() {

  await cargarProductos();

  construirFiltros();

  actualizarBadgeCarrito();

  bindEvents();
}

// ─── Cargar Productos ───

async function cargarProductos() {

  productosGrid.innerHTML = `
    <div class="state-msg">
      <div class="spinner"></div>
      <p>Cargando productos…</p>
    </div>
  `;

  try {

    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .order('nombre');

    if (error) throw error;

    productos = data || [];

    renderProductos(productos);

  } catch (err) {

    console.error('Error cargando productos:', err);

    productosGrid.innerHTML = `
      <div class="state-msg">
        <p>⚠️ Error cargando productos</p>
      </div>
    `;
  }
}

// ─── Construir Filtros ───

function construirFiltros() {

  const listas = [
    ...new Set(
      productos
        .map(p => p.lista)
        .filter(Boolean)
    )
  ];

  listas.sort().forEach(lista => {

    filtroLista.innerHTML += `
      <option value="${lista}">
        ${lista}
      </option>
    `;
  });

  actualizarCategorias();
}

// ─── Categorías ───

function actualizarCategorias() {

  filtroCategoria.innerHTML =
    '<option value="">Todas las categorías</option>';

  filtroSubcategoria.innerHTML =
    '<option value="">Todas las subcategorías</option>';

  const categorias = [

    ...new Set(

      productos

        .filter(p =>

          !filtroLista.value ||

          p.lista === filtroLista.value
        )

        .map(p => p.categoria)

        .filter(Boolean)

    )

  ];

  categorias.sort().forEach(cat => {

    filtroCategoria.innerHTML += `
      <option value="${cat}">
        ${cat}
      </option>
    `;
  });

  actualizarSubcategorias();
}

// ─── Subcategorías ───

function actualizarSubcategorias() {

  filtroSubcategoria.innerHTML =
    '<option value="">Todas las subcategorías</option>';

  const subs = [

    ...new Set(

      productos

        .filter(p =>

          (
            !filtroLista.value ||

            p.lista === filtroLista.value
          )

          &&

          (
            !filtroCategoria.value ||

            p.categoria === filtroCategoria.value
          )

        )

        .map(p => p.sub_categoria)

        .filter(Boolean)

    )

  ];

  subs.sort().forEach(sub => {

    filtroSubcategoria.innerHTML += `
      <option value="${sub}">
        ${sub}
      </option>
    `;
  });
}

// ─── Filtrar Productos ───

function filtrarProductos() {

  let filtrados = [...productos];

  // Lista
  if (filtroLista.value) {

    filtrados = filtrados.filter(
      p => p.lista === filtroLista.value
    );
  }

  // Categoría
  if (filtroCategoria.value) {

    filtrados = filtrados.filter(
      p => p.categoria === filtroCategoria.value
    );
  }

  // Subcategoría
  if (filtroSubcategoria.value) {

    filtrados = filtrados.filter(
      p => p.sub_categoria === filtroSubcategoria.value
    );
  }

  // Search
  const texto = searchInput.value
    .toLowerCase()
    .trim();

  if (texto) {

    filtrados = filtrados.filter(p =>

      (p.nombre || '')
        .toLowerCase()
        .includes(texto)

      ||

      (p.codigo || '')
        .toLowerCase()
        .includes(texto)

      ||

      (p.marca || '')
        .toLowerCase()
        .includes(texto)
    );
  }

  renderFiltrosActivos();

  renderProductos(filtrados);
}

// ─── Filtros Activos ───

function renderFiltrosActivos() {

  filtrosActivos.innerHTML = '';

  const filtros = [
    filtroLista.value,
    filtroCategoria.value,
    filtroSubcategoria.value
  ].filter(Boolean);

  filtros.forEach(filtro => {

    const chip = document.createElement('div');

    chip.className = 'filtro-chip';

    chip.innerHTML = `
      ${filtro}
      <span>✕</span>
    `;

    chip.addEventListener('click', () => {

      if (filtro === filtroLista.value) {

        filtroLista.value = '';
        filtroCategoria.value = '';
        filtroSubcategoria.value = '';
      }

      else if (filtro === filtroCategoria.value) {

        filtroCategoria.value = '';
        filtroSubcategoria.value = '';
      }

      else if (filtro === filtroSubcategoria.value) {

        filtroSubcategoria.value = '';
      }

      actualizarCategorias();

      filtrarProductos();
    });

    filtrosActivos.appendChild(chip);
  });
}

// ─── Render Productos ───

function renderProductos(lista) {

  productosGrid.innerHTML = '';

  productCount.textContent =
    `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;

  if (lista.length === 0) {

    productosGrid.innerHTML = `
      <div class="state-msg">
        <p>No se encontraron productos</p>
      </div>
    `;

    return;
  }

  lista.forEach(producto => {

    const stockClass =
      producto.cantidad <= 5
        ? 'critico'
        : producto.cantidad <= 15
          ? 'bajo'
          : 'ok';

    const stockLabel =
      producto.cantidad <= 5
        ? 'Pocas unidades'
        : producto.cantidad <= 15
          ? 'Stock limitado'
          : `Stock: ${producto.cantidad || 0}`;

    const card = document.createElement('div');

    card.className = 'card';

    card.innerHTML = `

      <div class="card-img-wrapper">

        <img
          class="card-img"
          
          src="${obtenerImagenProducto(producto)}"
          
          alt="${producto.nombre || ''}"
          loading="lazy"

          onerror="
            this.onerror=null;
            this.src='https://placehold.co/400x300/e2e8f0/94a3b8?text=' + encodeURIComponent('${producto.nombre || 'DYSTECH'}');
          "
        >

        <span class="stock-tag ${stockClass}">
          ${stockLabel}
        </span>

      </div>

      <div class="card-body">

        <div class="card-code">
          ${producto.codigo || ''}
        </div>

        <div class="card-name">
          ${producto.nombre || ''}
        </div>

        <div class="card-bottom">

          <span class="card-price">
            ${formatPrecio(producto.precio)}
          </span>

          <span class="card-view">
            Ver detalle →
          </span>

        </div>

      </div>
    `;

    card.addEventListener(
      'click',
      () => abrirModal(producto)
    );

    productosGrid.appendChild(card);
  });
}

// ─── Modal Producto ───

function abrirModal(producto) {

  productoActual = producto;

  modalImg.src = obtenerImagenProducto(producto);

  modalImg.onerror = () => {

    modalImg.onerror = null;

    modalImg.src =
      `https://placehold.co/500x400/e2e8f0/94a3b8?text=${encodeURIComponent(producto.nombre || 'DYSTECH')}`;
  };
   // producto.imagen ||
    //`https://placehold.co/500x400/e2e8f0/94a3b8?text=${encodeURIComponent(producto.nombre || 'DYSTECH')}`;

  modalCodigo.textContent =
    producto.codigo || '';

  modalNombre.textContent =
    producto.nombre || '';

  modalEspec.textContent =
    producto.especificacion || '';

  modalEspec.style.display =
    producto.especificacion
      ? ''
      : 'none';

  modalMeta.innerHTML = '';

  if (producto.marca) {

    modalMeta.innerHTML += `
      <span class="meta-chip">
        <strong>Marca:</strong>
        ${producto.marca}
      </span>
    `;
  }

  if (producto.modelo) {

    modalMeta.innerHTML += `
      <span class="meta-chip">
        <strong>Modelo:</strong>
        ${producto.modelo}
      </span>
    `;
  }

  if (producto.estado) {

    modalMeta.innerHTML += `
      <span class="meta-chip">
        <strong>Estado:</strong>
        ${producto.estado}
      </span>
    `;
  }

  modalPrecio.textContent =
    formatPrecio(producto.precio);

  modalStock.textContent =
    `Stock: ${producto.cantidad || 0}`;

  qtyInput.value = 1;

  qtyInput.max = producto.cantidad || 1;

  modalOverlay.classList.add('open');

  document.body.style.overflow = 'hidden';
}

function cerrarModal() {

  modalOverlay.classList.remove('open');

  document.body.style.overflow = '';

  productoActual = null;
}

// ─── Carrito ───

function agregarAlCarrito() {

  if (!productoActual) return;

  const cantidad =
    parseInt(qtyInput.value) || 1;

  const existente = carrito.find(
    item => item.id === productoActual.id
  );

  if (existente) {

    existente.cantidad += cantidad;

  } else {

    carrito.push({

      id: productoActual.id,

      codigo: productoActual.codigo,

      nombre: productoActual.nombre,

      precio: productoActual.precio || 0,

      cantidad: cantidad,

      maxStock: productoActual.cantidad || 999,

      //imagen: productoActual.imagen || ''
      imagen: obtenerImagenProducto(productoActual)
    });
  }

  guardarCarrito();

  actualizarBadgeCarrito();

  cerrarModal();

  mostrarToast(
    `"${productoActual.nombre}" agregado al carrito`
  );
}

function guardarCarrito() {

  localStorage.setItem(
    'dystech_carrito',
    JSON.stringify(carrito)
  );
}

function actualizarBadgeCarrito() {

  const total = carrito.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  cartBadge.textContent = total;

  cartBadge.style.display =
    total > 0 ? '' : 'none';
}

// ─── Render Carrito ───

function renderCarrito() {

  cartItemsCont.querySelectorAll('.cart-item')
    .forEach(el => el.remove());

  if (carrito.length === 0) {

    cartEmpty.style.display = '';

    cartFooter.style.display = 'none';

    return;
  }

  cartEmpty.style.display = 'none';

  cartFooter.style.display = '';

  let totalGeneral = 0;

  carrito.forEach((item, index) => {

    const subtotal =
      item.precio * item.cantidad;

    totalGeneral += subtotal;

    const div = document.createElement('div');

    div.className = 'cart-item';

    div.innerHTML = `
      <img
        class="cart-item-img"
        src="${item.imagen || obtenerImagenProducto(item)}"
        
        onerror="
          this.onerror=null;
          this.src='https://placehold.co/80x80/e2e8f0/94a3b8?text=IMG';
        "

      >

      <div class="cart-item-info">

        <div class="cart-item-name">
          ${item.nombre}
        </div>

        <div class="cart-item-price">
          ${formatPrecio(item.precio)} c/u
        </div>

        <div class="cart-item-controls">

          <div class="cart-item-qty">

            <button data-index="${index}" data-delta="-1">
              −
            </button>

            <span>${item.cantidad}</span>

            <button data-index="${index}" data-delta="1">
              +
            </button>

          </div>

          <span class="cart-item-subtotal">
            ${formatPrecio(subtotal)}
          </span>

        </div>

      </div>

      <button
        class="cart-item-remove"
        data-remove="${index}"
      >
        ✕
      </button>
    `;

    cartItemsCont.appendChild(div);
  });

  cartTotal.textContent =
    formatPrecio(totalGeneral);
}

// ─── Abrir/Cerrar Carrito ───

function abrirCarrito() {

  renderCarrito();

  cartOverlay.classList.add('open');

  cartDrawer.classList.add('open');

  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {

  cartOverlay.classList.remove('open');

  cartDrawer.classList.remove('open');

  document.body.style.overflow = '';
}

// ─── WhatsApp ───

function comprarWhatsApp() {

  if (carrito.length === 0) return;

  let mensaje = '📦 *Pedido DYSTECH*\n\n';

  let total = 0;

  carrito.forEach((item, i) => {

    const subtotal =
      item.precio * item.cantidad;

    total += subtotal;

    mensaje += `${i + 1}. *${item.nombre}*\n`;

    mensaje += `Código: ${item.codigo}\n`;

    mensaje += `Cantidad: ${item.cantidad}\n`;

    mensaje += `Subtotal: ${formatPrecio(subtotal)}\n\n`;
  });

  mensaje += `💰 *Total: ${formatPrecio(total)}*`;

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
}

// ─── Obtener Imagen Producto ───

// ─── Obtener Imagen Producto ───

function obtenerImagenProducto(producto) {

  // Si ya tiene imagen en BD
  if (producto.imagen) {
    return producto.imagen;
  }

  // Intentar imagen local por código
  return `/Imagenes/${producto.codigo}.jpg`;
}

// ─── Helpers ───

function formatPrecio(valor) {

  return Number(valor || 0).toLocaleString(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }
  );
}

let toastTimeout;

function mostrarToast(msg) {

  clearTimeout(toastTimeout);

  toastMsg.textContent = msg;

  toast.classList.add('show');

  toastTimeout = setTimeout(() => {

    toast.classList.remove('show');

  }, 2800);
}

// ─── Eventos ───

function bindEvents() {

  // Search
  searchInput.addEventListener(
    'input',
    filtrarProductos
  );

  // Filtros
  filtroLista.addEventListener('change', () => {

    actualizarCategorias();

    filtrarProductos();
  });

  filtroCategoria.addEventListener('change', () => {

    actualizarSubcategorias();

    filtrarProductos();
  });

  filtroSubcategoria.addEventListener(
    'change',
    filtrarProductos
  );

  // Modal
  modalClose.addEventListener(
    'click',
    cerrarModal
  );

  modalOverlay.addEventListener('click', e => {

    if (e.target === modalOverlay) {

      cerrarModal();
    }
  });

  // Cantidad
  qtyMinus.addEventListener('click', () => {

    const val = parseInt(qtyInput.value) || 1;

    if (val > 1) {

      qtyInput.value = val - 1;
    }
  });

  qtyPlus.addEventListener('click', () => {

    const val = parseInt(qtyInput.value) || 1;

    const max = parseInt(qtyInput.max) || 999;

    if (val < max) {

      qtyInput.value = val + 1;
    }
  });

  // Agregar carrito
  addToCartBtn.addEventListener(
    'click',
    agregarAlCarrito
  );

  // Carrito
  cartBtn.addEventListener(
    'click',
    abrirCarrito
  );

  cartDrawerClose.addEventListener(
    'click',
    cerrarCarrito
  );

  cartOverlay.addEventListener(
    'click',
    cerrarCarrito
  );

  // Checkout
  checkoutBtn.addEventListener(
    'click',
    comprarWhatsApp
  );

  // Logo
  logoLink.addEventListener('click', e => {

    e.preventDefault();

    filtroLista.value = '';

    filtroCategoria.value = '';

    filtroSubcategoria.value = '';

    searchInput.value = '';

    actualizarCategorias();

    filtrarProductos();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ESC
  document.addEventListener('keydown', e => {

    if (e.key === 'Escape') {

      if (modalOverlay.classList.contains('open')) {

        cerrarModal();
      }

      if (cartDrawer.classList.contains('open')) {

        cerrarCarrito();
      }
    }
  });
}