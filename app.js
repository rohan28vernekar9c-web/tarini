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
const screensWithoutNav = ['login', 'ai-assistant', 'applications', 'rewards', 'post-product', 'product-detail', 'edit-profile'];

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

        if (screenId === 'shop') renderShopProducts();
        if (screenId === 'profile') loadProfileScreen();
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
        if (screenId === 'shop') renderShopProducts();
        if (screenId === 'profile') loadProfileScreen();
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

// --- PROFILE LOGIC ---

function getProfileData() {
    return JSON.parse(localStorage.getItem('profileData') || '{}');
}

function saveProfileData(data) {
    localStorage.setItem('profileData', JSON.stringify(data));
}

function loadProfileScreen() {
    if (!document.getElementById('profile-user-name')) return;
    const d = getProfileData();
    const user = auth.currentUser;
    const name = d.name || (user && user.displayName) || 'User';

    document.getElementById('profile-user-name').textContent = name;
    document.getElementById('profile-display-fullname').textContent = name;
    document.getElementById('profile-display-title').textContent = d.title || 'Empowered Member';
    document.getElementById('profile-display-bio').textContent = d.bio || 'No bio yet. Tell the world about yourself!';
    document.getElementById('profile-display-location').textContent = d.location || 'Add location';
    document.getElementById('profile-display-website').textContent = d.website || 'Add website';
    document.getElementById('profile-display-visibility').textContent = d.visibility || 'Public';
    document.getElementById('profile-display-joined').textContent = d.joined || ('Joined ' + new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));

    const img = document.getElementById('profile-avatar-img');
    const icon = document.getElementById('profile-avatar-icon');
    if (d.avatar) { img.src = d.avatar; img.classList.remove('hidden'); icon.classList.add('hidden'); }
    else { img.classList.add('hidden'); icon.classList.remove('hidden'); }

    const skillsEl = document.getElementById('profile-skills-display');
    const skills = d.skills ? d.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    skillsEl.innerHTML = skills.length
        ? skills.map(s => `<span class="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">${s}</span>`).join('')
        : '<span class="text-sm text-on-surface-variant">No skills added yet.</span>';

    document.getElementById('profile-resume-name').textContent = d.resumeName || 'No resume uploaded';
    document.getElementById('profile-resume-date').textContent = d.resumeDate || '';

    const prefs = d.prefs || {};
    updateNotifToggle(prefs.notifications !== false);
    const langEl = document.getElementById('pref-language');
    if (langEl) langEl.value = prefs.language || 'English';
    document.getElementById('pref-language-display').textContent = prefs.language || 'English';
    const tfaEl = document.getElementById('tfa-status');
    const tfaBtn = document.getElementById('tfa-toggle-btn');
    if (tfaEl) tfaEl.textContent = prefs.tfa ? 'Enabled' : 'Disabled';
    if (tfaBtn) tfaBtn.textContent = prefs.tfa ? 'Disable' : 'Enable';

    const dashEl = document.getElementById('dashboard-user-name');
    if (dashEl) dashEl.textContent = name;
}
window.loadProfileScreen = loadProfileScreen;

function openEditProfile() {
    const d = getProfileData();
    const user = auth.currentUser;
    document.getElementById('ep-name').value = d.name || (user && user.displayName) || '';
    document.getElementById('ep-title').value = d.title || '';
    document.getElementById('ep-bio').value = d.bio || '';
    document.getElementById('ep-location').value = d.location || '';
    document.getElementById('ep-website').value = d.website || '';
    document.getElementById('ep-skills').value = d.skills || '';
    navigateTo('edit-profile');
}
window.openEditProfile = openEditProfile;

function saveProfile() {
    const d = getProfileData();
    d.name = document.getElementById('ep-name').value.trim();
    d.title = document.getElementById('ep-title').value.trim();
    d.bio = document.getElementById('ep-bio').value.trim();
    d.location = document.getElementById('ep-location').value.trim();
    d.website = document.getElementById('ep-website').value.trim();
    d.skills = document.getElementById('ep-skills').value.trim();
    if (!d.joined) d.joined = 'Joined ' + new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    saveProfileData(d);
    navigateTo('profile');
}
window.saveProfile = saveProfile;

function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const d = getProfileData();
        d.avatar = e.target.result;
        saveProfileData(d);
        loadProfileScreen();
    };
    reader.readAsDataURL(file);
}
window.handleProfilePicChange = handleProfilePicChange;

