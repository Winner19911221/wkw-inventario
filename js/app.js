import { login, logout, isAdmin, isLoggedIn, initAuth, applyRoleRestrictions, getSession, registerUser } from './auth.js';

// Inicialización del estado desde LocalStorage o arreglos vacíos
const defaultImages = {
  camaras_ip: 'img/camara_ip.png',
  camaras_analogicas: 'img/camara_ip.png',
  grabadores: 'img/grabador.png',
  discos_duros: 'img/disco_duro.png',
  switches: 'img/switch_red.png',
  poe: 'img/equipo_poe.png',
  redes: 'img/router_wifi.png',
  otros: 'img/camara_ip.png'
};

const categoryNames = {
  camaras_ip: 'Cámaras IP',
  camaras_analogicas: 'Cámaras Analógicas HD',
  grabadores: 'Grabadores (DVR/NVR)',
  discos_duros: 'Discos Duros',
  switches: 'Switches de Red',
  poe: 'Equipos PoE',
  redes: 'Redes / Conectividad',
  otros: 'Otros'
};

let tempProductImageBase64 = '';
let vistaProductos = localStorage.getItem('vista_productos') || 'tabla';

let productos = JSON.parse(localStorage.getItem('pro_productos')) || [];

// Predefinir catálogo de productos si está vacío
if (productos.length === 0) {
  const catalogTemplate = [
    // Cámaras IP
    { nombre: 'Cámaras IP Bullet 2MP', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Bullet 4MP', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Bullet 8MP (4K)', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Domo 2MP', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Domo 4MP', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Domo 8MP', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP PTZ', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP Fisheye 360°', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP ColorVu / Full Color', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP con IA', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP con reconocimiento facial', precio: 0, stock: 20, categoria: 'camaras_ip' },
    { nombre: 'Cámaras IP para lectura de placas', precio: 0, stock: 20, categoria: 'camaras_ip' },
    // Cámaras Analógicas HD
    { nombre: 'Cámaras Bullet HD', precio: 0, stock: 20, categoria: 'camaras_analogicas' },
    { nombre: 'Cámaras Domo HD', precio: 0, stock: 20, categoria: 'camaras_analogicas' },
    { nombre: 'Cámaras PTZ HD', precio: 0, stock: 20, categoria: 'camaras_analogicas' },
    { nombre: 'Cámaras Full Color HD', precio: 0, stock: 20, categoria: 'camaras_analogicas' },
    { nombre: 'Cámaras IR HD', precio: 0, stock: 20, categoria: 'camaras_analogicas' },
    // Grabadores
    { nombre: 'DVR 4 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'DVR 8 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'DVR 16 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'DVR 32 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'NVR 4 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'NVR 8 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'NVR 16 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'NVR 32 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    { nombre: 'NVR 64 canales', precio: 0, stock: 20, categoria: 'grabadores' },
    // Discos Duros
    { nombre: '1TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '2TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '4TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '6TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '8TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '10TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    { nombre: '12TB Vigilancia', precio: 0, stock: 20, categoria: 'discos_duros' },
    // Switches de Red
    { nombre: 'Switch 5 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch 8 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch 16 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch 24 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch PoE 4 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch PoE 8 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch PoE 16 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch PoE 24 puertos', precio: 0, stock: 20, categoria: 'switches' },
    { nombre: 'Switch PoE administrable', precio: 0, stock: 20, categoria: 'switches' },
    // Equipos PoE
    { nombre: 'Inyector PoE', precio: 0, stock: 20, categoria: 'poe' },
    { nombre: 'Splitter PoE', precio: 0, stock: 20, categoria: 'poe' },
    { nombre: 'Extensor PoE', precio: 0, stock: 20, categoria: 'poe' },
    { nombre: 'Protector PoE', precio: 0, stock: 20, categoria: 'poe' },
    // Redes
    { nombre: 'Router empresarial', precio: 0, stock: 20, categoria: 'redes' },
    { nombre: 'Access Point WiFi', precio: 0, stock: 20, categoria: 'redes' }
  ];

  productos = catalogTemplate.map(item => ({
    id: '_' + Math.random().toString(36).substr(2, 9),
    nombre: item.nombre,
    precio: item.precio,
    stock: item.stock,
    categoria: item.categoria,
    imagen: defaultImages[item.categoria] || defaultImages['otros']
  }));

  localStorage.setItem('pro_productos', JSON.stringify(productos));
}

// Ejecutar migración para productos existentes sin categoría o imagen
productos.forEach(p => {
  let modificado = false;
  if (!p.categoria) {
    const n = p.nombre.toLowerCase();
    if (n.includes('cámara') || n.includes('camara')) {
      p.categoria = n.includes('ip') ? 'camaras_ip' : 'camaras_analogicas';
    } else if (n.includes('dvr') || n.includes('nvr') || n.includes('grabador')) {
      p.categoria = 'grabadores';
    } else if (n.includes('tb') || n.includes('disco') || n.includes('vigilancia')) {
      p.categoria = 'discos_duros';
    } else if (n.includes('switch')) {
      p.categoria = 'switches';
    } else if (n.includes('poe') || n.includes('inyector') || n.includes('splitter') || n.includes('extensor') || n.includes('protector')) {
      p.categoria = 'poe';
    } else if (n.includes('router') || n.includes('access point') || n.includes('wifi') || n.includes('ap')) {
      p.categoria = 'redes';
    } else {
      p.categoria = 'otros';
    }
    modificado = true;
  }
  if (!p.imagen) {
    p.imagen = defaultImages[p.categoria] || defaultImages['otros'];
    modificado = true;
  }
});

let clientes = JSON.parse(localStorage.getItem('pro_clientes')) || [];
let cotizaciones = JSON.parse(localStorage.getItem('pro_cotizaciones')) || [];

// NavegaciÃ³n de secciones de pÃ¡gina
function mostrar(id) {
  console.log('mostrar called with id:', id);

  document.querySelectorAll('.pagina').forEach(x => x.classList.add('oculto'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('oculto');
  }

  // Actualizar clase 'active' en el menÃº de navegaciÃ³n
  document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
  const menuLink = document.getElementById(`menu-${id}`);
  if (menuLink) {
    menuLink.classList.add('active');
  }
}

// Guardar todo el estado en LocalStorage y refrescar la UI
function saveState() {
  localStorage.setItem('pro_productos', JSON.stringify(productos));
  localStorage.setItem('pro_clientes', JSON.stringify(clientes));
  localStorage.setItem('pro_cotizaciones', JSON.stringify(cotizaciones));
  actualizarUI();
}

// Formatear monedas
function formatCurrency(monto) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(monto);
}

// --- CRUD PRODUCTOS ---

function agregarProducto() {
  if (!isAdmin()) {
    alert('No tienes permisos para agregar productos.');
    return;
  }
  const nombreInput = document.getElementById('nombreProducto');
  const precioInput = document.getElementById('precioProducto');
  const stockInput = document.getElementById('stockProducto');
  const categoriaSelect = document.getElementById('categoriaProducto');
  const imgInput = document.getElementById('imagenProducto');

  const nombre = nombreInput.value.trim();
  const precio = parseFloat(precioInput.value);
  const stock = parseInt(stockInput.value);
  const categoria = categoriaSelect ? categoriaSelect.value : 'otros';

  // Validación básica de entradas
  if (!nombre) {
    alert('Por favor, ingresa el nombre del producto.');
    return;
  }
  if (isNaN(precio) || precio < 0) {
    alert('Por favor, ingresa un precio válido (mayor o igual a 0).');
    return;
  }
  if (isNaN(stock) || stock < 0) {
    alert('Por favor, ingresa un stock inicial válido (mayor o igual a 0).');
    return;
  }

  const imagen = tempProductImageBase64 || defaultImages[categoria] || defaultImages['otros'];

  // Agregar al arreglo
  productos.push({
    id: '_' + Math.random().toString(36).substr(2, 9),
    nombre,
    precio,
    stock,
    categoria,
    imagen
  });

  // Limpiar inputs
  nombreInput.value = '';
  precioInput.value = '';
  stockInput.value = '';
  if (categoriaSelect) categoriaSelect.value = 'camaras_ip';
  if (imgInput) imgInput.value = '';
  tempProductImageBase64 = '';

  saveState();
}

function aumentarStock(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para modificar el stock.');
    return;
  }
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  const incrementoStr = prompt('Ingrese la cantidad a agregar al stock:', '1');
  const incremento = parseInt(incrementoStr);
  if (isNaN(incremento) || incremento <= 0) {
    alert('Cantidad inválida.');
    return;
  }
  prod.stock += incremento;
  saveState();
}

function modificarPrecio(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para modificar el precio.');
    return;
  }
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  const nuevoPrecioStr = prompt(`Ingrese el nuevo precio para ${prod.nombre}:`, prod.precio);
  if (nuevoPrecioStr === null) return;
  const nuevoPrecio = parseFloat(nuevoPrecioStr);
  if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    alert('Precio inválido.');
    return;
  }
  prod.precio = nuevoPrecio;
  saveState();
}

