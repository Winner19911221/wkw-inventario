// =============================================
// AUTH SYSTEM — WKW Security (with Firebase Realtime Database)
// =============================================

// Credenciales hardcoded (sin backend)
const USERS = [
  { username: 'admin', password: 'Wildenis31@', role: 'admin', displayName: 'Administrador' },
  { username: 'usuario', password: 'usuario123', role: 'viewer', displayName: 'Usuario' },
  { username: 'cliente', password: 'cliente123', role: 'cliente', displayName: 'Cliente' }
];

// Configuración de Firebase
let firebaseApp = null;
let firebaseDB  = null;

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDQECspP0iYgqTHVDTbkuHkO6A2G_eg2bE",
  authDomain: "wkw-inventario.firebaseapp.com",
  databaseURL: "https://wkw-inventario-default-rtdb.firebaseio.com",
  projectId: "wkw-inventario",
  storageBucket: "wkw-inventario.appspot.com",
  appId: "1:686142093955:web:f2fc77a86f0412788ab9b6"
};

function getFirebaseConfig() {
  const raw = localStorage.getItem('wkw_firebase_config');
  if (!raw) return DEFAULT_FIREBASE_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.databaseURL) return DEFAULT_FIREBASE_CONFIG;
    return parsed;
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}

async function initAuthFirebase() {
  if (firebaseDB) return true;
  const cfg = getFirebaseConfig();
  if (!cfg || !cfg.databaseURL) return false;

  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');

    if (getApps().length === 0) {
      firebaseApp = initializeApp(cfg);
    } else {
      firebaseApp = getApps()[0];
    }

    firebaseDB = getDatabase(firebaseApp);
    return true;
  } catch (err) {
    console.error('Firebase Auth init error:', err);
    return false;
  }
}

/**
 * Sincroniza los usuarios registrados desde Firebase en LocalStorage.
 */
export async function syncUsersFromFirebase() {
  // Wrap the entire sync in a 4-second timeout so a slow/unreachable
  // Firebase never blocks the login button.
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, 4000));

  const syncPromise = (async () => {
    const ok = await initAuthFirebase();
    if (!ok) return;

    try {
      const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
      const usersRef = ref(firebaseDB, 'wkw_registered_users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.values(data);
        localStorage.setItem('wkw_registered_users', JSON.stringify(usersList));
      }
    } catch (err) {
      console.warn('Error syncing users from Firebase (continuando con datos locales):', err);
    }
  })();

  // Race: whichever finishes first wins — login is never blocked longer than 4s
  await Promise.race([syncPromise, timeoutPromise]);
}

/**
 * Intenta autenticar con usuario y contraseña.
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function login(username, password) {
  const trimUser = (username || '').trim().toLowerCase();
  const trimPass = (password || '').trim();

  // Validate inputs BEFORE making any network call so error shows instantly
  if (!trimUser || !trimPass) {
    return { success: false, error: 'Ingresa usuario y contraseña.' };
  }

  try {
    // Sync registered users from Firebase (with timeout — never blocks > 4s)
    await syncUsersFromFirebase();

    const registeredUsers = JSON.parse(localStorage.getItem('wkw_registered_users')) || [];
    const allUsers = [...USERS, ...registeredUsers];

    const found = allUsers.find(u =>
      u.username === trimUser && u.password === trimPass
    );

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
  } catch (err) {
    console.error('Error inesperado en login:', err);
    return { success: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
  }
}

/**
 * Registra un nuevo usuario en Firebase y LocalStorage.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function registerUser(name, username, password, role) {
  const trimName = name.trim();
  const trimUser = username.trim().toLowerCase();
  const trimPass = password.trim();

  if (!trimName || !trimUser || !trimPass) {
    return { success: false, error: 'Completa todos los campos.' };
  }

  // Sincronizar primero para comprobar duplicados
  await syncUsersFromFirebase();

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

  // Guardar en Firebase
  const ok = await initAuthFirebase();
  if (ok) {
    try {
      const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
      const usersRef = ref(firebaseDB, 'wkw_registered_users');
      await push(usersRef, newUser);
    } catch (err) {
      console.error('Error saving user to Firebase:', err);
      // Continuamos para guardar localmente como fallback
    }
  }

  // Guardar en LocalStorage
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
// Export role restrictions function
export function applyRoleRestrictions() {
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

// Alias for logout to match HTML onclick
export function cerrarSesion() {
  logout();
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

export function showLoginForm(event) {
  if (event) event.preventDefault();
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) {
    loginForm.classList.remove('hidden');
    loginForm.style.display = '';
  }
  if (registerForm) {
    registerForm.classList.add('hidden');
    registerForm.style.display = 'none';
  }
}

export function showRegisterForm(event) {
  if (event) event.preventDefault();
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.classList.remove('hidden');
    registerForm.style.display = '';
  }
  if (loginForm) {
    loginForm.classList.add('hidden');
    loginForm.style.display = 'none';
  }
}

// Expose to global scope for inline onclick handlers
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;

/**
 * Inicializa el sistema de autenticación.
 * Verifica si ya hay sesión activa; si no, muestra el login.
 */
export function initAuth() {
  syncUsersFromFirebase().catch(console.error);

  if (isLoggedIn()) {
    hideLoginScreen();
    applyRoleRestrictions();
    return true;
  } else {
    showLoginScreen();
    return false;
  }
}
