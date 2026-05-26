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

// ─── MENU LATERAL ───
const menuToggle  = document.getElementById('menuToggle');
const navMenu     = document.getElementById('navMenu');
const navBackdrop = document.getElementById('navBackdrop');

// Filtros
const filtroLista        = document.getElementById('filtroLista');
const filtroCategoria    = document.getElementById('filtroCategoria');
const filtroSubcategoria = document.getElementById('filtroSubcategoria');

const limpiarFiltrosBtn =
  document.getElementById('limpiarFiltros');

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

// ─── MENU LATERAL ───

function abrirMenu() {

  navMenu.classList.add('open');

  navBackdrop.classList.add('open');

  menuToggle.classList.add('open');

  document.body.style.overflow = 'hidden';
}

function cerrarMenu() {

  navMenu.classList.remove('open');

  navBackdrop.classList.remove('open');

  menuToggle.classList.remove('open');

  document.body.style.overflow = '';
}

function toggleMenu() {

  if (navMenu.classList.contains('open')) {

    cerrarMenu();

  } else {

    abrirMenu();
  }
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

  // Inicializar el menú horizontal y pills
  renderListasHorizontal();
  actualizarUIFiltros();
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

  renderProductos(filtrados);
  actualizarUIFiltros();
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

  let cantidad = parseInt(qtyInput.value) || 1;
  if (cantidad < 1) {
    cantidad = 1;
    qtyInput.value = 1;
  }

  const stockDisponible = productoActual.cantidad !== undefined ? productoActual.cantidad : 999;

  if (cantidad > stockDisponible) {
    cantidad = stockDisponible;
    qtyInput.value = stockDisponible;
  }

  const existente = carrito.find(
    item => item.id === productoActual.id
  );

  const cantExistente = existente ? existente.cantidad : 0;
  const totalACargar = cantExistente + cantidad;

  if (totalACargar > stockDisponible) {
    const maxPermitido = stockDisponible - cantExistente;
    if (maxPermitido <= 0) {
      mostrarToast(`No hay más stock disponible. Ya tienes ${cantExistente} en el carrito.`);
      cerrarModal();
      return;
    } else {
      if (existente) {
        existente.cantidad = stockDisponible;
      } else {
        carrito.push({
          id: productoActual.id,
          codigo: productoActual.codigo,
          nombre: productoActual.nombre,
          precio: productoActual.precio || 0,
          cantidad: stockDisponible,
          maxStock: stockDisponible,
          imagen: obtenerImagenProducto(productoActual)
        });
      }
      mostrarToast(`Solo se agregaron ${maxPermitido} unidades más. Límite de stock alcanzado.`);
    }
  } else {
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({
        id: productoActual.id,
        codigo: productoActual.codigo,
        nombre: productoActual.nombre,
        precio: productoActual.precio || 0,
        cantidad: cantidad,
        maxStock: stockDisponible,
        imagen: obtenerImagenProducto(productoActual)
      });
    }
    mostrarToast(`"${productoActual.nombre}" agregado al carrito`);
  }

  guardarCarrito();

  actualizarBadgeCarrito();

  cerrarModal();
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

