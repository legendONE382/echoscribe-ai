// ========== AUTH STATE ==========
let currentUser = null;
let authToken = null;

// ========== DOM ELEMENTS ==========
const authPages = document.getElementById('authPages');
const appLayout = document.getElementById('appLayout');
const landingPage = document.getElementById('landingPage');
const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const userEmailDisplay = document.getElementById('userEmailDisplay');

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.error('❌ loginForm not found in DOM');
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  } else {
    console.error('❌ signupForm not found in DOM');
  }
});

// ========== CHECK AUTH STATUS ==========
async function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');

  if (token && user) {
    try {
      const res = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        currentUser = JSON.parse(user);
        authToken = token;
        showApp();
        return;
      }
    } catch (err) {
      console.error('Token verification failed:', err);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  showAuth();
}

// ========== LOGIN ==========
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    loginError.textContent = '';
    loginError.classList.remove('show');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loginForm.reset();
    showApp();

  } catch (err) {
    console.error('❌ Login error:', err);
    loginError.textContent = err.message;
    loginError.classList.add('show');
  }
}

// ========== SIGNUP ==========
async function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    signupError.textContent = '';
    signupError.classList.remove('show');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    signupForm.reset();
    showApp();

  } catch (err) {
    console.error('❌ Signup error:', err);
    signupError.textContent = err.message;
    signupError.classList.add('show');
  }
}

// ========== LOGOUT ==========
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    showAuth();
  }
}

// ========== UI TOGGLE ==========
function showAuth() {
  authPages.style.display = 'block';
  appLayout.classList.remove('show');
  toggleAuthPage('landing');
}

function showApp() {
  authPages.style.display = 'none';
  appLayout.classList.add('show');

  if (currentUser) {
    userEmailDisplay.textContent = currentUser.email;
  }

  const profession = localStorage.getItem('profession') || 'coaching';
  const tone = localStorage.getItem('tone') || 'professional';

  document.getElementById('profession').value = profession;
  document.getElementById('tone').value = tone;
}

function toggleAuthPage(page) {
  landingPage.style.display = page === 'landing' ? 'block' : 'none';
  loginPage.style.display = page === 'login' ? 'flex' : 'none';
  signupPage.style.display = page === 'signup' ? 'flex' : 'none';

  if (page === 'landing') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ========== GET AUTH HEADERS ==========
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}
