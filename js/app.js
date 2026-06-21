import { login, logout, isAdmin, isLoggedIn, initAuth, applyRoleRestrictions, getSession, registerUser } from './auth.js';

// Configuración de Cloudinary
let cloudinaryCloudName = localStorage.getItem('cloudinary_cloud_name') || 'dywuqsrmm';
let cloudinaryUploadPreset = localStorage.getItem('cloudinary_upload_preset') || 'wkw_videos';

function inicializarInputsCloudinary() {
  const nameInput = document.getElementById('cloudinaryCloudName');
  const presetInput = document.getElementById('cloudinaryUploadPreset');
  if (nameInput) nameInput.value = cloudinaryCloudName;
  if (presetInput) presetInput.value = cloudinaryUploadPreset;
}

function guardarConfigCloudinary() {
  const nameInput = document.getElementById('cloudinaryCloudName');
  const presetInput = document.getElementById('cloudinaryUploadPreset');
  const statusMsg = document.getElementById('cloudinaryStatusMsg');
  
  if (nameInput) cloudinaryCloudName = nameInput.value.trim();
  if (presetInput) cloudinaryUploadPreset = presetInput.value.trim();
  
  localStorage.setItem('cloudinary_cloud_name', cloudinaryCloudName);
  localStorage.setItem('cloudinary_upload_preset', cloudinaryUploadPreset);
  
  if (statusMsg) {
    statusMsg.style.display = 'inline-flex';
    setTimeout(() => {
      statusMsg.style.display = 'none';
    }, 3000);
  }
}

window.guardarConfigCloudinary = guardarConfigCloudinary;

/**
 * Sube un archivo a Cloudinary usando Unsigned Uploads.
 * @param {File|string} file - El archivo a subir.
 * @param {string} resourceType - El tipo de recurso ('image' o 'video').
 * @returns {Promise<string>} La URL segura del archivo subido.
 */
async function uploadFileToCloudinary(file, resourceType = 'image') {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error('Cloudinary no está configurado. Por favor, ingresa tu Cloud Name y Upload Preset.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryUploadPreset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Error al subir el archivo a Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
}

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
let ventas = JSON.parse(localStorage.getItem('pro_ventas')) || [];
let cart = JSON.parse(localStorage.getItem('pro_cart')) || [];

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
  localStorage.setItem('pro_ventas', JSON.stringify(ventas));
  actualizarUI();
}

// Formatear monedas
function formatCurrency(monto) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(monto);
}

// --- CRUD PRODUCTOS ---