function obtenerImagenProducto(producto) {

  if (producto.imagen) {
    return producto.imagen;
  }

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

  // ─── MENU ───

  menuToggle.addEventListener(
    'click',
    toggleMenu
  );

  navBackdrop.addEventListener(
    'click',
    cerrarMenu
  );

  // ─── LIMPIAR FILTROS ───

  limpiarFiltrosBtn.addEventListener('click', limpiarTodoAction);

  const limpiarFiltrosTopBtn = document.getElementById('limpiarFiltrosTop');
  if (limpiarFiltrosTopBtn) {
    limpiarFiltrosTopBtn.addEventListener('click', limpiarTodoAction);
  }

  // ─── SEARCH ───

  searchInput.addEventListener(
    'input',
    filtrarProductos
  );

  // ─── FILTROS ───

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

  // ─── MODAL ───

  modalClose.addEventListener(
    'click',
    cerrarModal
  );

  modalOverlay.addEventListener('click', e => {

    if (e.target === modalOverlay) {

      cerrarModal();
    }
  });

  // ─── CANTIDAD ───

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

  // ─── AGREGAR CARRITO ───

  addToCartBtn.addEventListener(
    'click',
    agregarAlCarrito
  );

  // ─── CARRITO ───

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

  // ─── CONTROLES CARRITO ───

  cartItemsCont.addEventListener('click', e => {

    const btnQty = e.target.closest('[data-delta]');

    if (btnQty) {

      const index = parseInt(btnQty.dataset.index);

      const delta = parseInt(btnQty.dataset.delta);

      const item = carrito[index];

      if (!item) return;

      if (delta > 0) {
        const stockMaximo = item.maxStock !== undefined ? item.maxStock : 999;
        if (item.cantidad + delta > stockMaximo) {
          mostrarToast(`Límite de stock alcanzado (${stockMaximo} unidades).`);
          return;
        }
      }

      item.cantidad += delta;

      if (item.cantidad <= 0) {

        carrito.splice(index, 1);
      }

      guardarCarrito();

      actualizarBadgeCarrito();

      renderCarrito();

      return;
    }

    const btnRemove = e.target.closest('[data-remove]');

    if (btnRemove) {

      const index = parseInt(btnRemove.dataset.remove);

      carrito.splice(index, 1);

      guardarCarrito();

      actualizarBadgeCarrito();

      renderCarrito();
    }
  });

  // ─── CHECKOUT ───

  checkoutBtn.addEventListener(
    'click',
    comprarWhatsApp
  );

  // ─── LOGO ───

  logoLink.addEventListener('click', e => {

    e.preventDefault();

    filtroLista.value = '';

    filtroCategoria.value = '';

    filtroSubcategoria.value = '';

    searchInput.value = '';

    actualizarCategorias();

    filtrarProductos();

    renderListasHorizontal();
    cerrarFiltroDropdown();
    actualizarUIFiltros();

    cerrarMenu();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ─── NAV CLOSE ───
  const navCloseBtn = document.getElementById('navClose');
  if (navCloseBtn) {
    navCloseBtn.addEventListener('click', cerrarMenu);
  }

  // ─── ESC ───

  document.addEventListener('keydown', e => {

    if (e.key === 'Escape') {

      if (modalOverlay.classList.contains('open')) {

        cerrarModal();
      }

      if (cartDrawer.classList.contains('open')) {

        cerrarCarrito();
      }

      if (navMenu.classList.contains('open')) {

        cerrarMenu();
      }
    }
  });
}

function limpiarTodoAction() {
  filtroLista.value = '';
  filtroCategoria.value = '';
  filtroSubcategoria.value = '';
  searchInput.value = '';

  actualizarCategorias();
  filtrarProductos();

  renderListasHorizontal();
  cerrarFiltroDropdown();
  actualizarUIFiltros();
}

/* ========================================
   HORIZONTAL FILTERS LOGIC (MERCADO LIBRE STYLE - JERÁRQUICO)
======================================== */

let currentOpenList = null;
let currentOpenCategory = null;

function renderListasHorizontal() {
  const listaTabs = document.getElementById('listaTabs');
  if (!listaTabs) return;

  listaTabs.innerHTML = '';

  // Botón para "Todas las listas"
  const btnTodas = document.createElement('button');
  btnTodas.className = 'tab-btn' + (!filtroLista.value ? ' active' : '');
  btnTodas.textContent = 'Todas las listas';
  btnTodas.addEventListener('click', () => {
    filtroLista.value = '';
    filtroLista.dispatchEvent(new Event('change'));
    cerrarFiltroDropdown();
    renderListasHorizontal();
    actualizarUIFiltros();
  });
  listaTabs.appendChild(btnTodas);

  // Obtener las listas desde las opciones de filtroLista
  Array.from(filtroLista.options).forEach(opt => {
    if (!opt.value) return;

    const btn = document.createElement('button');
    const isActive = filtroLista.value === opt.value;
    btn.className = 'tab-btn' + (isActive ? ' active' : '');
    btn.innerHTML = `
      <span>${opt.text}</span>
      <svg class="chevron-down-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleListDropdown(opt.value, btn);
    });

    listaTabs.appendChild(btn);
  });
}

function toggleListDropdown(listVal, buttonEl) {
  const dropdown = document.getElementById('filtroDropdownWrapper');
  if (!dropdown) return;

  if (currentOpenList === listVal && dropdown.style.display !== 'none') {
    cerrarFiltroDropdown();
    return;
  }

  // Activar la lista en el select original
  filtroLista.value = listVal;
  filtroLista.dispatchEvent(new Event('change')); // Esto llama a actualizarCategorias() y filtrarProductos()

  const catOptions = Array.from(filtroCategoria.options).filter(opt => opt.value !== '');

  dropdown.innerHTML = '';
  currentOpenList = listVal;
  currentOpenCategory = null;

  // Actualizar estilos activos de los botones horizontales de lista
  Array.from(document.querySelectorAll('#listaTabs .tab-btn')).forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.includes(listVal)) {
      btn.classList.add('active');
    }
  });

  // Contenedor principal anidado
  const container = document.createElement('div');
  container.className = 'nested-dropdown-container';

  // Panel izquierdo de categorías
  const catPanel = document.createElement('div');
  catPanel.className = 'categories-list-panel';

  // Opción "Ver todo en Lista"
  const allListOption = document.createElement('div');
  allListOption.className = 'dropdown-item-cat all-option';
  allListOption.textContent = `Ver todo en ${listVal}`;
  allListOption.addEventListener('click', () => {
    filtroCategoria.value = '';
    filtroSubcategoria.value = '';
    filtrarProductos();
    cerrarFiltroDropdown();
    actualizarUIFiltros();
  });
  catPanel.appendChild(allListOption);

  // Panel derecho de subcategorías (Desktop flyout)
  const subcatPanel = document.createElement('div');
  subcatPanel.className = 'subcategories-flyout-panel';
  subcatPanel.id = 'subcatFlyoutPanel';
  subcatPanel.style.display = 'none';

  // Generar items de categoría
  catOptions.forEach(opt => {
    const catItem = document.createElement('div');
    const isCatActive = filtroCategoria.value === opt.value;
    catItem.className = 'dropdown-item-cat category-item' + (isCatActive ? ' active' : '');
    catItem.innerHTML = `
      <span>${opt.text}</span>
      <svg class="chevron-right-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    `;

    // Cargar las subcategorías en el panel correspondiente
    const loadSubcategories = (e) => {
      e.stopPropagation();
      
      // Marcar categoría activa visualmente en el menú
      Array.from(catPanel.querySelectorAll('.category-item')).forEach(item => item.classList.remove('open'));
      catItem.classList.add('open');

      if (window.innerWidth > 1024) {
        // En escritorio: llenar y mostrar el panel derecho
        showSubcategoriesFlyout(opt.value, subcatPanel);
      } else {
        // En móvil: comportamiento acordeón (expandir verticalmente debajo del item)
        toggleSubcategoriesAccordion(opt.value, catItem);
      }
    };

    catItem.addEventListener('click', loadSubcategories);
    
    // Hover en escritorio abre las subcategorías automáticamente
    if (window.innerWidth > 1024) {
      catItem.addEventListener('mouseenter', loadSubcategories);
    }

    catPanel.appendChild(catItem);
  });

  container.appendChild(catPanel);
  
  if (window.innerWidth > 1024) {
    container.appendChild(subcatPanel);
  }
  
  dropdown.appendChild(container);
  dropdown.style.display = 'block';

  // Posicionamiento de dropdown
  if (window.innerWidth > 1024) {
    const rect = buttonEl.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    dropdown.style.position = 'absolute';
    dropdown.style.top = `${rect.bottom + scrollTop + 8}px`;
    dropdown.style.left = `${rect.left + scrollLeft}px`;
    dropdown.style.right = 'auto';
    dropdown.style.width = 'auto';
  } else {
    dropdown.style.position = 'fixed';
    dropdown.style.bottom = '0';
    dropdown.style.left = '0';
    dropdown.style.right = '0';
    dropdown.style.top = 'auto';
    dropdown.style.width = '100%';
    dropdown.style.borderRadius = '24px 24px 0 0';
  }
}

function showSubcategoriesFlyout(categoryVal, subcatPanel) {
  // Configurar select original y recargar subcategorías
  filtroCategoria.value = categoryVal;
  actualizarSubcategorias();

  const subOptions = Array.from(filtroSubcategoria.options).filter(opt => opt.value !== '');

  subcatPanel.innerHTML = '';

  // Opción "Ver todo en Categoría"
  const allCatOption = document.createElement('div');
  allCatOption.className = 'subcat-item-val all-option';
  allCatOption.textContent = `Ver todo en ${categoryVal}`;
  allCatOption.addEventListener('click', () => {
    filtroCategoria.value = categoryVal;
    filtroSubcategoria.value = '';
    filtrarProductos();
    cerrarFiltroDropdown();
    actualizarUIFiltros();
  });
  subcatPanel.appendChild(allCatOption);

  // Items de subcategoría
  subOptions.forEach(opt => {
    const subItem = document.createElement('div');
    const isSubActive = filtroSubcategoria.value === opt.value;
    subItem.className = 'subcat-item-val' + (isSubActive ? ' active' : '');
    subItem.textContent = opt.text;
    subItem.addEventListener('click', () => {
      filtroCategoria.value = categoryVal;
      filtroSubcategoria.value = opt.value;
      filtrarProductos();
      cerrarFiltroDropdown();
      actualizarUIFiltros();
    });
    subcatPanel.appendChild(subItem);
  });

  subcatPanel.style.display = 'block';
}

function toggleSubcategoriesAccordion(categoryVal, catItemEl) {
  // Si ya está abierto el acordeón en este item, lo cerramos
  const existingAccordion = catItemEl.querySelector('.mobile-accordion-panel');
  if (existingAccordion) {
    existingAccordion.remove();
    catItemEl.classList.remove('accordion-open');
    return;
  }

  // Cerrar otros acordeones abiertos
  Array.from(catItemEl.parentNode.querySelectorAll('.mobile-accordion-panel')).forEach(el => el.remove());
  Array.from(catItemEl.parentNode.querySelectorAll('.category-item')).forEach(el => el.classList.remove('accordion-open'));

  // Cargar subcategorías
  filtroCategoria.value = categoryVal;
  actualizarSubcategorias();

  const subOptions = Array.from(filtroSubcategoria.options).filter(opt => opt.value !== '');

  const accordionPanel = document.createElement('div');
  accordionPanel.className = 'mobile-accordion-panel';
  accordionPanel.addEventListener('click', e => e.stopPropagation()); // Evitar click en padre

  // Opción "Ver todo en Categoría"
  const allCatOption = document.createElement('div');
  allCatOption.className = 'accordion-subcat-item all-option';
  allCatOption.textContent = `Ver todo en ${categoryVal}`;
  allCatOption.addEventListener('click', () => {
    filtroCategoria.value = categoryVal;
    filtroSubcategoria.value = '';
    filtrarProductos();
    cerrarFiltroDropdown();
    actualizarUIFiltros();
  });
  accordionPanel.appendChild(allCatOption);

  // Items de subcategoría
  subOptions.forEach(opt => {
    const subItem = document.createElement('div');
    const isSubActive = filtroSubcategoria.value === opt.value;
    subItem.className = 'accordion-subcat-item' + (isSubActive ? ' active' : '');
    subItem.textContent = opt.text;
    subItem.addEventListener('click', () => {
      filtroCategoria.value = categoryVal;
      filtroSubcategoria.value = opt.value;
      filtrarProductos();
      cerrarFiltroDropdown();
      actualizarUIFiltros();
    });
    accordionPanel.appendChild(subItem);
  });

  catItemEl.appendChild(accordionPanel);
  catItemEl.classList.add('accordion-open');
}

function cerrarFiltroDropdown() {
  const dropdown = document.getElementById('filtroDropdownWrapper');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
  currentOpenList = null;
  currentOpenCategory = null;
}

function actualizarUIFiltros() {
  const wrapper = document.getElementById('activeFiltersWrapper');
  const pillsCont = document.getElementById('activeFiltersPills');
  const badge = document.getElementById('filterBadge');
  const limpiarBtn = document.getElementById('limpiarFiltros');

  if (!wrapper || !pillsCont) return;

  pillsCont.innerHTML = '';
  let activeCount = 0;

  // 1. Búsqueda
  const searchVal = searchInput.value.trim();
  if (searchVal) {
    activeCount++;
    createFilterPill(pillsCont, `Buscar: "${searchVal}"`, () => {
      searchInput.value = '';
      filtrarProductos();
      actualizarUIFiltros();
    });
  }

  // 2. Lista
  if (filtroLista.value) {
    activeCount++;
    createFilterPill(pillsCont, `Lista: ${filtroLista.value}`, () => {
      filtroLista.value = '';
      filtroLista.dispatchEvent(new Event('change'));
      renderListasHorizontal();
      actualizarUIFiltros();
    });
  }

  // 3. Categoría
  if (filtroCategoria.value) {
    activeCount++;
    createFilterPill(pillsCont, `Categoría: ${filtroCategoria.value}`, () => {
      filtroCategoria.value = '';
      filtroCategoria.dispatchEvent(new Event('change'));
      actualizarUIFiltros();
    });
  }

  // 4. Subcategoría
  if (filtroSubcategoria.value) {
    activeCount++;
    createFilterPill(pillsCont, `Subcategoría: ${filtroSubcategoria.value}`, () => {
      filtroSubcategoria.value = '';
      filtroSubcategoria.dispatchEvent(new Event('change'));
      actualizarUIFiltros();
    });
  }

  // Controlar visibilidad del wrapper y badge
  if (activeCount > 0) {
    wrapper.style.display = 'flex';
    if (limpiarBtn) limpiarBtn.style.display = 'block';
    if (badge) {
      badge.textContent = activeCount;
      badge.style.display = 'flex';
    }
  } else {
    wrapper.style.display = 'none';
    if (limpiarBtn) limpiarBtn.style.display = 'none';
    if (badge) {
      badge.style.display = 'none';
    }
  }

  // Renderizar filtros móviles en el drawer
  renderFiltrosMobile();
}

function createFilterPill(container, labelText, onRemove) {
  const pill = document.createElement('div');
  pill.className = 'filter-pill';

  const label = document.createElement('span');
  label.textContent = labelText;
  pill.appendChild(label);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-pill-btn';
  removeBtn.ariaLabel = 'Eliminar filtro';
  removeBtn.innerHTML = '✕';
  removeBtn.addEventListener('click', onRemove);
  pill.appendChild(removeBtn);

  container.appendChild(pill);
}

// Cerrar dropdown si se hace click fuera
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('filtroDropdownWrapper');
  if (!dropdown) return;

  const isClickInsideDropdown = dropdown.contains(e.target);
  const isClickOnTabBtn = e.target.closest('#listaTabs .tab-btn');

  if (!isClickInsideDropdown && !isClickOnTabBtn) {
    cerrarFiltroDropdown();
  }
});