function toggleProfileVisibility() {
    const d = getProfileData();
    d.visibility = (d.visibility === 'Private') ? 'Public' : 'Private';
    saveProfileData(d);
    document.getElementById('profile-display-visibility').textContent = d.visibility;
}
window.toggleProfileVisibility = toggleProfileVisibility;

function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const d = getProfileData();
    d.resumeName = file.name;
    d.resumeDate = 'Uploaded ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    saveProfileData(d);
    document.getElementById('profile-resume-name').textContent = d.resumeName;
    document.getElementById('profile-resume-date').textContent = d.resumeDate;
}
window.handleResumeUpload = handleResumeUpload;

function togglePref(key) {
    const d = getProfileData();
    if (!d.prefs) d.prefs = {};
    d.prefs[key] = !d.prefs[key];
    saveProfileData(d);
    if (key === 'notifications') updateNotifToggle(d.prefs.notifications);
    if (key === 'tfa') {
        const tfaEl = document.getElementById('tfa-status');
        const tfaBtn = document.getElementById('tfa-toggle-btn');
        if (tfaEl) tfaEl.textContent = d.prefs.tfa ? 'Enabled' : 'Disabled';
        if (tfaBtn) tfaBtn.textContent = d.prefs.tfa ? 'Disable' : 'Enable';
    }
}
window.togglePref = togglePref;

function savePref(key, value) {
    const d = getProfileData();
    if (!d.prefs) d.prefs = {};
    d.prefs[key] = value;
    saveProfileData(d);
    if (key === 'language') document.getElementById('pref-language-display').textContent = value;
}
window.savePref = savePref;

function updateNotifToggle(on) {
    const btn = document.getElementById('notif-toggle');
    const knob = document.getElementById('notif-knob');
    if (!btn || !knob) return;
    if (on) { btn.classList.add('bg-primary'); btn.classList.remove('bg-outline-variant'); knob.classList.add('translate-x-6'); knob.classList.remove('translate-x-0'); }
    else { btn.classList.remove('bg-primary'); btn.classList.add('bg-outline-variant'); knob.classList.remove('translate-x-6'); knob.classList.add('translate-x-0'); }
}

async function shareProfile() {
    const d = getProfileData();
    const user = auth.currentUser;
    const name = d.name || (user && user.displayName) || 'User';
    const uid = user ? user.uid : 'guest';

    // Build a deep-link URL pointing to this user's profile
    const profileUrl = `https://tarini-9ff23.web.app/?profile=${uid}`;
    const shareTitle = `${name} on Tarini`;
    const shareText = `Check out ${name}'s profile on Tarini — a platform empowering women entrepreneurs.`;

    if (navigator.share) {
        try {
            await navigator.share({ title: shareTitle, text: shareText, url: profileUrl });
        } catch (err) {
            if (err.name !== 'AbortError') copyToClipboard(profileUrl);
        }
    } else {
        copyToClipboard(profileUrl);
    }
}
window.shareProfile = shareProfile;

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast('Profile link copied to clipboard!'));
    } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('Profile link copied to clipboard!');
    }
}