function eliminarProducto(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para eliminar productos.');
    return;
  }
  console.log('eliminarProducto called with id:', id);
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    console.log('User confirmed deletion');
    productos = productos.filter(p => p.id !== id);
    console.log('Product list length after deletion:', productos.length);
    saveState();
  } else {
    console.log('User cancelled deletion');
  }
}

function cambiarVistaProductos(vista) {
  vistaProductos = vista;
  localStorage.setItem('vista_productos', vista);
  
  const tblContainer = document.querySelector('#productos .table-container');
  const galContainer = document.getElementById('galeriaProductos');
  const btnTabla = document.getElementById('btnVistaTabla');
  const btnGaleria = document.getElementById('btnVistaGaleria');
  
  if (tblContainer && galContainer) {
    if (vista === 'tabla') {
      tblContainer.classList.remove('oculto');
      galContainer.classList.add('oculto');
      if (btnTabla) btnTabla.classList.add('active');
      if (btnGaleria) btnGaleria.classList.remove('active');
    } else {
      tblContainer.classList.add('oculto');
      galContainer.classList.remove('oculto');
      if (btnTabla) btnTabla.classList.remove('active');
      if (btnGaleria) btnGaleria.classList.add('active');
    }
  }
  
  actualizarProductosView();
}

function actualizarProductosView() {
  if (vistaProductos === 'tabla') {
    actualizarProductosTable();
  } else {
    actualizarProductosGallery();
  }
}

function actualizarProductosTable() {
  const tbody = document.getElementById('tablaProductos');
  tbody.innerHTML = '';

  if (productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">No hay productos registrados.</td></tr>`;
    return;
  }

  productos.forEach(p => {
    // Determinar badge de stock
    let statusBadge = '';
    if (p.stock === 0) {
      statusBadge = '<span class="badge badge-danger">Agotado</span>';
    } else if (p.stock <= 5) {
      statusBadge = '<span class="badge badge-warning">Stock Bajo</span>';
    } else {
      statusBadge = '<span class="badge badge-success">Disponible</span>';
    }

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${p.imagen}" alt="${p.nombre}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 500; color: #fff;">${p.nombre}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${categoryNames[p.categoria] || 'Otros'}</div>
            </div>
          </div>
        </td>
        <td>
          ${formatCurrency(p.precio)}
          ${isAdmin() ? `<button class="btn-success" onclick="modificarPrecio('${p.id}')" style="padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;" title="Modificar Precio"><i class="fa-solid fa-dollar-sign"></i></button>` : ''}
        </td>
        <td>
          ${p.stock} unidades
          ${isAdmin() ? `<button class="btn-success" onclick="aumentarStock('${p.id}')" style="padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;">+</button>` : ''}
        </td>
        <td>${statusBadge}</td>
        ${isAdmin() ? `<td style="text-align: center;">
          <button class="btn-danger" onclick="eliminarProducto('${p.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
            <i class="fa-solid fa-trash-can"></i> Eliminar
          </button>
        </td>` : '<td></td>'}
      </tr>
    `;
  });
}

function actualizarProductosGallery() {
  const container = document.getElementById('galeriaProductos');
  if (!container) return;
  container.innerHTML = '';

  if (productos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">No hay productos registrados.</div>`;
    return;
  }

  productos.forEach(p => {
    // Determinar badge de stock
    let statusClass = '';
    let statusText = '';
    if (p.stock === 0) {
      statusClass = 'danger';
      statusText = 'Agotado';
    } else if (p.stock <= 5) {
      statusClass = 'warning';
      statusText = 'Stock Bajo';
    } else {
      statusClass = 'success';
      statusText = 'Disponible';
    }

    container.innerHTML += `
      <div class="product-card">
        <div class="product-card-img-container">
          <img class="product-card-img" src="${p.imagen}" alt="${p.nombre}">
          <span class="product-card-badge badge-${statusClass}">${statusText}</span>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${categoryNames[p.categoria] || 'Otros'}</span>
          <h3 class="product-card-title" title="${p.nombre}">${p.nombre}</h3>
          <div class="product-card-price">${formatCurrency(p.precio)}</div>
          <div class="product-card-stock">
            <i class="fa-solid fa-warehouse"></i> Stock: <strong>${p.stock}</strong> uds
          </div>
          <div class="product-card-actions">
            ${isAdmin() ? `
            <button class="btn-success" onclick="aumentarStock('${p.id}')" title="Aumentar Stock">
              <i class="fa-solid fa-plus"></i> Stock
            </button>
            <button class="btn-warning" onclick="modificarPrecio('${p.id}')" title="Modificar Precio">
              <i class="fa-solid fa-dollar-sign"></i> Precio
            </button>
            <button class="btn-danger" onclick="eliminarProducto('${p.id}')" title="Eliminar Producto">
              <i class="fa-solid fa-trash-can"></i> Eliminar
            </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  });
}


// --- CRUD CLIENTES ---

function agregarCliente() {
  if (!isAdmin()) {
    alert('No tienes permisos para agregar clientes.');
    return;
  }
  const nombreInput = document.getElementById('nombreCliente');
  const nombre = nombreInput.value.trim();

  if (!nombre) {
    alert('Por favor, escribe el nombre completo del cliente.');
    return;
  }

  clientes.push({
    id: '_' + Math.random().toString(36).substr(2, 9),
    nombre
  });

  nombreInput.value = '';
  saveState();
}

function eliminarCliente(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para eliminar clientes.');
    return;
  }
  if (confirm('¿Estás seguro de que deseas eliminar este cliente? Se mantendrán sus cotizaciones previas.')) {
    clientes = clientes.filter(c => c.id !== id);
    saveState();
  }
}