async function agregarProducto() {
  if (!isAdmin()) {
    alert('No tienes permisos para agregar productos.');
    return;
  }
  const nombreInput = document.getElementById('nombreProducto');
  const precioInput = document.getElementById('precioProducto');
  const stockInput = document.getElementById('stockProducto');
  const categoriaSelect = document.getElementById('categoriaProducto');
  const imgInput = document.getElementById('imagenProducto');
  const addBtn = document.getElementById('btnAgregarProducto');

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

  let imagen = defaultImages[categoria] || defaultImages['otros'];
  const hasCustomImage = imgInput && imgInput.files && imgInput.files[0];
  const isCloudConfigured = cloudinaryCloudName && cloudinaryUploadPreset;

  if (hasCustomImage) {
    if (isCloudConfigured) {
      // Subida a Cloudinary
      const originalHtml = addBtn ? addBtn.innerHTML : '';
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo...';
      }

      try {
        const file = imgInput.files[0];
        const imageUrl = await uploadFileToCloudinary(file, 'image');
        imagen = imageUrl;
      } catch (error) {
        console.error(error);
        alert('Error al subir la imagen a Cloudinary: ' + error.message);
        if (addBtn) {
          addBtn.disabled = false;
          addBtn.innerHTML = originalHtml;
        }
        return;
      }
    } else {
      // Fallback local base64
      imagen = tempProductImageBase64 || defaultImages[categoria] || defaultImages['otros'];
    }
  }

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

  if (addBtn) {
    addBtn.disabled = false;
    addBtn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Agregar';
  }

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

    const canAdd = p.stock > 0;
    const addCartBtn = canAdd 
      ? `<button onclick="agregarAlCarrito('${p.id}')" style="padding: 6px 12px; font-size: 0.85rem; background-color: var(--accent-glow); color: var(--accent); border: 1px solid rgba(99, 102, 241, 0.2);" title="Añadir al carrito">
           <i class="fa-solid fa-cart-plus"></i>
         </button>`
      : `<button disabled style="padding: 6px 12px; font-size: 0.85rem; opacity: 0.5;" title="Agotado">
           <i class="fa-solid fa-cart-plus"></i>
         </button>`;

    const deleteBtn = isAdmin()
      ? `<button class="btn-danger" onclick="eliminarProducto('${p.id}')" style="padding: 6px 12px; font-size: 0.85rem;" title="Eliminar Producto">
           <i class="fa-solid fa-trash-can"></i>
         </button>`
      : '';

    tbody.innerHTML += `
      <tr>
        <td data-label="Producto">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${p.imagen}" alt="${p.nombre}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 500; color: #fff;">${p.nombre}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${categoryNames[p.categoria] || 'Otros'}</div>
            </div>
          </div>
        </td>
        <td data-label="Precio">
          ${formatCurrency(p.precio)}
          ${isAdmin() ? `<button class="btn-success" onclick="modificarPrecio('${p.id}')" style="padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;" title="Modificar Precio"><i class="fa-solid fa-dollar-sign"></i></button>` : ''}
        </td>
        <td data-label="Stock">
          ${p.stock} uds
          ${isAdmin() ? `<button class="btn-success" onclick="aumentarStock('${p.id}')" style="padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;">+</button>` : ''}
        </td>
        <td data-label="Estado">${statusBadge}</td>
        <td data-label="Acciones" style="text-align: center; white-space: nowrap;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            ${addCartBtn}
            ${deleteBtn}
          </div>
        </td>
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
          
          <button class="btn-add-cart" onclick="agregarAlCarrito('${p.id}')" style="width: 100%; margin-bottom: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" ${p.stock === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i> ${p.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
          </button>

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

// =============================================
// SISTEMA DE CARRITO DE COMPRAS & VENTAS
// =============================================

function showToast(msg) {
  const toast = document.getElementById('toastNotif');
  const toastText = document.getElementById('toastNotifText');
  if (toast && toastText) {
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

function abrirCarrito() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    renderCarrito();
    actualizarClientesDropdownCarrito();
  }
}

function cerrarCarrito() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  if (prod.stock <= 0) {
    alert('El producto no cuenta con stock disponible.');
    return;
  }

  const existing = cart.find(item => item.id === id);
  if (existing) {
    if (existing.quantity >= prod.stock) {
      alert(`No puedes agregar más unidades de ${prod.nombre}. Stock disponible: ${prod.stock}`);
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen: prod.imagen,
      quantity: 1
    });
  }

  localStorage.setItem('pro_cart', JSON.stringify(cart));
  actualizarCartBadge();
  showToast(`¡${prod.nombre} agregado al carrito!`);
}

function cambiarCantidadCarrito(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  const prod = productos.find(p => p.id === id);
  const maxStock = prod ? prod.stock : 999;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    eliminarDelCarrito(id);
    return;
  }

  if (newQty > maxStock) {
    alert(`No hay stock suficiente. Stock máximo: ${maxStock}`);
    return;
  }

  item.quantity = newQty;
  localStorage.setItem('pro_cart', JSON.stringify(cart));
  renderCarrito();
  actualizarCartBadge();
}

function eliminarDelCarrito(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('pro_cart', JSON.stringify(cart));
  renderCarrito();
  actualizarCartBadge();
  showToast('Producto eliminado del carrito.');
}

function vaciarCarrito() {
  if (cart.length === 0) return;
  if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    cart = [];
    localStorage.setItem('pro_cart', JSON.stringify(cart));
    renderCarrito();
    actualizarCartBadge();
    showToast('Carrito vaciado.');
  }
}

function actualizarCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (!badge) return;
  const count = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  if (count > 0) {
    badge.innerText = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderCarrito() {
  const container = document.getElementById('cartDrawerBody');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Tu carrito está vacío</p>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">Agrega productos desde la sección de Productos.</span>
      </div>
    `;
    document.getElementById('cartSubtotal').innerText = formatCurrency(0);
    document.getElementById('cartItbisVal').innerText = formatCurrency(0);
    document.getElementById('cartTotal').innerText = formatCurrency(0);
    return;
  }

  container.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.precio * item.quantity;
    subtotal += itemTotal;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title" title="${item.nombre}">${item.nombre}</div>
          <div class="cart-item-price">${formatCurrency(item.precio)}</div>
          <div class="cart-item-qty">
            <button class="btn-qty" onclick="cambiarCantidadCarrito('${item.id}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="btn-qty" onclick="cambiarCantidadCarrito('${item.id}', 1)">+</button>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div class="cart-item-total">${formatCurrency(itemTotal)}</div>
          <button class="btn-cart-remove" onclick="eliminarDelCarrito('${item.id}')" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `;
  });

  const aplicarItbis = document.getElementById('cartItbis').checked;
  const itbis = aplicarItbis ? subtotal * 0.18 : 0;
  const total = subtotal + itbis;

  document.getElementById('cartSubtotal').innerText = formatCurrency(subtotal);
  document.getElementById('cartItbisVal').innerText = formatCurrency(itbis);
  document.getElementById('cartTotal').innerText = formatCurrency(total);
}

function actualizarClientesDropdownCarrito() {
  const session = getSession();
  const isCliente = session && session.role === 'cliente';

  const containerSelect = document.getElementById('cartClientSelectContainer');
  const containerReadonly = document.getElementById('cartClientReadonlyContainer');
  const textReadonly = document.getElementById('cartClienteReadonly');
  const select = document.getElementById('cartCliente');

  if (isCliente) {
    if (containerSelect) containerSelect.style.display = 'none';
    if (containerReadonly) containerReadonly.style.display = 'block';
    if (textReadonly) textReadonly.innerText = session.displayName;
  } else {
    if (containerSelect) containerSelect.style.display = 'block';
    if (containerReadonly) containerReadonly.style.display = 'none';
    
    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">Seleccione un cliente...</option>';
      clientes.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
      });
      select.value = currentVal;
    }
  }
}

function confirmarVenta() {
  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const session = getSession();
  const isCliente = session && session.role === 'cliente';

  let clienteId = '';
  let clienteNombre = '';

  if (isCliente) {
    clienteId = session.username;
    clienteNombre = session.displayName;
  } else {
    const select = document.getElementById('cartCliente');
    clienteId = select ? select.value : '';

    if (!clienteId) {
      alert('Por favor, selecciona un cliente para registrar la venta.');
      return;
    }

    const clienteObj = clientes.find(c => c.id === clienteId);
    clienteNombre = clienteObj ? clienteObj.nombre : 'Cliente Desconocido';
  }

  // Verificar stock una última vez
  for (const item of cart) {
    const prod = productos.find(p => p.id === item.id);
    if (!prod || prod.stock < item.quantity) {
      alert(`Stock insuficiente para ${item.nombre}. Stock actual: ${prod ? prod.stock : 0}`);
      return;
    }
  }

  // Procesar deducción de stock
  cart.forEach(item => {
    const prod = productos.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  // Calcular totales
  let subtotal = cart.reduce((acc, curr) => acc + (curr.precio * curr.quantity), 0);
  const aplicarItbis = document.getElementById('cartItbis').checked;
  const itbis = aplicarItbis ? subtotal * 0.18 : 0;
  const total = subtotal + itbis;

  const facturaId = '_' + Math.random().toString(36).substr(2, 9);
  const nuevaVenta = {
    id: facturaId,
    clienteId,
    clienteNombre,
    items: JSON.parse(JSON.stringify(cart)),
    subtotal,
    itbis,
    itbisPorcentaje: aplicarItbis ? 18 : 0,
    total,
    fecha: new Date().toLocaleDateString('es-DO')
  };

  // Guardar venta
  ventas.push(nuevaVenta);
  
  // Limpiar carrito
  cart = [];
  localStorage.setItem('pro_cart', JSON.stringify(cart));
  
  // Guardar estado general
  saveState();
  cerrarCarrito();
  actualizarCartBadge();

  alert('¡Venta realizada con éxito!');

  // Enviar copia a WhatsApp
  const whatsappNumber = '18094393928';
  const message = `Hola, se ha completado una venta a ${clienteNombre}.