function showToast(msg) {
    let toast = document.getElementById('share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.className = 'fixed bottom-32 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-sm font-semibold px-5 py-3 rounded-full shadow-xl z-[999] transition-all';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// --- SHOP LOGIC ---

let currentProductId = null;
let showAllProducts = false;

function getShopProducts() {
    return JSON.parse(localStorage.getItem('shopProducts') || '[]');
}

function saveShopProducts(products) {
    localStorage.setItem('shopProducts', JSON.stringify(products));
}

function renderShopProducts(viewAll) {
    if (viewAll !== undefined) showAllProducts = viewAll;
    const products = getShopProducts();
    const emptyState = document.getElementById('shop-empty-state');
    const productsState = document.getElementById('shop-products-state');
    const container = document.getElementById('shop-products-container');
    if (!container) return;

    if (products.length === 0) {
        showAllProducts = false;
        emptyState.classList.remove('hidden');
        productsState.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    productsState.classList.remove('hidden');

    const viewAllBtn = document.getElementById('shop-view-all');
    const display = showAllProducts ? products.slice().reverse() : products.slice(-4).reverse();
    if (viewAllBtn) {
        viewAllBtn.classList.toggle('hidden', products.length <= 4);
        viewAllBtn.textContent = showAllProducts ? 'Show Less' : 'View All';
    }

    container.innerHTML = display.map(p => `
        <div onclick="openProductDetail(${p.id})" class="bg-white rounded-[20px] border border-surface-container-high shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-all">
            <div class="w-full h-36 bg-surface-container-low flex items-center justify-center overflow-hidden">
                ${p.image ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover"/>` : `<span class="material-symbols-outlined text-outline-variant text-5xl">image</span>`}
            </div>
            <div class="p-3 flex flex-col gap-1 flex-1">
                <p class="font-semibold text-on-surface text-sm leading-tight line-clamp-2">${p.name}</p>
                ${p.category ? `<span class="text-[11px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full w-fit">${p.category}</span>` : ''}
                <p class="text-primary font-bold text-sm mt-auto">&#8377;${Number(p.price).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}
window.renderShopProducts = renderShopProducts;

// ---- Full post product form ----
function openPostProduct(productId) {
    const form = document.getElementById('post-product-form');
    form.reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('post-product-title').textContent = 'Add Product';
    document.getElementById('post-product-btn').textContent = 'Post Product';
    resetImagePreview('product-image-preview', 'product-image-icon', 'product-image-text');

    if (productId) {
        const p = getShopProducts().find(x => x.id === productId);
        if (p) {
            document.getElementById('edit-product-id').value = p.id;
            document.getElementById('product-name').value = p.name;
            document.getElementById('product-description').value = p.description || '';
            document.getElementById('product-price').value = p.price;
            document.getElementById('product-category').value = p.category || '';
            document.getElementById('product-stock').value = p.stock;
            document.getElementById('post-product-title').textContent = 'Edit Product';
            document.getElementById('post-product-btn').textContent = 'Save Changes';
            if (p.image) {
                const preview = document.getElementById('product-image-preview');
                preview.setAttribute('data-src', p.image);
                preview.src = p.image;
                preview.classList.remove('hidden');
                document.getElementById('product-image-icon').classList.add('hidden');
                document.getElementById('product-image-text').classList.add('hidden');
            }
        }
    }
    navigateTo('post-product');
}
window.openPostProduct = openPostProduct;

function submitProductForm() {
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const preview = document.getElementById('product-image-preview');
    const image = (!preview.classList.contains('hidden') && preview.getAttribute('data-src'))
        ? preview.getAttribute('data-src')
        : '';

    let products = getShopProducts();
    if (editId) {
        products = products.map(p => p.id === parseInt(editId)
            ? { ...p, name, description, price, category, stock, image: image || p.image }
            : p);
    } else {
        products.push({ id: Date.now(), name, description, price, category, stock, image });
    }
    saveShopProducts(products);
    navigateTo('shop');
}
window.submitProductForm = submitProductForm;

function previewProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('product-image-preview');
        preview.setAttribute('data-src', e.target.result);
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        document.getElementById('product-image-icon').classList.add('hidden');
        document.getElementById('product-image-text').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}
window.previewProductImage = previewProductImage;

// ---- Product detail ----
function openProductDetail(productId) {
    currentProductId = productId;
    const p = getShopProducts().find(x => x.id === productId);
    if (!p) return;
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-price').textContent = '\u20b9' + Number(p.price).toFixed(2);
    document.getElementById('detail-category').textContent = p.category || 'Uncategorised';
    document.getElementById('detail-description').textContent = p.description || 'No description provided.';
    document.getElementById('detail-stock').textContent = p.stock;
    const img = document.getElementById('detail-image');
    const placeholder = document.getElementById('detail-image-placeholder');
    if (p.image) {
        img.src = p.image;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
    navigateTo('product-detail');
}
window.openProductDetail = openProductDetail;

function editCurrentProduct() {
    openPostProduct(currentProductId);
}
window.editCurrentProduct = editCurrentProduct;

function deleteCurrentProduct() {
    if (!confirm('Delete this product?')) return;
    saveShopProducts(getShopProducts().filter(p => p.id !== currentProductId));
    currentProductId = null;
    navigateTo('shop');
}
window.deleteCurrentProduct = deleteCurrentProduct;

// ---- Helpers ----
function previewImageInto(event, previewId, iconId, textId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById(previewId);
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        document.getElementById(iconId).classList.add('hidden');
        document.getElementById(textId).classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function resetImagePreview(previewId, iconId, textId) {
    const preview = document.getElementById(previewId);
    if (preview) { preview.src = ''; preview.removeAttribute('data-src'); preview.classList.add('hidden'); }
    const icon = document.getElementById(iconId);
    if (icon) icon.classList.remove('hidden');
    const text = document.getElementById(textId);
    if (text) text.classList.remove('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // We start on the login screen, so bottom nav should be hidden initially
    updateBottomNav('login');
    
    renderShopProducts();
    loadProfileScreen();

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