function actualizarClientesList() {
  const lista = document.getElementById('listaClientes');
  lista.innerHTML = '';

  if (clientes.length === 0) {
    lista.innerHTML = `<li style="text-align: center; color: var(--text-secondary); list-style: none; padding: 20px;">No hay clientes registrados.</li>`;
    return;
  }

  clientes.forEach(c => {
    const inicial = c.nombre.charAt(0).toUpperCase();
    lista.innerHTML += `
      <li class="modern-list-item">
        <div class="list-item-info">
          <div class="list-item-avatar">${inicial}</div>
          <div>
            <div style="font-weight: 500; color: #fff;">${c.nombre}</div>
            <div class="list-item-meta">ID: ${c.id}</div>
          </div>
        </div>
        <div class="list-item-actions">
          ${isAdmin() ? `
          <button class="btn-danger" onclick="eliminarCliente('${c.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
            <i class="fa-solid fa-user-minus"></i> Eliminar
          </button>
          ` : ''}
        </div>
      </li>
    `;
  });
}


// --- CRUD COTIZACIONES ---

// --- ESTADO TEMPORAL DEL BORRADOR DE COTIZACIÃ“N ---
let borradorCotizacion = {
  items: [],
  aplicarItbis: true
};

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(x => x.classList.add('oculto'));
  document.getElementById(`form-${tabName}`).classList.remove('oculto');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  if (tabName === 'catalogo') {
    document.getElementById('tab-cat').classList.add('active');
  } else if (tabName === 'personalizado') {
    document.getElementById('tab-pers').classList.add('active');
  } else if (tabName === 'mano_obra') {
    document.getElementById('tab-mano').classList.add('active');
  }
}

function actualizarProductosDropdownCotizacion() {
  const select = document.getElementById('prodCatSelect');
  if (!select) return;
  const selectedVal = select.value;
  select.innerHTML = '<option value="">Seleccione un producto...</option>';
  productos.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });
  select.value = selectedVal;
}

function seleccionarProductoCatalogo() {
  const select = document.getElementById('prodCatSelect');
  const panel = document.getElementById('prodInfoPanel');
  const precioSpan = document.getElementById('prodInfoPrecio');
  const stockSpan = document.getElementById('prodInfoStock');
  const stockBadge = document.getElementById('prodInfoStockBadge');
  const precioInput = document.getElementById('prodCatPrecio');
  const cantInput = document.getElementById('prodCatCant');

  const prodId = select.value;
  if (!prodId) {
    panel.style.display = 'none';
    precioInput.value = '';
    return;
  }

  const prod = productos.find(p => p.id === prodId);
  if (prod) {
    panel.style.display = 'flex';
    precioSpan.innerText = formatCurrency(prod.precio);
    stockSpan.innerText = prod.stock;
    precioInput.value = prod.precio;
    cantInput.value = 1;

    // Badge stock styling
    stockBadge.className = 'info-badge stock';
    if (prod.stock === 0) {
      stockBadge.classList.add('danger');
    } else if (prod.stock <= 5) {
      stockBadge.classList.add('warning');
    }
  }
}

function validarCantCatalogo() {
  const select = document.getElementById('prodCatSelect');
  const cantInput = document.getElementById('prodCatCant');
  const prodId = select.value;
  if (!prodId) return;

  const prod = productos.find(p => p.id === prodId);
  if (prod) {
    const cant = parseInt(cantInput.value);
    if (cant > prod.stock) {
      cantInput.style.borderColor = 'var(--danger)';
      cantInput.style.boxShadow = '0 0 0 3px var(--danger-glow)';
    } else {
      cantInput.style.borderColor = '';
      cantInput.style.boxShadow = '';
    }
  }
}

function agregarItemCatalogo() {
  const select = document.getElementById('prodCatSelect');
  const cantInput = document.getElementById('prodCatCant');
  const precioInput = document.getElementById('prodCatPrecio');

  const prodId = select.value;
  const cantidad = parseInt(cantInput.value);
  let precio = parseFloat(precioInput.value);

  if (!prodId) {
    alert('Seleccione un producto del catálogo.');
    return;
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    alert('Ingrese una cantidad válida.');
    return;
  }

  const prod = productos.find(p => p.id === prodId);
  if (!prod) return;

  // Si no es administrador, ignorar cualquier precio modificado y usar el oficial del catálogo
  if (!isAdmin()) {
    precio = prod.precio;
  }

  if (isNaN(precio) || precio < 0) {
    alert('Ingrese un precio unitario válido.');
    return;
  }

  if (cantidad > prod.stock) {
    if (!confirm(`La cantidad ingresada (${cantidad}) supera el stock disponible (${prod.stock}). ¿Desea continuar?`)) {
      return;
    }
  }

  // Verificar si ya está en el borrador
  const indexExistente = borradorCotizacion.items.findIndex(item => item.id === prodId && item.tipo === 'catalogo');
  if (indexExistente !== -1) {
    borradorCotizacion.items[indexExistente].cantidad += cantidad;
    borradorCotizacion.items[indexExistente].subtotal = borradorCotizacion.items[indexExistente].cantidad * precio;
  } else {
    borradorCotizacion.items.push({
      id: prodId,
      tipo: 'catalogo',
      nombre: prod.nombre,
      cantidad: cantidad,
      precio: precio,
      subtotal: cantidad * precio
    });
  }

  // Reset inputs
  select.value = '';
  cantInput.value = 1;
  precioInput.value = '';
  document.getElementById('prodInfoPanel').style.display = 'none';

  renderBorrador();
}