Factura ID: #${facturaId.toUpperCase()}
Total: ${formatCurrency(total)}
Fecha: ${nuevaVenta.fecha}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  // Descargar factura PDF
  descargarFacturaPDF(facturaId);
}

async function descargarFacturaPDF(id) {
  const v = ventas.find(item => item.id === id);
  if (!v) {
    alert('Factura no encontrada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

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
    console.error('Error cargando logo:', e);
  }

  // Paleta oficial de Ventas (Emerald Green y Dark Slate)
  const darkSlate = [15, 23, 42];
  const emeraldGreen = [16, 185, 129];
  const lightGrey = [245, 247, 250];

  // Header background (Emerald curved band)
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.ellipse(105, 45, 120, 12, "F");
  
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.ellipse(105, 43, 120, 12, "F");
  doc.rect(0, 0, 210, 43, "F");

  // Header content
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

  // Info section
  const startY = 75;

  // Datos factura
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.circle(20, startY - 1.5, 3.5, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("FACTURA DE VENTA", 28, startY);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`Factura ID: #${v.id.toUpperCase()}`, 28, startY + 8);
  doc.text(`Fecha: ${v.fecha}`, 28, startY + 14);
  doc.text(`Método: Pago Contra Entrega`, 28, startY + 20);

  // Separador
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(105, startY - 5, 105, startY + 22);

  // Cliente
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.circle(120, startY - 1.5, 3.5, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("ADQUIRIENTE", 128, startY);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(v.clienteNombre, 128, startY + 8);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text("Transacción Completada", 128, startY + 14);

  // Table header
  let currentY = 110;
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(15, currentY, 180, 10, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Concepto / Producto", 20, currentY + 6.5);
  doc.text("Cant.", 125, currentY + 6.5, { align: "center" });
  doc.text("Precio Unit.", 160, currentY + 6.5, { align: "right" });
  doc.text("Total", 190, currentY + 6.5, { align: "right" });

  currentY += 10;

  // Table rows
  v.items.forEach((item, index) => {
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

    let nombre = item.nombre;
    if (nombre.length > 55) {
      nombre = nombre.substring(0, 52) + "...";
    }

    doc.text(nombre, 20, currentY + 5.5);
    doc.text(item.quantity.toString(), 125, currentY + 5.5, { align: "center" });
    doc.text(formatCurrency(item.precio), 160, currentY + 5.5, { align: "right" });

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(formatCurrency(item.precio * item.quantity), 190, currentY + 5.5, { align: "right" });

    currentY += 8;
  });

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 2, 195, currentY + 2);
  currentY += 10;

  // Totals
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  doc.text("Subtotal Neto:", 115, currentY);
  doc.text(formatCurrency(v.subtotal), 190, currentY, { align: 'right' });
  doc.setDrawColor(230, 230, 230);
  doc.line(150, currentY + 2, 190, currentY + 2);

  doc.text(`ITBIS (${v.itbisPorcentaje.toFixed(1)}%):`, 115, currentY + 6);
  doc.text(formatCurrency(v.itbis), 190, currentY + 6, { align: 'right' });

  currentY += 12;

  // Total bar
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.rect(115, currentY, 80, 14, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL PAGADO:", 120, currentY + 9.5);
  doc.text(formatCurrency(v.total), 190, currentY + 9.5, { align: 'right' });

  // Footer
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 265, 210, 32, "F"); 

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.circle(20, 280, 5);
  doc.line(18, 280, 19.5, 281.5);
  doc.line(19.5, 281.5, 22, 278);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Comprobante de Pago Oficial", 30, 278);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text("Documento oficial de WKW Security.", 30, 284);

  doc.setDrawColor(100, 100, 150);
  doc.setLineWidth(0.5);
  doc.line(100, 273, 100, 287);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(255, 255, 255);
  doc.circle(108, 275, 1, "F");
  doc.text("180-943-93928", 112, 276);
  
  doc.circle(108, 281, 1, "F");
  doc.text("wkwinstalaciones.com", 112, 282);
  
  doc.circle(108, 287, 1, "F");
  doc.text("ventas@wkwinstalaciones.com", 112, 288);

  doc.save(`factura_${v.clienteNombre.replace(/\s+/g, '_')}_${v.fecha.replace(/\//g, '-')}.pdf`);
}

function actualizarVentasList() {
  const lista = document.getElementById('tablaVentas');
  if (!lista) return;
  lista.innerHTML = '';

  const session = getSession();
  const isCliente = session && session.role === 'cliente';

  const query = document.getElementById('buscarVentaInput').value.trim().toLowerCase();
  
  let filtered = isCliente
    ? ventas.filter(v => v.clienteId === session.username)
    : ventas;

  if (query) {
    filtered = filtered.filter(v => 
      v.clienteNombre.toLowerCase().includes(query) || 
      v.id.toLowerCase().includes(query)
    );
  }

  if (filtered.length === 0) {
    lista.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No hay registros de ventas.</td></tr>`;
    return;
  }

  filtered.forEach(v => {
    const conceptosText = v.items.map(item => `${item.nombre} (x${item.quantity})`).join(', ');
    const displayConceptos = conceptosText.length > 50 ? conceptosText.substring(0, 47) + '...' : conceptosText;

    const actionDelete = isAdmin()
      ? `<button class="btn-danger" onclick="eliminarVenta('${v.id}')" style="padding: 6px 10px; font-size: 0.85rem;" title="Eliminar Registro">
           <i class="fa-solid fa-trash-can"></i>
         </button>`
      : '';

    lista.innerHTML += `
      <tr>
        <td data-label="ID" style="font-weight: 600; color: var(--accent);">#${v.id.toUpperCase().substr(1, 6)}</td>
        <td data-label="Fecha">${v.fecha}</td>
        <td data-label="Cliente">${v.clienteNombre}</td>
        <td data-label="Conceptos" title="${conceptosText}">${displayConceptos}</td>
        <td data-label="Total" style="text-align: right; font-weight: 600; color: var(--success);">${formatCurrency(v.total)}</td>
        <td data-label="Acciones" style="text-align: center; white-space: nowrap;">
          <div style="display: inline-flex; gap: 8px;">
            <button onclick="descargarFacturaPDF('${v.id}')" style="padding: 6px 12px; font-size: 0.85rem; background-color: var(--success); color: white; display: inline-flex; align-items: center; gap: 6px;" title="Descargar Factura PDF">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
            ${actionDelete}
          </div>
        </td>
      </tr>
    `;
  });
}

function filtrarVentas() {
  actualizarVentasList();
}

function eliminarVenta(id) {
  if (!isAdmin()) {
    alert('No tienes permisos para eliminar registros de ventas.');
    return;
  }
  if (confirm('¿Estás seguro de que deseas eliminar este registro de venta? El stock deducido no se restaurará automáticamente.')) {
    ventas = ventas.filter(v => v.id !== id);
    saveState();
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
window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidadCarrito = cambiarCantidadCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.confirmarVenta = confirmarVenta;
window.descargarFacturaPDF = descargarFacturaPDF;
window.filtrarVentas = filtrarVentas;
window.eliminarVenta = eliminarVenta;
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
  inicializarInputsCloudinary();

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

  // =====================================================
  // VIDEO GALLERY — Firebase Realtime Database
  // Videos subidos por el admin son visibles para TODOS
  // =====================================================

  // Config Firebase (guardada en localStorage por el admin)
  let firebaseApp = null;
  let firebaseDB  = null;
  let firebaseVideosRef = null;
  let fbUnsubscribe = null; // Listener cleanup

  function getFirebaseConfig() {
    const raw = localStorage.getItem('wkw_firebase_config');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  async function initFirebase() {
    const cfg = getFirebaseConfig();
    if (!cfg || !cfg.databaseURL) return false;

    try {
      // Importar Firebase SDK v9 modular
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getDatabase, ref, push, remove, onValue, off } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');

      // Evitar doble inicialización
      if (getApps().length === 0) {
        firebaseApp = initializeApp(cfg);
      } else {
        firebaseApp = getApps()[0];
      }

      firebaseDB = getDatabase(firebaseApp);
      firebaseVideosRef = ref(firebaseDB, 'wkw_videos');

      // Guardar funciones para uso posterior
      window._fb = { ref, push, remove, onValue, off };
      return true;
    } catch (err) {
      console.error('Firebase init error:', err);
      return false;
    }
  }

  // Render gallery from an array of video objects
  const renderVideos = (videosList) => {
    const gallery = document.querySelector('#videos .video-gallery');
    const emptyMsg = document.getElementById('videoEmptyMsg');
    if (!gallery) return;
    gallery.innerHTML = '';

    if (!videosList || videosList.length === 0) {
      if (emptyMsg) {
        emptyMsg.style.display = 'block';
        const pMsg = emptyMsg.querySelector('p');
        if (pMsg) pMsg.textContent = isAdmin()
          ? 'Aún no hay videos subidos. Sube un video usando el botón de abajo.'
          : 'Aún no hay videos publicados por el administrador.';
      }
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    videosList.forEach((v) => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.style.cssText = `
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 14px;
        position: relative;
        transition: all 0.3s ease;
        flex: 1 1 300px;
        max-width: 400px;
      `;

      const deleteBtnHtml = isAdmin()
        ? `<button onclick="eliminarVideo('${v.fbKey}')"
             title="Eliminar video"
             style="position:absolute;top:10px;right:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:var(--danger);border-radius:8px;padding:5px 10px;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;gap:4px;">
             <i class="fa-solid fa-trash-can"></i>
           </button>`
        : '';

      div.innerHTML = `
        ${deleteBtnHtml}
        <video controls preload="metadata"
          style="width:100%;border-radius:10px;background:#000;max-height:220px;">
          <source src="${v.dataUrl}" type="${v.type || 'video/mp4'}">
          Tu navegador no soporta video.
        </video>
        <p style="margin-top:10px;color:var(--text-primary);font-weight:600;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${v.name}">
          <i class="fa-solid fa-film" style="color:var(--accent);margin-right:6px;"></i>${v.name}
        </p>
        <p style="margin-top:2px;font-size:0.75rem;color:var(--text-secondary);">
          <i class="fa-regular fa-calendar"></i> ${v.fecha || ''}
        </p>
      `;
      gallery.appendChild(div);
    });
  };

  // Subscribe to Firebase for real-time updates
  async function subscribeToVideos() {
    const ok = await initFirebase();

    if (ok && firebaseVideosRef && window._fb) {
      const { onValue } = window._fb;

      // Detach previous listener if any
      if (fbUnsubscribe) fbUnsubscribe();

      fbUnsubscribe = onValue(firebaseVideosRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          renderVideos([]);
          return;
        }
        // Convert Firebase object to array keeping the key
        const list = Object.entries(data).map(([key, val]) => ({
          ...val,
          fbKey: key
        })).reverse(); // Newest first
        renderVideos(list);
      }, (err) => {
        console.error('Firebase listen error:', err);
        // Fallback to localStorage
        const localVids = JSON.parse(localStorage.getItem('pro_videos')) || [];
        renderVideos(localVids.map(v => ({ ...v, fbKey: null })));
      });

      return true;
    } else {
      // Firebase not configured — use localStorage (same device only)
      const localVids = JSON.parse(localStorage.getItem('pro_videos')) || [];
      renderVideos(localVids.map(v => ({ ...v, fbKey: null })));
      return false;
    }
  }

  // Delete video: from Firebase or localStorage
  window.eliminarVideo = async (fbKey) => {
    if (!isAdmin()) {
      alert('No tienes permisos para eliminar videos.');
      return;
    }
    if (!confirm('¿Eliminar este video?')) return;

    if (fbKey && firebaseVideosRef && window._fb) {
      const { ref: fbRef, remove } = window._fb;
      try {
        const videoItemRef = fbRef(firebaseDB, `wkw_videos/${fbKey}`);
        await remove(videoItemRef);
        showToast('Video eliminado correctamente.');
      } catch (err) {
        alert('Error eliminando video: ' + err.message);
      }
    } else {
      // localStorage fallback
      let localVids = JSON.parse(localStorage.getItem('pro_videos')) || [];
      // fbKey is index in this case
      localVids.splice(parseInt(fbKey), 1);
      localStorage.setItem('pro_videos', JSON.stringify(localVids));
      renderVideos(localVids.map((v, i) => ({ ...v, fbKey: i })));
      showToast('Video eliminado.');
    }
  };

  // Save Firebase config from the UI form
  window.guardarConfigFirebase = () => {
    const apiKey        = document.getElementById('fbApiKey')?.value.trim();
    const databaseURL   = document.getElementById('fbDatabaseURL')?.value.trim();
    const projectId     = document.getElementById('fbProjectId')?.value.trim();
    const appId         = document.getElementById('fbAppId')?.value.trim();

    if (!apiKey || !databaseURL || !projectId || !appId) {
      alert('Por favor, completa todos los campos de Firebase.');
      return;
    }

    const cfg = { apiKey, authDomain: `${projectId}.firebaseapp.com`, databaseURL, projectId, storageBucket: `${projectId}.appspot.com`, appId };
    localStorage.setItem('wkw_firebase_config', JSON.stringify(cfg));

    const statusEl = document.getElementById('firebaseStatusMsg');
    if (statusEl) { statusEl.style.display = 'flex'; setTimeout(() => statusEl.style.display = 'none', 3000); }

    // Re-subscribe with new config
    firebaseApp = null; firebaseDB = null; firebaseVideosRef = null;
    subscribeToVideos();
  };

  // Initialize Firebase config inputs from saved config
  function initFirebaseInputs() {
    const cfg = getFirebaseConfig();
    if (!cfg) return;
    if (document.getElementById('fbApiKey'))      document.getElementById('fbApiKey').value      = cfg.apiKey      || '';
    if (document.getElementById('fbDatabaseURL')) document.getElementById('fbDatabaseURL').value = cfg.databaseURL || '';
    if (document.getElementById('fbProjectId'))   document.getElementById('fbProjectId').value   = cfg.projectId   || '';
    if (document.getElementById('fbAppId'))       document.getElementById('fbAppId').value       = cfg.appId       || '';
  }
  initFirebaseInputs();

  // Start real-time video subscription
  subscribeToVideos();

  // Video upload handling
  const videoInput = document.getElementById('videoFileInput');
  const uploadBtn  = document.getElementById('uploadVideoBtn');

  if (videoInput && uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      if (!isAdmin()) { alert('No tienes permisos para subir videos.'); return; }
      videoInput.click();
    });

    videoInput.addEventListener('change', async (e) => {
      if (!isAdmin()) { alert('No tienes permisos para subir videos.'); return; }
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const isCloudConfigured = cloudinaryCloudName && cloudinaryUploadPreset;
      const isFbConfigured    = !!getFirebaseConfig();

      if (!isCloudConfigured) {
        alert('Cloudinary no está configurado. Por favor configura Cloudinary antes de subir videos para que sean compartidos.');
        videoInput.value = '';
        return;
      }

      // Upload to Cloudinary then save URL to Firebase (or localStorage)
      const originalHtml = uploadBtn.innerHTML;
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo...';

      try {
        const fecha = new Date().toLocaleDateString('es-DO');

        for (const file of files) {
          const videoUrl = await uploadFileToCloudinary(file, 'video');
          const videoData = { name: file.name, type: file.type, dataUrl: videoUrl, fecha };

          if (isFbConfigured && firebaseVideosRef && window._fb) {
            // Save to Firebase — visible to ALL users
            const { push } = window._fb;
            await push(firebaseVideosRef, videoData);
          } else {
            // Fallback: localStorage (same device only)
            const localVids = JSON.parse(localStorage.getItem('pro_videos')) || [];
            localVids.push(videoData);
            localStorage.setItem('pro_videos', JSON.stringify(localVids));
            renderVideos(localVids.map((v, i) => ({ ...v, fbKey: i })));
          }
        }

        showToast(isFbConfigured
          ? '✓ Video(s) subidos y visibles para todos los usuarios.'
          : '✓ Video subido (solo visible en este dispositivo — configura Firebase para compartir).');
      } catch (err) {
        console.error(err);
        alert('Error al subir video: ' + err.message);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = originalHtml;
        videoInput.value = '';
      }
    });
  }
});

