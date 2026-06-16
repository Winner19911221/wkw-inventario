// =============================================
// AUTH SYSTEM — WKW Security
// =============================================

// Credenciales hardcoded (sin backend)
const USERS = [
  { username: 'admin', password: 'Wildenis31@', role: 'admin', displayName: 'Administrador' },
  { username: 'usuario', password: 'usuario123', role: 'viewer', displayName: 'Usuario' },
  { username: 'cliente', password: 'cliente123', role: 'cliente', displayName: 'Cliente' }
];

/**
 * Intenta autenticar con usuario y contraseña.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function login(username, password) {
  const trimUser = username.trim().toLowerCase();
  const trimPass = password.trim();

  if (!trimUser || !trimPass) {
    return { success: false, error: 'Ingresa usuario y contraseña.' };
  }

  const registeredUsers = JSON.parse(localStorage.getItem('wkw_registered_users')) || [];
  const allUsers = [...USERS, ...registeredUsers];

  const found = allUsers.find(u => u.username === trimUser && u.password === trimPass);

  if (!found) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  // Guardar sesión
  const session = {
    username: found.username,
    role: found.role,
    displayName: found.displayName,
    loginTime: Date.now()
  };
  sessionStorage.setItem('wkw_session', JSON.stringify(session));

  return { success: true, user: session };
}

/**
 * Registra un nuevo usuario en LocalStorage.
 * @returns {{ success: boolean, error?: string }}
 */
export function registerUser(name, username, password, role) {
  const trimName = name.trim();
  const trimUser = username.trim().toLowerCase();
  const trimPass = password.trim();

  if (!trimName || !trimUser || !trimPass) {
    return { success: false, error: 'Completa todos los campos.' };
  }

  const registeredUsers = JSON.parse(localStorage.getItem('wkw_registered_users')) || [];
  const allUsers = [...USERS, ...registeredUsers];

  const exists = allUsers.some(u => u.username === trimUser);
  if (exists) {
    return { success: false, error: 'El nombre de usuario ya existe.' };
  }

  const newUser = {
    username: trimUser,
    password: trimPass,
    role: role,
    displayName: trimName
  };

  registeredUsers.push(newUser);
  localStorage.setItem('wkw_registered_users', JSON.stringify(registeredUsers));

  return { success: true };
}

/**
 * Cierra la sesión actual.
 */
export function logout() {
  sessionStorage.removeItem('wkw_session');
  // Recargar para volver al login
  location.reload();
}

/**
 * Retorna la sesión actual o null si no hay sesión activa.
 */
export function getSession() {
  try {
    const raw = sessionStorage.getItem('wkw_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retorna true si el usuario logueado es administrador.
 */
export function isAdmin() {
  const session = getSession();
  return session && session.role === 'admin';
}

/**
 * Retorna true si hay una sesión activa (cualquier rol).
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Aplica restricciones de rol al DOM.
 * - Si es viewer: body recibe la clase "role-viewer" → CSS oculta .admin-only
 * - Si es admin: se asegura de que no tenga "role-viewer"
 */
function applyRoleRestrictions() {
  const session = getSession();
  if (!session) return;

  const isViewer = session.role === 'viewer';
  const isCliente = session.role === 'cliente';

  document.body.classList.remove('role-admin', 'role-viewer', 'role-cliente');

  if (isViewer) {
    document.body.classList.add('role-viewer');
  } else if (isCliente) {
    document.body.classList.add('role-cliente');
  } else {
    document.body.classList.add('role-admin');
  }

  // Deshabilitar campo de precio para no-administradores en cotizaciones
  const precioInput = document.getElementById('prodCatPrecio');
  if (precioInput) {
    precioInput.disabled = (isViewer || isCliente);
  }

  // Actualizar badge de usuario en sidebar
  updateUserBadge(session);
}

/**
 * Actualiza el badge de sesión en el sidebar.
 */
function updateUserBadge(session) {
  const container = document.getElementById('userSessionInfo');
  if (!container) return;

  const isAdminUser = session.role === 'admin';
  const isClienteUser = session.role === 'cliente';

  let roleClass = 'viewer';
  let roleIcon = 'fa-eye';
  let roleText = 'Solo Lectura';

  if (isAdminUser) {
    roleClass = 'admin';
    roleIcon = 'fa-shield-halved';
    roleText = 'Administrador';
  } else if (isClienteUser) {
    roleClass = 'cliente';
    roleIcon = 'fa-user-tag';
    roleText = 'Cliente';
  }

  container.innerHTML = `
    <div class="user-role-badge">
      <div class="role-avatar ${roleClass}">
        <i class="fa-solid ${roleIcon}"></i>
      </div>
      <div class="role-details">
        <span class="role-name">${session.displayName}</span>
        <span class="role-label ${roleClass}">${roleText}</span>
      </div>
    </div>
    <button class="btn-logout" onclick="cerrarSesion()">
      <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
    </button>
  `;
}

/**
 * Muestra la pantalla de login y oculta el contenido de la app.
 */
export function showLoginScreen() {
  const loginScreen = document.getElementById('loginScreen');
  const sidebar = document.querySelector('.sidebar');
  const contenido = document.querySelector('.contenido');

  if (loginScreen) loginScreen.classList.remove('hidden');
  if (sidebar) sidebar.style.display = 'none';
  if (contenido) contenido.style.display = 'none';
}

/**
 * Oculta la pantalla de login y muestra el contenido de la app.
 */
export function hideLoginScreen() {
  const loginScreen = document.getElementById('loginScreen');
  const sidebar = document.querySelector('.sidebar');
  const contenido = document.querySelector('.contenido');

  if (loginScreen) loginScreen.classList.add('hidden');
  if (sidebar) sidebar.style.display = '';
  if (contenido) contenido.style.display = '';
}

/**
 * Inicializa el sistema de autenticación.
 * Verifica si ya hay sesión activa; si no, muestra el login.
 */
export function initAuth() {
  if (isLoggedIn()) {
    hideLoginScreen();
    applyRoleRestrictions();
    return true;
  } else {
    showLoginScreen();
    return false;
  }
}