function agregarItemPersonalizado() {
  if (!isAdmin()) {
    alert('No tienes permisos para agregar elementos personalizados.');
    return;
  }
  const nombreInput = document.getElementById('prodPersNombre');
  const cantInput = document.getElementById('prodPersCant');
  const precioInput = document.getElementById('prodPersPrecio');

  const nombre = nombreInput.value.trim();
  const cantidad = parseInt(cantInput.value);
  const precio = parseFloat(precioInput.value);

  if (!nombre) {
    alert('Ingrese el nombre del concepto o producto.');
    return;
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    alert('Ingrese una cantidad válida.');
    return;
  }
  if (isNaN(precio) || precio < 0) {
    alert('Ingrese un precio unitario válido.');
    return;
  }

  borradorCotizacion.items.push({
    id: '_' + Math.random().toString(36).substr(2, 9),
    tipo: 'personalizado',
    nombre: nombre,
    cantidad: cantidad,
    precio: precio,
    subtotal: cantidad * precio
  });

  nombreInput.value = '';
  cantInput.value = 1;
  precioInput.value = '';

  renderBorrador();
}

function agregarItemManoObra() {
  if (!isAdmin()) {
    alert('No tienes permisos para agregar mano de obra.');
    return;
  }
  const descInput = document.getElementById('manoObraDesc');
  const costoInput = document.getElementById('manoObraCosto');

  const desc = descInput.value.trim();
  const costo = parseFloat(costoInput.value);

  if (!desc) {
    alert('Ingrese la descripción de la mano de obra.');
    return;
  }
  if (isNaN(costo) || costo < 0) {
    alert('Ingrese un costo de mano de obra válido.');
    return;
  }

  borradorCotizacion.items.push({
    id: '_' + Math.random().toString(36).substr(2, 9),
    tipo: 'mano_obra',
    nombre: desc,
    cantidad: 1,
    precio: costo,
    subtotal: costo
  });

  descInput.value = '';
  costoInput.value = '';

  renderBorrador();
}

function eliminarItemBorrador(index) {
  borradorCotizacion.items.splice(index, 1);
  renderBorrador();
}

function calcularTotalesBorrador() {
  let totProd = 0;
  let totMano = 0;

  borradorCotizacion.items.forEach(item => {
    if (item.tipo === 'mano_obra') {
      totMano += item.subtotal;
    } else {
      totProd += item.subtotal;
    }
  });

  const subtotalNeto = totProd + totMano;
  const checkboxItbis = document.getElementById('aplicarItbis');
  const aplicar = checkboxItbis ? checkboxItbis.checked : true;
  borradorCotizacion.aplicarItbis = aplicar;

  const itbis = aplicar ? subtotalNeto * 0.18 : 0;
  const totalGeneral = subtotalNeto + itbis;

  document.getElementById('totProd').innerText = formatCurrency(totProd);
  document.getElementById('totMano').innerText = formatCurrency(totMano);
  document.getElementById('totNeto').innerText = formatCurrency(subtotalNeto);
  document.getElementById('totItbis').innerText = formatCurrency(itbis);
  document.getElementById('totGeneral').innerText = formatCurrency(totalGeneral);

  return {
    subtotalProductos: totProd,
    subtotalManoObra: totMano,
    subtotalNeto: subtotalNeto,
    itbis: itbis,
    total: totalGeneral,
    aplicarItbis: aplicar
  };
}