/* ========================================
   MOBILE ACCORDION FILTERS IN DRAWER
======================================== */

function renderFiltrosMobile() {
  const container = document.getElementById('mobileFiltrosContainer');
  if (!container) return;

  container.innerHTML = '';

  // 1. Botón "Limpiar todos los filtros" si hay filtros activos
  const activeFiltersCount = getActiveFiltersCount();
  if (activeFiltersCount > 0) {
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'mobile-limpiar-btn';
    btnLimpiar.innerHTML = `✕ Limpiar filtros (${activeFiltersCount})`;
    btnLimpiar.addEventListener('click', () => {
      limpiarTodoAction();
      cerrarMenu();
    });
    container.appendChild(btnLimpiar);
  }

  // 2. Obtener listas del selector original
  const listOptions = Array.from(filtroLista.options).filter(opt => opt.value !== '');

  listOptions.forEach(listOpt => {
    const listWrapper = document.createElement('div');
    const isListActive = filtroLista.value === listOpt.value;
    listWrapper.className = 'mobile-list-wrapper' + (isListActive ? ' active expanded' : '');

    const listHeader = document.createElement('button');
    listHeader.className = 'mobile-list-header';
    listHeader.innerHTML = `
      <span>${listOpt.text}</span>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    `;
    listWrapper.appendChild(listHeader);

    // Contenedor de categorías
    const catContainer = document.createElement('div');
    catContainer.className = 'mobile-cat-container';
    
    // Si la lista está activa, mostrar sus categorías
    if (isListActive) {
      // Opción de "Ver todo en esta lista"
      const allListOpt = document.createElement('button');
      allListOpt.className = 'mobile-cat-item all-option';
      allListOpt.textContent = `Ver todo en ${listOpt.text}`;
      allListOpt.addEventListener('click', (e) => {
        e.stopPropagation();
        filtroLista.value = listOpt.value;
        filtroCategoria.value = '';
        filtroSubcategoria.value = '';
        // Disparar evento para activar filtros en cascada
        filtroLista.dispatchEvent(new Event('change'));
        cerrarMenu();
      });
      catContainer.appendChild(allListOpt);

      // Obtener categorías pertenecientes a la lista activa
      const cats = [
        ...new Set(
          productos
            .filter(p => p.lista === listOpt.value)
            .map(p => p.categoria)
            .filter(Boolean)
        )
      ].sort();

      cats.forEach(cat => {
        const catWrapper = document.createElement('div');
        const isCatActive = filtroCategoria.value === cat;
        catWrapper.className = 'mobile-cat-wrapper' + (isCatActive ? ' active expanded' : '');

        const catHeader = document.createElement('button');
        catHeader.className = 'mobile-cat-header';
        catHeader.innerHTML = `
          <span>${cat}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        `;
        catWrapper.appendChild(catHeader);

        const subContainer = document.createElement('div');
        subContainer.className = 'mobile-subcat-container';

        if (isCatActive) {
          // Opción de "Ver todo en esta categoría"
          const allCatOpt = document.createElement('button');
          allCatOpt.className = 'mobile-subcat-item all-option';
          allCatOpt.textContent = `Ver todo en ${cat}`;
          allCatOpt.addEventListener('click', (e) => {
            e.stopPropagation();
            filtroLista.value = listOpt.value;
            filtroCategoria.value = cat;
            filtroSubcategoria.value = '';
            // Disparar evento
            filtroCategoria.dispatchEvent(new Event('change'));
            cerrarMenu();
          });
          subContainer.appendChild(allCatOpt);

          // Obtener subcategorías
          const subs = [
            ...new Set(
              productos
                .filter(p => p.lista === listOpt.value && p.categoria === cat)
                .map(p => p.sub_categoria)
                .filter(Boolean)
            )
          ].sort();

          subs.forEach(sub => {
            const isSubActive = filtroSubcategoria.value === sub;
            const subBtn = document.createElement('button');
            subBtn.className = 'mobile-subcat-item' + (isSubActive ? ' active' : '');
            subBtn.textContent = sub;
            subBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              filtroLista.value = listOpt.value;
              filtroCategoria.value = cat;
              filtroSubcategoria.value = sub;
              // Disparar evento
              filtroSubcategoria.dispatchEvent(new Event('change'));
              cerrarMenu();
            });
            subContainer.appendChild(subBtn);
          });
        }

        catHeader.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isCatActive) {
            filtroCategoria.value = '';
            filtroSubcategoria.value = '';
          } else {
            filtroCategoria.value = cat;
            filtroSubcategoria.value = '';
          }
          // Disparar evento de cambio en categoría para sincronizar
          filtroCategoria.dispatchEvent(new Event('change'));
          renderFiltrosMobile();
        });

        catWrapper.appendChild(subContainer);
        catContainer.appendChild(catWrapper);
      });
    }

    listHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isListActive) {
        filtroLista.value = '';
        filtroCategoria.value = '';
        filtroSubcategoria.value = '';
      } else {
        filtroLista.value = listOpt.value;
        filtroCategoria.value = '';
        filtroSubcategoria.value = '';
      }
      filtroLista.dispatchEvent(new Event('change'));
      renderFiltrosMobile();
    });

    listWrapper.appendChild(catContainer);
    container.appendChild(listWrapper);
  });
}

function getActiveFiltersCount() {
  let count = 0;
  if (searchInput.value.trim()) count++;
  if (filtroLista.value) count++;
  if (filtroCategoria.value) count++;
  if (filtroSubcategoria.value) count++;
  return count;
}