/* script.js */
document.addEventListener('DOMContentLoaded', () => {
  const btnCarrito = document.getElementById('btnCarrito');
  const carritoPanel = document.getElementById('carrito');
  const cerrarCarrito = document.getElementById('cerrarCarrito');
  const overlay = document.getElementById('overlay');
  const listaCarrito = document.getElementById('listaCarrito');
  const totalEl = document.getElementById('total');
  const cartCount = document.getElementById('cart-count');
  const vaciarBtn = document.getElementById('vaciarCarrito');

  let carrito = loadCart();

  // Helpers
  function saveCart() {
    localStorage.setItem('miCarrito', JSON.stringify(carrito));
  }
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('miCarrito')) || [];
    } catch {
      return [];
    }
  }
  function formatNumber(n) {
    return Number(n).toLocaleString('es-AR');
  }

  // Render
  function actualizarVistaCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      cantidadTotal += item.cantidad;

      const li = document.createElement('li');

      li.innerHTML = `
        <div class="item-info">
          <div class="item-name">${item.nombre}</div>
          <div class="item-price">$${formatNumber(item.precio)} × ${item.cantidad} = $${formatNumber(subtotal)}</div>
        </div>
        <div class="item-controls">
          <button class="btn-small qty btn-decrease" data-name="${escapeHtml(item.nombre)}">−</button>
          <button class="btn-small qty btn-increase" data-name="${escapeHtml(item.nombre)}">+</button>
          <button class="btn-small remove btn-remove" data-name="${escapeHtml(item.nombre)}">Delete</button>
        </div>
      `;
      listaCarrito.appendChild(li);
    });

    totalEl.textContent = formatNumber(total);
    cartCount.textContent = cantidadTotal;
    saveCart();
  }

  // Add / remove / change qty
  function agregarAlCarrito(nombre, precio) {
    const idx = carrito.findIndex(i => i.nombre === nombre);
    if (idx >= 0) carrito[idx].cantidad++;
    else carrito.push({ nombre, precio: Number(precio), cantidad: 1 });
    actualizarVistaCarrito();
  }

  function quitarItem(nombre) {
    carrito = carrito.filter(i => i.nombre !== nombre);
    actualizarVistaCarrito();
  }

  function cambiarCantidad(nombre, delta) {
    const item = carrito.find(i => i.nombre === nombre);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) quitarItem(nombre);
    else actualizarVistaCarrito();
  }

  // Event listeners: botones "Agregar"
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      agregarAlCarrito(name, price);
      abrirCarrito();
    });
  });

  // Delegation para botones dentro del carrito
  listaCarrito.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.btn-remove')) {
      const name = target.dataset.name;
      quitarItem(name);
    } else if (target.matches('.btn-increase')) {
      cambiarCantidad(target.dataset.name, +1);
    } else if (target.matches('.btn-decrease')) {
      cambiarCantidad(target.dataset.name, -1);
    }
  });

  // Abrir / cerrar carrito
  function abrirCarrito() {
    carritoPanel.classList.add('abierto');
    carritoPanel.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('hidden');
  }
  function cerrar() {
    carritoPanel.classList.remove('abierto');
    carritoPanel.setAttribute('aria-hidden', 'true');
    overlay.classList.add('hidden');
  }

  btnCarrito.addEventListener('click', abrirCarrito);
  cerrarCarrito.addEventListener('click', cerrar);
  overlay.addEventListener('click', cerrar);

  // Vaciar carrito
  vaciarBtn.addEventListener('click', () => {
    carrito = [];
    actualizarVistaCarrito();
  });

  // Guardar al cerrar pestaña (opcional redundante)
  window.addEventListener('beforeunload', saveCart);

  // Util: escape simple (para dataset)
  function escapeHtml(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  // Inicializar vista
  actualizarVistaCarrito();
});