function renderBorrador() {
  const emptyMsg = document.getElementById('borradorEmptyMsg');
  const detalleDiv = document.getElementById('borradorDetalle');
  const tbody = document.getElementById('tablaBorradorItems');

  if (borradorCotizacion.items.length === 0) {
    emptyMsg.style.display = 'flex';
    detalleDiv.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  detalleDiv.style.display = 'flex';
  tbody.innerHTML = '';

  borradorCotizacion.items.forEach((item, index) => {
    let badgeTipo = '';
    if (item.tipo === 'catalogo') {
      badgeTipo = '<span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;">CAT</span>';
    } else if (item.tipo === 'personalizado') {
      badgeTipo = '<span class="badge badge-warning" style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;">PERS</span>';
    } else {
      badgeTipo = '<span class="badge badge-danger" style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;">MANO</span>';
    }

    tbody.innerHTML += `
      <tr>
        <td style="font-size: 0.85rem;">
          <div style="font-weight: 500; color: #fff;">${item.nombre}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            ${badgeTipo} ${item.tipo !== 'mano_obra' ? `${formatCurrency(item.precio)} c/u` : ''}
          </div>
        </td>
        <td style="text-align: center; font-size: 0.85rem;">${item.tipo === 'mano_obra' ? '-' : item.cantidad}</td>
        <td style="text-align: right; font-weight: 600; font-size: 0.85rem; color: #fff;">${formatCurrency(item.subtotal)}</td>
        <td style="text-align: center;">
          <button class="btn-danger" onclick="eliminarItemBorrador(${index})" style="padding: 4px 8px; font-size: 0.8rem; background: transparent; border: none; box-shadow: none;">
            <i class="fa-solid fa-trash-can" style="color: var(--danger);"></i>
          </button>
        </td>
      </tr>
    `;
  });

  calcularTotalesBorrador();
}

function limpiarBorrador() {
  borradorCotizacion.items = [];

  const clienteSelect = document.getElementById('clienteCotizacion');
  if (clienteSelect) clienteSelect.value = '';

  const prodSelect = document.getElementById('prodCatSelect');
  if (prodSelect) prodSelect.value = '';

  const panel = document.getElementById('prodInfoPanel');
  if (panel) panel.style.display = 'none';

  renderBorrador();
}

function guardarCotizacionBorrador() {
  const session = getSession();
  const isCliente = session && session.role === 'cliente';

  let clienteId = '';
  let clienteNombre = '';

  if (isCliente) {
    clienteId = session.username;
    clienteNombre = session.displayName;
  } else {
    const clienteSelect = document.getElementById('clienteCotizacion');
    clienteId = clienteSelect.value;

    if (!clienteId) {
      alert('Por favor, selecciona un cliente para la cotizaciÃ³n.');
      return;
    }

    const clienteObj = clientes.find(c => c.id === clienteId);
    clienteNombre = clienteObj ? clienteObj.nombre : 'Cliente Desconocido';
  }

  if (borradorCotizacion.items.length === 0) {
    alert('Por favor, agrega al menos un producto o mano de obra a la cotizaciÃ³n.');
    return;
  }

  const totales = calcularTotalesBorrador();

  // Descontar stock para productos del catÃ¡logo
  borradorCotizacion.items.forEach(item => {
    if (item.tipo === 'catalogo') {
      const prodObj = productos.find(p => p.id === item.id);
      if (prodObj) {
        prodObj.stock = Math.max(0, prodObj.stock - item.cantidad);
      }
    }
  });

  // Guardar cotizaciÃ³n con desglose completo
  cotizaciones.push({
    id: '_' + Math.random().toString(36).substr(2, 9),
    clienteNombre,
    clienteId,
    items: JSON.parse(JSON.stringify(borradorCotizacion.items)),
    monto: totales.total,
    subtotalProductos: totales.subtotalProductos,
    subtotalManoObra: totales.subtotalManoObra,
    subtotalNeto: totales.subtotalNeto,
    itbis: totales.itbis,
    itbisPorcentaje: totales.aplicarItbis ? 18 : 0,
    fecha: new Date().toLocaleDateString('es-DO')
  });

  limpiarBorrador();
  saveState();

  // Enviar copia de la cotización a WhatsApp
  const whatsappNumber = '18094393928';
  const message = `Hola, se ha generado una nueva cotización para ${clienteNombre}.
Total: ${formatCurrency(totales.total)}
Fecha: ${new Date().toLocaleDateString('es-DO')}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

function eliminarCotizacion(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para eliminar cotizaciones.');
    return;
  }
  if (confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
    cotizaciones = cotizaciones.filter(c => c.id !== id);
    saveState();
  }
}

function actualizarCotizacionesList() {
  const lista = document.getElementById('listaCotizaciones');
  lista.innerHTML = '';

  const session = getSession();
  const isCliente = session && session.role === 'cliente';

  const cotsToDisplay = isCliente
    ? cotizaciones.filter(c => c.clienteId === session.username)
    : cotizaciones;

  if (cotsToDisplay.length === 0) {
    lista.innerHTML = `<li style="text-align: center; color: var(--text-secondary); list-style: none; padding: 20px;">No hay cotizaciones registradas.</li>`;
    return;
  }

  cotsToDisplay.forEach(c => {
    lista.innerHTML += `
      <li class="modern-list-item">
        <div class="list-item-info">
          <div class="list-item-avatar" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success);">
            <i class="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div style="font-weight: 500; color: #fff;">${c.clienteNombre}</div>
            <div class="list-item-meta">Fecha: ${c.fecha}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-weight: 600; color: var(--success); font-size: 1.1rem; margin-right: 8px;">
            ${formatCurrency(c.monto)}
          </div>
          <button onclick="descargarCotizacionPDF('${c.id}')" style="padding: 8px 14px; font-size: 0.85rem; background-color: var(--accent); color: white; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-file-pdf"></i> PDF
          </button>
          ${isAdmin() ? `
          <button class="btn-danger" onclick="eliminarCotizacion('${c.id}')" style="padding: 8px 12px; font-size: 0.85rem;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          ` : ''}
        </div>
      </li>
    `;
  });
}

async function descargarCotizacionPDF(id) {
  const c = cotizaciones.find(item => item.id === id);
  if (!c) {
    alert('CotizaciÃ³n no encontrada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Load logo as base64
  let logoImgData = null;
  try {
    const response = await fetch('logo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    logoImgData = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error loading logo:', e);
  }

  // Define Colors
  const darkBlue = [2, 27, 69];
  const brightBlue = [0, 85, 184];
  const lightGrey = [245, 247, 250];

  // --- HEADER BACKGROUND ---
  // Bright blue curve behind
  doc.setFillColor(brightBlue[0], brightBlue[1], brightBlue[2]);
  doc.ellipse(105, 45, 120, 12, "F");
  
  // Dark blue curve and rect
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.ellipse(105, 43, 120, 12, "F");
  doc.rect(0, 0, 210, 43, "F");

  // --- HEADER CONTENT ---
  if (logoImgData) {
    doc.addImage(logoImgData, 'PNG', 12, 10, 30, 30);
  }

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("WKW VENTAS E INSTALACIONES", 46, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text("Seguridad | Confianza | Calidad", 46, 27);
  doc.text("Camaras - Redes - Instalaciones - Soporte Tecnico", 46, 33);
  doc.text("Santo Domingo, Republica Dominicana", 46, 39);

  // --- MIDDLE SECTION (INFO) ---
  const startY = 75;

  // DATOS DE LA COTIZACION
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.circle(20, startY - 1.5, 3.5, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text("DATOS DE LA COTIZACION", 28, startY);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`Cotizacion ID: #${c.id.toUpperCase()}`, 28, startY + 8);
  doc.text(`Fecha de Emision: ${c.fecha}`, 28, startY + 14);
  doc.text(`Validez: 15 dias`, 28, startY + 20);

  // Vertical Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(105, startY - 5, 105, startY + 22);

  // CLIENTE
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.circle(120, startY - 1.5, 3.5, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text("CLIENTE", 128, startY);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(c.clienteNombre, 128, startY + 8);
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(brightBlue[0], brightBlue[1], brightBlue[2]);
  doc.text("v Cliente Registrado", 128, startY + 14);

  // --- TABLE HEADER ---
  let currentY = 110;
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(15, currentY, 180, 10, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Descripcion del Servicio / Concepto", 20, currentY + 6.5);
  doc.text("Cant.", 125, currentY + 6.5, { align: "center" });
  doc.text("P. Unitario", 160, currentY + 6.5, { align: "right" });
  doc.text("Total", 190, currentY + 6.5, { align: "right" });

  currentY += 10;

  // --- TABLE ROWS ---
  const items = c.items || [{ nombre: "Servicios Integrales de Ventas, Suministro e InstalaciÃ³n", cantidad: 1, precio: c.monto, subtotal: c.monto, tipo: 'personalizado' }];

  items.forEach((item, index) => {
    // Check if we need a new page
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    let nombreConcepto = item.nombre;
    if (item.tipo === 'mano_obra') {
      nombreConcepto = `[Mano de Obra] ${nombreConcepto}`;
    }
    if (nombreConcepto.length > 55) {
      nombreConcepto = nombreConcepto.substring(0, 52) + "...";
    }

    doc.text(nombreConcepto, 20, currentY + 5.5);

    if (item.tipo === 'mano_obra') {
      doc.text("-", 125, currentY + 5.5, { align: "center" });
      doc.text("-", 160, currentY + 5.5, { align: "right" });
    } else {
      doc.text(item.cantidad.toString(), 125, currentY + 5.5, { align: "center" });
      doc.text(formatCurrency(item.precio), 160, currentY + 5.5, { align: "right" });
    }

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.text(formatCurrency(item.subtotal), 190, currentY + 5.5, { align: "right" });

    currentY += 8;
  });

  // Bottom table border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 2, 195, currentY + 2);
  currentY += 10;

  // --- TOTALS ---
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  let subtotalProductos = c.subtotalProductos !== undefined ? c.subtotalProductos : c.monto;
  let subtotalManoObra = c.subtotalManoObra !== undefined ? c.subtotalManoObra : 0;
  let subtotalNeto = c.subtotalNeto !== undefined ? c.subtotalNeto : c.monto;
  let itbis = c.itbis !== undefined ? c.itbis : 0;
  let itbisPorcentaje = c.itbisPorcentaje !== undefined ? c.itbisPorcentaje : 0;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  doc.text("Subtotal Productos:", 115, currentY);
  doc.text(formatCurrency(subtotalProductos), 190, currentY, { align: 'right' });

  // Dotted line separator for totals (simulating it with simple line)
  doc.setDrawColor(230, 230, 230);
  doc.line(150, currentY + 2, 190, currentY + 2);

  doc.text("Mano de Obra:", 115, currentY + 6);
  doc.text(formatCurrency(subtotalManoObra), 190, currentY + 6, { align: 'right' });
  doc.line(150, currentY + 8, 190, currentY + 8);

  doc.text("Subtotal Neto:", 115, currentY + 12);
  doc.text(formatCurrency(subtotalNeto), 190, currentY + 12, { align: 'right' });
  doc.line(150, currentY + 14, 190, currentY + 14);

  doc.text(`ITBIS (${itbisPorcentaje.toFixed(1)}%):`, 115, currentY + 18);
  doc.text(formatCurrency(itbis), 190, currentY + 18, { align: 'right' });

  currentY += 24;

  // TOTAL BAR
  doc.setFillColor(brightBlue[0], brightBlue[1], brightBlue[2]);
  doc.rect(115, currentY, 80, 14, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", 120, currentY + 9.5);
  doc.text(formatCurrency(c.monto), 190, currentY + 9.5, { align: 'right' });

  // --- FOOTER ---
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 265, 210, 32, "F"); 

  // Shield icon (circle with check)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.circle(20, 280, 5);
  doc.line(18, 280, 19.5, 281.5);
  doc.line(19.5, 281.5, 22, 278);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Gracias por confiar en nosotros.", 30, 278);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text("Estamos comprometidos con su seguridad.", 30, 284);

  doc.setDrawColor(100, 100, 150);
  doc.setLineWidth(0.5);
  doc.line(100, 273, 100, 287);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  // Using small circles as bullets for contact info
  doc.setFillColor(255, 255, 255);
  doc.circle(108, 275, 1, "F");
  doc.text("180-943-93928", 112, 276);
  
  doc.circle(108, 281, 1, "F");
  doc.text("wkwinstalaciones.com", 112, 282);
  
  doc.circle(108, 287, 1, "F");
  doc.text("ventas@wkwinstalaciones.com", 112, 288);

  // --- SAVE ---
  doc.save(`cotizacion_${c.clienteNombre.replace(/\s+/g, '_')}_${c.fecha.replace(/\//g, '-')}.pdf`);
}

// Rellenar dinÃ¡micamente select de clientes en cotizaciÃ³n
function actualizarClientesDropdown() {
  const select = document.getElementById('clienteCotizacion');
  // Guardamos la selecciÃ³n actual por si acaso
  const selectedVal = select.value;
  select.innerHTML = '<option value="">Seleccione un cliente...</option>';

  clientes.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });

  // Restaurar selecciÃ³n previa
  select.value = selectedVal;
}

