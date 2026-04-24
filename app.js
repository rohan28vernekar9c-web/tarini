// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyAuHnd-CtqEJ3XrwAmWDcrVuMLGnlB42Dk",
    authDomain: "tarini-9ff23.firebaseapp.com",
    projectId: "tarini-9ff23",
    storageBucket: "tarini-9ff23.firebasestorage.app",
    messagingSenderId: "913663967260",
    appId: "1:913663967260:web:42f163262705f52a28dfd9",
    measurementId: "G-HLWD3CDYGH"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// History stack to support back navigation
let historyStack = ['login'];

// List of screens that should hide the bottom navigation
const screensWithoutNav = ['login', 'ai-assistant', 'applications', 'rewards'];

function navigateTo(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    // Show the target screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Manage history stack (prevent duplicate consecutive entries)
        if (historyStack[historyStack.length - 1] !== screenId) {
            historyStack.push(screenId);
        }

        updateBottomNav(screenId);
    } else {
        console.error(`Screen 'screen-${screenId}' not found.`);
    }
}
window.navigateTo = navigateTo;

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop(); // remove current screen
        const previousScreen = historyStack[historyStack.length - 1];
        navigateToWithOutHistory(previousScreen);
    }
}
window.goBack = goBack;

function navigateToWithOutHistory(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        updateBottomNav(screenId);
    }
}

function updateBottomNav(screenId) {
    const bottomNav = document.getElementById('bottom-nav');
    const globalHeader = document.getElementById('global-header');
    
    // Check if bottom nav and header should be visible
    if (screensWithoutNav.includes(screenId)) {
        if (bottomNav) bottomNav.classList.add('hidden');
        if (globalHeader) globalHeader.classList.add('hidden');
    } else {
        if (bottomNav) bottomNav.classList.remove('hidden');
        if (globalHeader) globalHeader.classList.remove('hidden');
    }

    // Update active state on nav items using Tailwind classes
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // Reset to inactive state
        item.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'scale-110');
        item.classList.add('text-slate-400', 'dark:text-slate-500');
        
        const icon = item.querySelector('.nav-icon');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";

        if (item.getAttribute('data-target') === screenId) {
            // Set to active state
            item.classList.remove('text-slate-400', 'dark:text-slate-500');
            item.classList.add('text-indigo-600', 'dark:text-indigo-400', 'scale-110');
            
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // We start on the login screen, so bottom nav should be hidden initially
    updateBottomNav('login');
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.add('dark');
    }
});

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
window.toggleTheme = toggleTheme;

// --- FIREBASE AUTHENTICATION LOGIC ---

function showError(msg) {
    const errorEl = document.getElementById('auth-error-msg');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    setTimeout(() => { errorEl.style.display = 'none'; }, 4000);
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorEl = document.getElementById('auth-error-msg');
    
    errorEl.style.display = 'none'; // clear errors

    if (mode === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}
window.toggleAuthMode = toggleAuthMode;

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!email || !password) {
        showError("Please enter email and password.");
        return;
    }

    try {
        btn.textContent = "Signing In...";
        btn.disabled = true;
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle navigation
    } catch (error) {
        showError(error.message);
        btn.textContent = "Sign In";
        btn.disabled = false;
    }
}
window.handleLogin = handleLogin;

async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const btn = document.getElementById('register-btn');

    if (!email || !password || !name) {
        showError("Please fill in all fields.");
        return;
    }

    try {
        btn.textContent = "Signing Up...";
        btn.disabled = true;
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });

        // onAuthStateChanged will handle navigation
    } catch (error) {
        showError(error.message);
        btn.textContent = "Sign Up";
        btn.disabled = false;
    }
}
window.handleRegister = handleRegister;

async function handleLogout() {
    try {
        await auth.signOut();
        // onAuthStateChanged will handle navigation
    } catch (error) {
        console.error("Logout Error:", error);
    }
}
window.handleLogout = handleLogout;

// Global Auth State Observer
auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('login-btn');
    const regBtn = document.getElementById('register-btn');
    
    if (loginBtn) { loginBtn.textContent = "Sign In"; loginBtn.disabled = false; }
    if (regBtn) { regBtn.textContent = "Sign Up"; regBtn.disabled = false; }

    if (user) {
        // User is signed in. Update UI and go to dashboard
        const displayName = user.displayName || 'User';
        const dashboardUserNameEl = document.getElementById('dashboard-user-name');
        if (dashboardUserNameEl) dashboardUserNameEl.textContent = displayName;
        
        const profileUserNameEl = document.getElementById('profile-user-name');
        if (profileUserNameEl) profileUserNameEl.textContent = displayName;
        
        // Prevent navigating to dashboard if we are already inside the app
        if (historyStack[historyStack.length - 1] === 'login') {
            navigateTo('dashboard');
        }
    } else {
        // User is signed out. Force back to login screen
        navigateToWithOutHistory('login');
        historyStack = ['login']; // Reset history
    }
});