// --- ACTUALIZACIÓN GLOBAL DE LA INTERFAZ ---

function actualizarUI() {
  // 1. Tablas y Listas
  actualizarProductosView();
  
  // Asegurar la correcta visibilidad según la vista activa
  const tblContainer = document.querySelector('#productos .table-container');
  const galContainer = document.getElementById('galeriaProductos');
  const btnTabla = document.getElementById('btnVistaTabla');
  const btnGaleria = document.getElementById('btnVistaGaleria');
  if (tblContainer && galContainer) {
    if (vistaProductos === 'tabla') {
      tblContainer.classList.remove('oculto');
      galContainer.classList.add('oculto');
      if (btnTabla) btnTabla.classList.add('active');
      if (btnGaleria) btnGaleria.classList.remove('active');
    } else {
      tblContainer.classList.add('oculto');
      galContainer.classList.remove('oculto');
      if (btnTabla) btnTabla.classList.remove('active');
      if (btnGaleria) btnGaleria.classList.add('active');
    }
  }

  actualizarClientesList();
  actualizarCotizacionesList();
  actualizarClientesDropdown();
  actualizarProductosDropdownCotizacion();

  // Ocultar/mostrar campos de cliente según rol
  const session = getSession();
  const isCliente = session && session.role === 'cliente';
  const containerSelect = document.getElementById('clienteCotizacionContainer');
  const containerReadonly = document.getElementById('clienteCotizacionReadonly');
  const textReadonly = document.getElementById('clienteNombreReadonly');

  if (isCliente) {
    if (containerSelect) containerSelect.style.display = 'none';
    if (containerReadonly) containerReadonly.style.display = 'block';
    if (textReadonly) textReadonly.innerText = session.displayName;
  } else {
    if (containerSelect) containerSelect.style.display = 'block';
    if (containerReadonly) containerReadonly.style.display = 'none';
  }

  // 2. Dashboard KPI Counters
  document.getElementById('totalProductos').innerText = productos.length;
  document.getElementById('totalClientes').innerText = clientes.length;
  document.getElementById('totalCotizaciones').innerText = cotizaciones.length;

  // 3. Reportes KPI Counters
  document.getElementById('rProductos').innerText = productos.length;
  document.getElementById('rClientes').innerText = clientes.length;

  const totalMonto = cotizaciones.reduce((acc, curr) => acc + curr.monto, 0);
  document.getElementById('rMontoTotal').innerText = formatCurrency(totalMonto);

  // 4. Reporte Detallado de Inventario (Stock bajo / Agotado)
  const reporteDiv = document.getElementById('reporteInventario');
  const productosAgotados = productos.filter(p => p.stock === 0);
  const productosBajoStock = productos.filter(p => p.stock > 0 && p.stock <= 5);

  let reporteHtml = '';

  if (productos.length === 0) {
    reporteHtml = '<p style="color: var(--text-secondary);">Agregue productos para ver alertas de stock.</p>';
  } else if (productosAgotados.length === 0 && productosBajoStock.length === 0) {
    reporteHtml = `
      <div style="display: flex; align-items: center; gap: 10px; color: var(--success);">
        <i class="fa-solid fa-circle-check"></i>
        <span>¡Todo el inventario cuenta con stock suficiente!</span>
      </div>
    `;
  } else {
    if (productosAgotados.length > 0) {
      reporteHtml += `
        <div style="margin-bottom: 15px;">
          <h4 style="color: var(--danger); font-size: 0.95rem; margin-bottom: 5px;">Agotados (${productosAgotados.length})</h4>
          <ul style="padding-left: 20px; color: var(--text-secondary);">
            ${productosAgotados.map(p => `<li>${p.nombre}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    if (productosBajoStock.length > 0) {
      reporteHtml += `
        <div>
          <h4 style="color: var(--warning); font-size: 0.95rem; margin-bottom: 5px;">Stock Crítico / Bajo (${productosBajoStock.length})</h4>
          <ul style="padding-left: 20px; color: var(--text-secondary);">
            ${productosBajoStock.map(p => `<li>${p.nombre} (${p.stock} uds.)</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  reporteDiv.innerHTML = reporteHtml;
}

// --- FUNCIONES DE LOGIN / LOGOUT ---

function handleLogin(event) {
  event.preventDefault();

  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  const errorDiv = document.getElementById('loginError');
  const errorMsg = document.getElementById('loginErrorMsg');
  const loginBtn = document.getElementById('loginBtn');

  // Limpiar error previo
  errorDiv.classList.remove('visible');

  const result = login(userInput.value, passInput.value);

  if (result.success) {
    loginBtn.classList.add('loading');
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ingresando...';

    setTimeout(() => {
      // Ocultar login y mostrar app
      const loginScreen = document.getElementById('loginScreen');
      const sidebar = document.querySelector('.sidebar');
      const contenido = document.querySelector('.contenido');

      if (loginScreen) loginScreen.classList.add('hidden');
      if (sidebar) sidebar.style.display = '';
      if (contenido) contenido.style.display = '';

      applyRoleRestrictions();
      
      const session = getSession();
      if (session && session.role === 'cliente') {
        mostrar('productos');
      } else {
        mostrar('dashboard');
      }

      actualizarUI();

      // Resetear formulario
      loginBtn.classList.remove('loading');
      loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión';
      userInput.value = '';
      passInput.value = '';
    }, 600);
  } else {
    errorMsg.textContent = result.error;
    errorDiv.classList.add('visible');

    // Shake animation
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight; // trigger reflow
    card.style.animation = 'shake 0.5s ease';
  }
}

function cerrarSesion() {
  if (confirm('¿Deseas cerrar la sesión?')) {
    logout();
  }
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPass');
  const icon = document.getElementById('togglePassIcon');

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Exportar funciones globalmente para enlaces onclick de HTML (debido al type="module")
window.mostrar = mostrar;
window.agregarProducto = agregarProducto;
window.eliminarProducto = eliminarProducto;
window.aumentarStock = aumentarStock;
window.modificarPrecio = modificarPrecio;
window.agregarCliente = agregarCliente;
window.eliminarCliente = eliminarCliente;
window.eliminarCotizacion = eliminarCotizacion;
window.descargarCotizacionPDF = descargarCotizacionPDF;
window.switchTab = switchTab;
window.seleccionarProductoCatalogo = seleccionarProductoCatalogo;
window.validarCantCatalogo = validarCantCatalogo;
window.agregarItemCatalogo = agregarItemCatalogo;
window.agregarItemPersonalizado = agregarItemPersonalizado;
window.agregarItemManoObra = agregarItemManoObra;
window.eliminarItemBorrador = eliminarItemBorrador;
window.calcularTotalesBorrador = calcularTotalesBorrador;
window.limpiarBorrador = limpiarBorrador;
window.guardarCotizacionBorrador = guardarCotizacionBorrador;
window.cambiarVistaProductos = cambiarVistaProductos;
function showRegisterForm(event) {
  if (event) event.preventDefault();
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.querySelector('.login-title');
  const subtitle = document.querySelector('.login-subtitle');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) {
    registerForm.style.display = 'flex';
    registerForm.classList.remove('hidden');
  }
  if (title) title.innerText = 'Crea tu Cuenta';
  if (subtitle) subtitle.innerText = 'Regístrate en el panel de inventario';
}

function showLoginForm(event) {
  if (event) event.preventDefault();
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.querySelector('.login-title');
  const subtitle = document.querySelector('.login-subtitle');
  
  if (loginForm) loginForm.style.display = 'flex';
  if (registerForm) registerForm.style.display = 'none';
  if (title) title.innerText = 'WKW Security';
  if (subtitle) subtitle.innerText = 'Accede al panel de inventario';
}

function handleRegister(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('regName');
  const userInput = document.getElementById('regUser');
  const passInput = document.getElementById('regPass');
  const roleSelect = document.getElementById('regRole');
  const errorDiv = document.getElementById('regError');
  const errorMsg = document.getElementById('regErrorMsg');
  const regBtn = document.getElementById('regBtn');
  
  if (errorDiv) errorDiv.classList.remove('visible');
  
  const name = nameInput.value;
  const user = userInput.value;
  const pass = passInput.value;
  const role = roleSelect ? roleSelect.value : 'cliente';
  
  const result = registerUser(name, user, pass, role);
  
  if (result.success) {
    if (regBtn) {
      regBtn.classList.add('loading');
      regBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
    }
    
    setTimeout(() => {
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      
      // Limpiar campos
      nameInput.value = '';
      userInput.value = '';
      passInput.value = '';
      
      if (regBtn) {
        regBtn.classList.remove('loading');
        regBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrarse';
      }
      
      // Mostrar login
      showLoginForm();
      
      // Poner el usuario en el campo de login
      const loginUser = document.getElementById('loginUser');
      if (loginUser) {
        loginUser.value = user;
        const loginPass = document.getElementById('loginPass');
        if (loginPass) loginPass.focus();
      }
    }, 800);
  } else {
    if (errorMsg) errorMsg.textContent = result.error;
    if (errorDiv) errorDiv.classList.add('visible');
    
    // Shake animation
    const card = document.querySelector('.login-card');
    if (card) {
      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = 'shake 0.5s ease';
    }
  }
}

window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.cerrarSesion = cerrarSesion;
window.togglePasswordVisibility = togglePasswordVisibility;

// Inicializar la aplicación al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  // Primero verificar autenticación
  const loggedIn = initAuth();

  if (loggedIn) {
    const session = getSession();
    if (session && session.role === 'cliente') {
      mostrar('productos');
    }
    actualizarUI();
  }

  // Escuchar carga de imagen personalizada
  const imgInput = document.getElementById('imagenProducto');
  if (imgInput) {
    imgInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (loginScreen) loginScreen.classList.add('hidden');
      if (sidebar) sidebar.style.display = '';
      if (contenido) contenido.style.display = '';

      applyRoleRestrictions();
      
      const session = getSession();
      if (session && session.role === 'cliente') {
        mostrar('productos');
      } else {
        mostrar('dashboard');
      }

      actualizarUI();

      // Resetear formulario
      loginBtn.classList.remove('loading');
      loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión';
      userInput.value = '';
      passInput.value = '';
    }, 600);
  } else {
    errorMsg.textContent = result.error;
    errorDiv.classList.add('visible');

    // Shake animation
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight; // trigger reflow
    card.style.animation = 'shake 0.5s ease';
  }
}

function cerrarSesion() {
  if (confirm('¿Deseas cerrar la sesión?')) {
    logout();
  }
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPass');
  const icon = document.getElementById('togglePassIcon');

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Exportar funciones globalmente para enlaces onclick de HTML (debido al type="module")
window.mostrar = mostrar;
window.agregarProducto = agregarProducto;
window.eliminarProducto = eliminarProducto;
window.aumentarStock = aumentarStock;
window.modificarPrecio = modificarPrecio;
window.agregarCliente = agregarCliente;
window.eliminarCliente = eliminarCliente;
window.eliminarCotizacion = eliminarCotizacion;
window.descargarCotizacionPDF = descargarCotizacionPDF;
window.switchTab = switchTab;
window.seleccionarProductoCatalogo = seleccionarProductoCatalogo;
window.validarCantCatalogo = validarCantCatalogo;
window.agregarItemCatalogo = agregarItemCatalogo;
window.agregarItemPersonalizado = agregarItemPersonalizado;
window.agregarItemManoObra = agregarItemManoObra;
window.eliminarItemBorrador = eliminarItemBorrador;
window.calcularTotalesBorrador = calcularTotalesBorrador;
window.limpiarBorrador = limpiarBorrador;
window.guardarCotizacionBorrador = guardarCotizacionBorrador;
window.cambiarVistaProductos = cambiarVistaProductos;
function showRegisterForm(event) {
  if (event) event.preventDefault();
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.querySelector('.login-title');
  const subtitle = document.querySelector('.login-subtitle');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) {
    registerForm.style.display = 'flex';
    registerForm.classList.remove('hidden');
  }
  if (title) title.innerText = 'Crea tu Cuenta';
  if (subtitle) subtitle.innerText = 'Regístrate en el panel de inventario';
}

function showLoginForm(event) {
  if (event) event.preventDefault();
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.querySelector('.login-title');
  const subtitle = document.querySelector('.login-subtitle');
  
  if (loginForm) loginForm.style.display = 'flex';
  if (registerForm) registerForm.style.display = 'none';
  if (title) title.innerText = 'WKW Security';
  if (subtitle) subtitle.innerText = 'Accede al panel de inventario';
}

function handleRegister(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('regName');
  const userInput = document.getElementById('regUser');
  const passInput = document.getElementById('regPass');
  const roleSelect = document.getElementById('regRole');
  const errorDiv = document.getElementById('regError');
  const errorMsg = document.getElementById('regErrorMsg');
  const regBtn = document.getElementById('regBtn');
  
  if (errorDiv) errorDiv.classList.remove('visible');
  
  const name = nameInput.value;
  const user = userInput.value;
  const pass = passInput.value;
  const role = roleSelect ? roleSelect.value : 'cliente';
  
  const result = registerUser(name, user, pass, role);
  
  if (result.success) {
    if (regBtn) {
      regBtn.classList.add('loading');
      regBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
    }
    
    setTimeout(() => {
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      
      // Limpiar campos
      nameInput.value = '';
      userInput.value = '';
      passInput.value = '';
      
      if (regBtn) {
        regBtn.classList.remove('loading');
        regBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrarse';
      }
      
      // Mostrar login
      showLoginForm();
      
      // Poner el usuario en el campo de login
      const loginUser = document.getElementById('loginUser');
      if (loginUser) {
        loginUser.value = user;
        const loginPass = document.getElementById('loginPass');
        if (loginPass) loginPass.focus();
      }
    }, 800);
  } else {
    if (errorMsg) errorMsg.textContent = result.error;
    if (errorDiv) errorDiv.classList.add('visible');
    
    // Shake animation
    const card = document.querySelector('.login-card');
    if (card) {
      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = 'shake 0.5s ease';
    }
  }
}

window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.cerrarSesion = cerrarSesion;
window.togglePasswordVisibility = togglePasswordVisibility;

// Inicializar la aplicación al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  // Primero verificar autenticación
  const loggedIn = initAuth();

  if (loggedIn) {
    const session = getSession();
    if (session && session.role === 'cliente') {
      mostrar('productos');
    }
    actualizarUI();
  }

  // Escuchar carga de imagen personalizada
  const imgInput = document.getElementById('imagenProducto');
  if (imgInput) {
    imgInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          tempProductImageBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        tempProductImageBase64 = '';
      }
    });
  }

  // Video handling variables
  let videos = JSON.parse(localStorage.getItem('pro_videos')) || [];
  const renderVideos = () => {
    const gallery = document.querySelector('#videos .video-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    videos.forEach((v, idx) => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.style.width = '320px';
      div.innerHTML = `<video controls preload="metadata" style="width:100%;border-radius:8px;">
                         <source src="${v.dataUrl}" type="${v.type}">
                       </video>
                       <p style="margin-top:5px;color:var(--text-primary);font-weight:500;">${v.name}</p>`;
      gallery.appendChild(div);
    });
  };
  // Initial render of stored videos
  renderVideos();
  // Video upload handling
  const videoInput = document.getElementById('videoFileInput');
  const uploadBtn = document.getElementById('uploadVideoBtn');
  if (videoInput && uploadBtn) {
    uploadBtn.addEventListener('click', () => videoInput.click());
    videoInput.addEventListener('change', (e) => {
      const files = e.target.files;
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          videos.push({ name: file.name, type: file.type, dataUrl });
          localStorage.setItem('pro_videos', JSON.stringify(videos));
          renderVideos();
        };
        reader.readAsDataURL(file);
      });
    });
  }
});
