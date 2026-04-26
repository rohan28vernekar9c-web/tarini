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

// List of screens that should hide the bottom navigation
const screensWithoutNav = ['login', 'notifications', 'ai-assistant', 'post-product', 'product-detail', 'edit-profile', 'job-detail', 'job-apply', 'skill-categories', 'market-categories'];
// Screens that show the nav but don't have a matching nav tab (no active highlight needed)
const mainNavScreens = ['dashboard', 'jobs', 'skills', 'shop', 'profile'];
const _navStack = [];

function navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        // Track nav history for back navigation
        const currentActive = document.querySelector('.screen.active');
        if (currentActive) {
            const currentId = currentActive.id.replace('screen-', '');
            if (currentId !== screenId) _navStack.push(currentId);
        }
        targetScreen.classList.add('active');
        updateBottomNav(screenId);
        if (screenId === 'profile') loadProfileScreen();
        if (screenId === 'dashboard') loadDashboardEarnings();
        if (screenId === 'notifications') loadNotificationsScreen();
        if (screenId === 'jobs') initJobsPage();
        if (screenId === 'applications') loadApplicationsScreen();
        if (screenId === 'skills') initSkillsPage();
        if (screenId === 'shop') initMarketplace();
        if (screenId === 'my-shop') initMyShop();
        if (screenId === 'cart') renderCart();
        if (screenId === 'rewards') initRewardsScreen();
    } else {
        console.error(`Screen 'screen-${screenId}' not found.`);
    }
}
window.navigateTo = navigateTo;

function goBack() {
    window.history.back();
}
window.goBack = goBack;

function navigateToWithOutHistory(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        updateBottomNav(screenId);
        if (screenId === 'profile') loadProfileScreen();
        if (screenId === 'dashboard') loadDashboardEarnings();
        if (screenId === 'notifications') loadNotificationsScreen();
        if (screenId === 'jobs') initJobsPage();
        if (screenId === 'applications') loadApplicationsScreen();
        if (screenId === 'skills') initSkillsPage();
        if (screenId === 'shop') initMarketplace();
        if (screenId === 'my-shop') initMyShop();
        if (screenId === 'cart') renderCart();
        if (screenId === 'rewards') initRewardsScreen();
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
    // For sub-screens (my-shop, cart, applications, rewards), keep parent tab highlighted
    const navTargetMap = {
        'my-shop': 'shop', 'cart': 'shop', 'market-categories': 'shop',
        'applications': 'jobs', 'job-detail': 'jobs', 'job-apply': 'jobs',
        'skill-categories': 'skills',
        'notifications': 'dashboard', 'ai-assistant': 'dashboard', 'rewards': 'dashboard',
        'edit-profile': 'profile',
    };
    const activeTarget = navTargetMap[screenId] || screenId;

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // Reset to inactive state
        item.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'scale-110');
        item.classList.add('text-slate-400', 'dark:text-slate-500');
        
        const icon = item.querySelector('.nav-icon');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";

        if (item.getAttribute('data-target') === activeTarget) {
            // Set to active state
            item.classList.remove('text-slate-400', 'dark:text-slate-500');
            item.classList.add('text-indigo-600', 'dark:text-indigo-400', 'scale-110');
            
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
    });
}

function goToLogin() {
    toggleAuthMode('login');
    navigateTo('login');
}
window.goToLogin = goToLogin;

function goToSignup() {
    toggleAuthMode('register');
    navigateTo('login');
}
window.goToSignup = goToSignup;

// --- PROFILE PROGRESS ---

function computeProfileProgress() {
    const d = getProfileData();
    const fields = [
        !!d.avatar,
        !!(d.name && d.name.trim()),
        !!(d.bio && d.bio.trim()),
        !!(d.location && d.location.trim()),
        !!(d.skills && d.skills.trim()),
        !!(d.title && d.title.trim()),
        !!(d.website && d.website.trim()),
        !!(d.resumeName),
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
}

function updateProfileProgressUI() {
    const pct = computeProfileProgress();
    const bar = document.getElementById('profile-progress-bar');
    const label = document.getElementById('profile-progress-label');
    const cta = document.getElementById('profile-progress-cta');
    const profileCard = document.getElementById('dash-profile-card');
    const notifCard = document.getElementById('dash-notif-card');
    if (!bar || !label) return;
    bar.style.width = pct + '%';
    if (pct >= 100) {
        label.textContent = 'Profile Completed ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ';
        label.style.color = '#276749';
        if (cta) cta.style.display = 'none';
        if (profileCard && notifCard && !notifCard.classList.contains('notif-shown')) {
            notifCard.classList.add('notif-shown');
            profileCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            profileCard.style.opacity = '0';
            profileCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                profileCard.classList.add('hidden');
                notifCard.classList.remove('hidden');
                notifCard.style.opacity = '0';
                notifCard.style.transform = 'scale(0.95)';
                requestAnimationFrame(() => {
                    notifCard.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                    notifCard.style.opacity = '1';
                    notifCard.style.transform = 'scale(1)';
                });
            }, 300);
        } else if (profileCard && notifCard) {
            profileCard.classList.add('hidden');
            notifCard.classList.remove('hidden');
        }
        refreshNotifCard();
    } else {
        label.textContent = pct + '% Complete';
        label.style.color = '';
        if (cta) cta.style.display = '';
        if (profileCard) { profileCard.classList.remove('hidden'); profileCard.style.opacity = '1'; profileCard.style.transform = ''; }
        if (notifCard) { notifCard.classList.add('hidden'); notifCard.classList.remove('notif-shown'); }
    }
}

// --- HEADER AVATAR ---

function updateHeaderAvatar() {
    const d = getProfileData();
    const img = document.getElementById('header-avatar-img');
    const icon = document.getElementById('header-avatar-icon');
    if (!img || !icon) return;
    if (d.avatar) {
        img.src = d.avatar;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        icon.classList.remove('hidden');
    }
}

// --- NOTIFICATIONS ---

const _NOTIF_KEY = 'tarini_notifications';

function getNotifications() {
    return JSON.parse(localStorage.getItem(_NOTIF_KEY) || '[]');
}

function saveNotifications(list) {
    localStorage.setItem(_NOTIF_KEY, JSON.stringify(list));
}

function addNotification(type, title, description) {
    const list = getNotifications();
    list.unshift({ id: Date.now(), type, title, description, time: new Date().toISOString(), read: false });
    saveNotifications(list.slice(0, 50));
    refreshNotifCard();
}
window.addNotification = addNotification;

function refreshNotifCard() {
    const list = getNotifications();
    const unread = list.filter(n => !n.read);
    const countEl = document.getElementById('dash-notif-count');
    const previewEl = document.getElementById('dash-notif-preview');
    if (countEl) countEl.textContent = unread.length;
    if (previewEl) previewEl.textContent = unread.length > 0 ? unread[0].title : "You're all caught up!";
}

function loadNotificationsScreen() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    const list = getNotifications();
    if (list.length === 0) {
        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 0;text-align:center">
                <div style="width:64px;height:64px;border-radius:50%;background:rgba(77,65,223,0.10);display:flex;align-items:center;justify-content:center;margin-bottom:16px">
                    <span class="material-symbols-outlined" style="font-size:32px;color:#4d41df;font-variation-settings:'FILL' 1">notifications_none</span>
                </div>
                <p style="font-size:15px;font-weight:600;color:#1b1b24">No notifications yet</p>
                <p style="font-size:13px;color:#777587;margin-top:4px">We'll notify you about jobs, orders, and updates</p>
            </div>`;
        return;
    }
    const _icon = { job: 'work', application: 'assignment', order: 'shopping_bag', system: 'info' };
    const _color = { job: '#4d41df', application: '#875041', order: '#5c51a0', system: '#777587' };
    const _bg = { job: 'rgba(77,65,223,0.10)', application: 'rgba(135,80,65,0.10)', order: 'rgba(92,81,160,0.10)', system: 'rgba(119,117,135,0.10)' };
    container.innerHTML = list.map(n => {
        const ic = _icon[n.type] || 'notifications';
        const col = _color[n.type] || '#4d41df';
        const bg = _bg[n.type] || 'rgba(77,65,223,0.10)';
        return `
        <div onclick="markNotifRead(${n.id})" style="display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:18px;cursor:pointer;background:${n.read ? '#ffffff' : 'rgba(77,65,223,0.04)'};border:1px solid ${n.read ? '#eae6f3' : 'rgba(77,65,223,0.15)'};transition:transform 0.15s" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform=''" ontouchstart="this.style.transform='scale(0.98)'" ontouchend="this.style.transform=''">
            <div style="width:40px;height:40px;border-radius:12px;background:${bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <span class="material-symbols-outlined" style="font-size:20px;color:${col};font-variation-settings:'FILL' 1">${ic}</span>
            </div>
            <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                    <p style="font-size:13px;font-weight:${n.read ? 500 : 700};color:#1b1b24;line-height:1.3">${n.title}</p>
                    ${!n.read ? '<span style="width:8px;height:8px;border-radius:50%;background:#4d41df;flex-shrink:0"></span>' : ''}
                </div>
                <p style="font-size:12px;color:#777587;margin-top:2px;line-height:1.4">${n.description}</p>
                <p style="font-size:11px;color:#9e9bb8;margin-top:4px">${_timeAgo(n.time)}</p>
            </div>
        </div>`;
    }).join('');
    saveNotifications(list.map(n => ({ ...n, read: true })));
    refreshNotifCard();
}
window.loadNotificationsScreen = loadNotificationsScreen;

function markNotifRead(id) {
    saveNotifications(getNotifications().map(n => n.id === id ? { ...n, read: true } : n));
    loadNotificationsScreen();
}
window.markNotifRead = markNotifRead;

function markAllNotifsRead() {
    saveNotifications(getNotifications().map(n => ({ ...n, read: true })));
    loadNotificationsScreen();
    refreshNotifCard();
}
window.markAllNotifsRead = markAllNotifsRead;

function _timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

// --- DASHBOARD EARNINGS ---

function formatCurrency(value) {
    const num = parseFloat(value);
    if (value === null || value === undefined || value === '' || typeof value === 'object' || isNaN(num)) {
        return '\u20b90.00';
    }
    return '\u20b9' + num.toFixed(2);
}

function loadDashboardEarnings() {
    const el = document.getElementById('dashboard-earnings');
    if (!el) return;
    const user = auth.currentUser;
    if (!user) { el.textContent = '\u20b90.00'; return; }
    db.collection('earnings').doc(user.uid).get()
        .then(doc => {
            const amount = doc.exists ? doc.data().amount : 0;
            el.textContent = formatCurrency(amount);
        })
        .catch(() => { el.textContent = '\u20b90.00'; });
    loadQuickActionStats();
    renderDashboardJobs();
    updateProfileProgressUI();
}

function _setQaBadge(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden');
}

function loadQuickActionStats() {
    const user = auth.currentUser;
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. New jobs posted today
    db.collection('jobs')
        .where('postedAt', '>=', today)
        .get()
        .then(snap => {
            const count = snap.size;
            _setQaBadge('qa-jobs-badge', count > 0 ? `${count} New Today` : 'Browse Jobs');
        })
        .catch(() => _setQaBadge('qa-jobs-badge', 'Find Jobs'));

    // 2. User's total applications
    db.collection('applications')
        .where('userId', '==', user.uid)
        .get()
        .then(snap => {
            const count = snap.size;
            _setQaBadge('qa-apps-badge', count > 0 ? `${count} Applied` : 'Apply Now');
        })
        .catch(() => _setQaBadge('qa-apps-badge', 'My Apps'));

    // 3. New orders received today in the marketplace
    db.collection('orders')
        .where('sellerId', '==', user.uid)
        .where('createdAt', '>=', today)
        .get()
        .then(snap => {
            const count = snap.size;
            _setQaBadge('qa-orders-badge', count > 0 ? `${count} New Orders` : 'Marketplace');
        })
        .catch(() => _setQaBadge('qa-orders-badge', 'Marketplace'));
}

// Avatar gradient palettes for company logos
const _avatarGradients = [
    'linear-gradient(135deg,#4d41df,#675df9)',
    'linear-gradient(135deg,#875041,#feb5a2)',
    'linear-gradient(135deg,#5c51a0,#c8bfff)',
    'linear-gradient(135deg,#2d6a4f,#74c69d)',
    'linear-gradient(135deg,#c77dff,#7b2d8b)',
];

function renderDashboardJobs() {
    const container = document.getElementById('dashboard-featured-jobs');
    if (!container) return;
    const sampleJobs = [
        { title: 'Tailoring Instructor', company: 'Craft India', location: 'Mumbai', type: 'Part-time', salary: '\u20b912,000/mo' },
        { title: 'Data Entry Operator', company: 'TechSeva', location: 'Remote', type: 'Full-time', salary: '\u20b915,000/mo' },
        { title: 'Beauty Consultant', company: 'GlowUp Studio', location: 'Delhi', type: 'Freelance', salary: '\u20b98,000/mo' },
    ];
    container.innerHTML = sampleJobs.map((job, i) => {
        const grad = _avatarGradients[i % _avatarGradients.length];
        const initials = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const typeColor = job.type === 'Full-time' ? 'background:rgba(77,65,223,0.10);color:#4d41df'
            : job.type === 'Part-time' ? 'background:rgba(135,80,65,0.10);color:#875041'
            : 'background:rgba(92,81,160,0.10);color:#5c51a0';
        return `
        <div class="dash-job-card" onclick="navigateTo('jobs')">
            <div style="display:flex;align-items:flex-start;gap:12px">
                <div class="dash-job-avatar" style="background:${grad}">${initials}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                        <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${job.title}</p>
                        <button onclick="event.stopPropagation()" style="flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(77,65,223,0.08);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s" onmouseenter="this.style.background='rgba(77,65,223,0.16)'" onmouseleave="this.style.background='rgba(77,65,223,0.08)'">
                            <span class="material-symbols-outlined" style="font-size:16px;color:#4d41df">bookmark</span>
                        </button>
                    </div>
                    <p style="font-size:12px;color:#777587;margin-top:2px">${job.company} &bull; ${job.location}</p>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                        <span class="dash-job-badge" style="${typeColor}">${job.type}</span>
                        <span class="dash-job-badge" style="background:rgba(56,161,105,0.10);color:#276749">${job.salary}</span>
                    </div>
                </div>
            </div>
            <button onclick="event.stopPropagation();navigateTo('jobs')" style="margin-top:12px;width:100%;height:38px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:opacity 0.15s;font-family:'Poppins',sans-serif" onmouseenter="this.style.opacity='0.88'" onmouseleave="this.style.opacity='1'">Apply Now</button>
        </div>`;
    }).join('');
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
    updateProfileProgressUI();
    // Award coins for profile completion
    const pct = computeProfileProgress();
    if (pct >= 100) { earnCoins(50, 'Profile 100% complete'); checkAndAwardBadges(); }
    else if (pct >= 50) { earnCoins(10, 'Profile updated'); }
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
        updateProfileProgressUI();
        updateHeaderAvatar();
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
    updateProfileProgressUI();
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
    const shareText = `Check out ${name}'s profile on Tarini ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â a platform empowering women entrepreneurs.`;

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

let _postProductOrigin = 'shop';

function openPostProduct(productId) {
    _postProductOrigin = document.querySelector('.screen.active')?.id?.replace('screen-', '') || 'shop';
    const form = document.getElementById('post-product-form');
    form.reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('post-product-title').textContent = 'Add Product';
    const btnLabel = document.getElementById('post-btn-label');
    if (btnLabel) btnLabel.textContent = 'Post Product';
    resetImagePreview('product-image-preview', 'product-image-icon', 'product-image-text');
    // Reset new UI elements
    const imgActions = document.getElementById('img-actions');
    if (imgActions) imgActions.classList.add('hidden');
    const aiBox = document.getElementById('ai-suggestion-box');
    if (aiBox) aiBox.classList.add('hidden');
    const progressWrap = document.getElementById('img-progress-wrap');
    if (progressWrap) progressWrap.classList.add('hidden');
    document.getElementById('product-image-text').textContent = 'Tap to upload image';

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

    // Show loading state on button
    const btn = document.getElementById('post-product-btn');
    const btnLabel = document.getElementById('post-btn-label');
    if (btn && btnLabel) {
        btnLabel.textContent = 'Adding...';
        btn.disabled = true;
        btn.style.opacity = '0.8';
    }

    setTimeout(() => {
        let products = getShopProducts();
        if (editId) {
            products = products.map(p => p.id === parseInt(editId)
                ? { ...p, name, description, price, category, stock, image: image || p.image }
                : p);
        } else {
            products.push({ id: Date.now(), name, description, price, category, stock, image });
            earnCoins(25, 'Listed a new product');
            checkAndAwardBadges();
        }
        saveShopProducts(products);
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        if (btnLabel) btnLabel.textContent = editId ? 'Save Changes' : 'Post Product';
        // Show success modal
        const modal = document.getElementById('product-success-modal');
        if (modal) modal.classList.remove('hidden');
    }, 1200);
}
window.submitProductForm = submitProductForm;

function closeProductSuccess() {
    const modal = document.getElementById('product-success-modal');
    if (modal) modal.classList.add('hidden');
    navigateTo('my-shop');
}
window.closeProductSuccess = closeProductSuccess;

function previewProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    // Show progress bar
    const progressWrap = document.getElementById('img-progress-wrap');
    const progressBar = document.getElementById('img-progress-bar');
    const progressLabel = document.getElementById('img-progress-label');
    if (progressWrap) {
        progressWrap.classList.remove('hidden');
        progressBar.style.width = '0%';
        let pct = 0;
        const interval = setInterval(() => {
            pct += Math.random() * 30;
            if (pct >= 100) { pct = 100; clearInterval(interval); }
            progressBar.style.width = pct + '%';
            if (progressLabel) progressLabel.textContent = pct < 100 ? 'Uploading...' : 'Done!';
        }, 80);
    }
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('product-image-preview');
        preview.setAttribute('data-src', e.target.result);
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        document.getElementById('product-image-icon').classList.add('hidden');
        document.getElementById('product-image-text').classList.add('hidden');
        setTimeout(() => {
            if (progressWrap) progressWrap.classList.add('hidden');
            const actions = document.getElementById('img-actions');
            if (actions) actions.classList.remove('hidden');
        }, 900);
    };
    reader.readAsDataURL(file);
}
window.previewProductImage = previewProductImage;

function removeProductImage() {
    resetImagePreview('product-image-preview', 'product-image-icon', 'product-image-text');
    document.getElementById('product-image').value = '';
    const actions = document.getElementById('img-actions');
    if (actions) actions.classList.add('hidden');
}
window.removeProductImage = removeProductImage;

// --- AI IMPROVE (simulated) ---
const _aiSuggestions = [
    { title: 'Elegant Handcrafted Earrings ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Artisan Collection', desc: 'Beautifully crafted by skilled artisans using premium materials. Each piece is unique, lightweight, and perfect for everyday wear or special occasions. A thoughtful gift for loved ones.' },
    { title: 'Premium Handwoven Silk Saree ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Traditional Elegance', desc: 'Experience the timeless beauty of handwoven silk. This exquisite saree features intricate patterns crafted by master weavers, blending tradition with modern aesthetics.' },
    { title: 'Organic Herbal Skincare Set ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Natural Glow Collection', desc: 'Nourish your skin with our 100% organic herbal blend. Free from harmful chemicals, this set is crafted with love using traditional recipes passed down through generations.' },
    { title: 'Handmade Terracotta Jewellery ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Earthy Charm Series', desc: 'Celebrate the art of terracotta with these stunning handmade pieces. Lightweight, eco-friendly, and uniquely designed to complement both traditional and contemporary outfits.' },
];

function aiImproveProduct() {
    const btn = document.getElementById('ai-improve-btn');
    const label = document.getElementById('ai-btn-label');
    const box = document.getElementById('ai-suggestion-box');
    if (!btn || !label || !box) return;
    // Show loading state
    label.textContent = 'Thinking...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    const spinner = document.createElement('span');
    spinner.className = 'material-symbols-outlined';
    spinner.style.cssText = 'font-size:13px;animation:spin 0.8s linear infinite';
    spinner.textContent = 'progress_activity';
    btn.prepend(spinner);
    // Add spin keyframe if not present
    if (!document.getElementById('spin-style')) {
        const s = document.createElement('style');
        s.id = 'spin-style';
        s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
    }
    setTimeout(() => {
        spinner.remove();
        btn.disabled = false;
        btn.style.opacity = '1';
        label.textContent = 'Improve with AI';
        // Pick suggestion based on current name or random
        const name = (document.getElementById('product-name').value || '').toLowerCase();
        let pick = _aiSuggestions[Math.floor(Math.random() * _aiSuggestions.length)];
        if (name.includes('saree') || name.includes('silk')) pick = _aiSuggestions[1];
        else if (name.includes('skin') || name.includes('herbal')) pick = _aiSuggestions[2];
        else if (name.includes('terra') || name.includes('clay')) pick = _aiSuggestions[3];
        document.getElementById('ai-suggested-title').textContent = pick.title;
        document.getElementById('ai-suggested-desc').textContent = pick.desc;
        box.classList.remove('hidden');
    }, 2200);
}
window.aiImproveProduct = aiImproveProduct;

function acceptAiSuggestion() {
    const title = document.getElementById('ai-suggested-title').textContent;
    const desc = document.getElementById('ai-suggested-desc').textContent;
    document.getElementById('product-name').value = title;
    document.getElementById('product-description').value = desc;
    document.getElementById('ai-suggestion-box').classList.add('hidden');
}
window.acceptAiSuggestion = acceptAiSuggestion;

function dismissAiSuggestion() {
    document.getElementById('ai-suggestion-box').classList.add('hidden');
}
window.dismissAiSuggestion = dismissAiSuggestion;

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
    renderShopProducts();
    loadProfileScreen();
    updateHeaderAvatar();
    refreshNotifCard();

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
    const roleSelector = document.getElementById('register-role-selector');
    const errorEl = document.getElementById('auth-error-msg');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const toggleToRegister = document.getElementById('toggle-to-register');
    const toggleToLogin = document.getElementById('toggle-to-login');
    errorEl.style.display = 'none';
    ['woman', 'company', 'admin'].forEach(r => {
        document.getElementById(`register-form-${r}`).style.display = 'none';
    });
    if (mode === 'register') {
        loginForm.style.display = 'none';
        roleSelector.style.display = 'block';
        if (title) title.setAttribute('data-i18n', 'signUp');
        if (subtitle) subtitle.setAttribute('data-i18n', 'tariniWelcomesYou');
        toggleToRegister.style.display = 'none';
        toggleToLogin.style.display = 'block';
    } else {
        roleSelector.style.display = 'none';
        loginForm.style.display = 'block';
        if (title) title.setAttribute('data-i18n', 'signIn');
        if (subtitle) subtitle.setAttribute('data-i18n', 'welcomeBack');
        toggleToRegister.style.display = 'block';
        toggleToLogin.style.display = 'none';
    }
    const lang = localStorage.getItem('authLangPref') || 'en';
    setAuthLang(lang);
}
window.toggleAuthMode = toggleAuthMode;

async function handleForgotPassword() {
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
        showError('Enter your email address above, then tap Forgot Password.');
        return;
    }
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Check your inbox.');
    } catch (error) {
        showError(error.message);
    }
}
window.handleForgotPassword = handleForgotPassword;

async function handleGoogleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle navigation
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') showError(error.message);
    }
}
window.handleGoogleSignIn = handleGoogleSignIn;

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
        navigateTo('dashboard');
        
        // Restore button state
        const lang = localStorage.getItem('authLangPref') || 'en';
        const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
        btn.textContent = dict && dict['signIn'] ? dict['signIn'] : "Sign In";
        btn.disabled = false;
    } catch (error) {
        showError(error.message);
        const lang = localStorage.getItem('authLangPref') || 'en';
        const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
        btn.textContent = dict && dict['signIn'] ? dict['signIn'] : "Sign In";
        btn.disabled = false;
    }
}
window.handleLogin = handleLogin;

function showRegisterForm(role) {
    document.getElementById('register-role-selector').style.display = 'none';
    document.getElementById(`register-form-${role}`).style.display = 'block';
}
window.showRegisterForm = showRegisterForm;

function showRegisterRole() {
    ['woman', 'company', 'admin'].forEach(r => {
        document.getElementById(`register-form-${r}`).style.display = 'none';
    });
    document.getElementById('register-role-selector').style.display = 'block';
}
window.showRegisterRole = showRegisterRole;

async function handleRegister(role) {
    let email, password, name, btn;
    if (role === 'woman') {
        name = document.getElementById('w-name').value;
        email = document.getElementById('w-email').value;
        password = document.getElementById('w-password').value;
        btn = document.getElementById('register-btn');
    } else if (role === 'company') {
        name = document.getElementById('c-name').value;
        email = document.getElementById('c-email').value;
        password = document.getElementById('c-password').value;
        btn = document.getElementById('register-btn-company');
    } else {
        name = document.getElementById('a-name').value;
        email = document.getElementById('a-email').value;
        password = document.getElementById('a-password').value;
        btn = document.getElementById('register-btn-admin');
    }
    if (!email || !password || !name) { showError('Please fill in all required fields.'); return; }
    try {
        btn.textContent = 'Creating...';
        btn.disabled = true;
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });
        const d = getProfileData();
        d.role = role;
        if (role === 'woman') {
            d.skills = document.getElementById('w-skills').value;
            d.jobPref = document.getElementById('w-job-pref').value;
        } else if (role === 'company') {
            d.industry = document.getElementById('c-industry').value;
            d.address = document.getElementById('c-address').value;
        }
        saveProfileData(d);
        navigateTo('dashboard');
        
        // Restore button state
        const lang = localStorage.getItem('authLangPref') || 'en';
        const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
        btn.textContent = role === 'woman' ? (dict && dict['createAccount'] ? dict['createAccount'] : 'Create Account') : role === 'company' ? (dict && dict['registerCompany'] ? dict['registerCompany'] : 'Register Company') : (dict && dict['registerAdmin'] ? dict['registerAdmin'] : 'Register as Admin');
        btn.disabled = false;
    } catch (error) {
        showError(error.message);
        const lang = localStorage.getItem('authLangPref') || 'en';
        const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
        btn.textContent = role === 'woman' ? (dict && dict['createAccount'] ? dict['createAccount'] : 'Create Account') : role === 'company' ? (dict && dict['registerCompany'] ? dict['registerCompany'] : 'Register Company') : (dict && dict['registerAdmin'] ? dict['registerAdmin'] : 'Register as Admin');
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
    
    const lang = localStorage.getItem('authLangPref') || 'en';
    const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
    
    if (loginBtn) { loginBtn.textContent = dict && dict['signIn'] ? dict['signIn'] : "Sign In"; loginBtn.disabled = false; }
    if (regBtn) { regBtn.textContent = dict && dict['createAccount'] ? dict['createAccount'] : "Create Account"; regBtn.disabled = false; }

    if (user) {
        // User is signed in. Update UI and go to dashboard
        const displayName = user.displayName || 'User';
        const dashboardUserNameEl = document.getElementById('dashboard-user-name');
        if (dashboardUserNameEl) dashboardUserNameEl.textContent = displayName;
        
        const profileUserNameEl = document.getElementById('profile-user-name');
        if (profileUserNameEl) profileUserNameEl.textContent = displayName;

        // Award welcome coins on first ever login
        const r = _getRewards();
        if (!r.earnedBadges.includes('first_login')) {
            earnCoins(30, 'Welcome to Tarini!');
            checkAndAwardBadges();
        }
        
        const loginScreen = document.getElementById('screen-login');
        if (loginScreen && loginScreen.classList.contains('active')) {
            navigateTo('dashboard');
        } else if (history.state && history.state.screen === 'login') {
            navigateTo('dashboard');
        }
    } else {
        navigateToWithOutHistory('login');
        history.replaceState({ screen: 'login' }, '', window.location.pathname);
    }
});
// --- LANGUAGE SUPPORT ---
const authTranslations = {
    en: {
        emailAddress: "EMAIL ADDRESS", emailPlaceholder: "name@example.com",
        password: "PASSWORD", passwordPlaceholder: "Password",
        forgotPassword: "Forgot Password?", signIn: "Sign In",
        or: "or", signInGoogle: "Sign in with Google",
        chooseRole: "Choose Your Role", chooseRoleSub: "Select the role that best describes you",
        womanReg: "Woman Registration", fullName: "FULL NAME", fullNamePlaceholder: "Your full name",
        skills: "SKILLS", skillsPlaceholder: "e.g. Sewing, Handicrafts, Teaching",
        jobPref: "JOB PREFERENCE", selectPref: "Select preference", createAccount: "Create Account",
        companyReg: "Company Registration", companyName: "COMPANY NAME", industry: "INDUSTRY",
        address: "ADDRESS", addressPlaceholder: "City, State", registerCompany: "Register Company",
        adminReg: "Admin Registration", registerAdmin: "Register as Admin",
        newToTarini: "New to Tarini?", signUp: "Sign Up",
        alreadyHaveAccount: "Already have an account?", back: "Back",
        welcomeBack: "Welcome back to Tarini", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini Welcomes You"
    },
    hi: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¥ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¹Ã¢â‚¬Â ",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¹Ã¢â‚¬Â , ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âª, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¹Ã¢â‚¬Â ?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¹Ã¢â‚¬Â ", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¹Ã¢â‚¬Â "
    },
    bn: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€ Ã¢â‚¬â„¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼"
    },
    mr: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âµ", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âµ",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âµ", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€¦Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¤Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¥ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡"
    },
    ta: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â½.ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¾?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â®Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¯Ãƒâ€šÃ‚Â"
    },
    te: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â½ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â½ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â½ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â±ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â°Ãƒâ€šÃ‚Â¿"
    },
    gu: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾.ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€¹Ã¢â‚¬Â , ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€¦Ã¢â‚¬Å“ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â³",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â«ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡"
    },
    kn: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Âµ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â , ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¦Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â²Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â³ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â "
    },
    ml: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â½ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â½", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â»", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â´ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¾", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾. ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â½, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â»ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â»ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â»", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¼ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â»", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â¼ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        newToTarini: "Tarini-ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â½ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â» ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ",
        welcomeBack: "Tarini-ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â´Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚ÂµÃƒâ€šÃ‚Â"
    },
    pa: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â­ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€¹Ã¢â‚¬Â ",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â : ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â , ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        newToTarini: "Tarini 'ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€¹Ã¢â‚¬Â ?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡",
        welcomeBack: "Tarini 'ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€¹Ã¢â‚¬Â ", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¨Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â©Ãƒâ€¹Ã¢â‚¬Â "
    },
    or: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â·ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Âª: ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Âª",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¦", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Âª",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€¦Ã‚Â¸", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¬Ãƒâ€šÃ‚Â¿"
    },
    ur: {
        emailAddress: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â ", passwordPlaceholder: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â ",
        forgotPassword: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã‹Å“Ãƒâ€¦Ã‚Â¸", signIn: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        or: "ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§", signInGoogle: "Google ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        chooseRole: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº", chooseRoleSub: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚Â ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Âª ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ",
        womanReg: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ", fullName: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦", fullNamePlaceholder: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦",
        skills: "ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº", skillsPlaceholder: "ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â«ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢",
        jobPref: "ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â²ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Âª ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â­", selectPref: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â­ ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº", createAccount: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        companyReg: "ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ", companyName: "ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦", industry: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂµÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Âª",
        address: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚Â", addressPlaceholder: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Âª", registerCompany: "ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        adminReg: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ", registerAdmin: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â·ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        newToTarini: "Tarini ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‹Å“Ãƒâ€¦Ã‚Â¸", signUp: "ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº",
        alreadyHaveAccount: "ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¹ ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã‹Å“Ãƒâ€¦Ã‚Â¸", back: "ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢",
        welcomeBack: "Tarini ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Âº ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â³ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â± ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â®ÃƒÆ’Ã¢â€žÂ¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â´ ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â€žÂ¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â¯ ÃƒÆ’Ã…Â¡Ãƒâ€šÃ‚Â©ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‹Å“Ãƒâ€šÃ‚Â§ ÃƒÆ’Ã¢â‚¬ÂºÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬ÂºÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢"
    },
    as: {
        emailAddress: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â² ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", emailPlaceholder: "name@example.com",
        password: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡", passwordPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡",
        forgotPassword: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿?", signIn: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        or: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", signInGoogle: "Google ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        chooseRole: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", chooseRoleSub: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        womanReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", fullName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", fullNamePlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®",
        skills: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²", skillsPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª: ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¶ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª",
        jobPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦", selectPref: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", createAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        companyReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", companyName: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", industry: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
        address: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾", addressPlaceholder: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°, ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯", registerCompany: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        adminReg: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨", registerAdmin: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        newToTarini: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿?", signUp: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Âª ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢",
        alreadyHaveAccount: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â§ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã‚Â¸ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿?", back: "ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€¹Ã¢â‚¬Â ",
        welcomeBack: "Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚Â° ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â®", tariniWelcomesYou: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦ Tarini ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚ÂªÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â® ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â§ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡"
    }
};

function setAuthLang(lang) {
    localStorage.setItem('authLangPref', lang);
    const dict = authTranslations[lang] || authTranslations['en'];
    const fallback = authTranslations['en'];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] || fallback[key]) {
            el.textContent = dict[key] || fallback[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key] || fallback[key]) {
            el.placeholder = dict[key] || fallback[key];
        }
    });
}
window.setAuthLang = setAuthLang;

// Initialize language preference
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('authLangPref') || 'en';
    const langSelect = document.getElementById('auth-lang-select');
    if (langSelect) {
        langSelect.value = savedLang;
        setAuthLang(savedLang);
    }
});

// ============================================================
// FIND JOBS PAGE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â data, filters, AI match, top companies
// ============================================================

const _allJobs = [
    { id:1, title:'Tailoring Instructor', company:'Craft India', location:'Mumbai', locType:'On-site', type:'Part-time', exp:'Mid-level', industry:'Education', salaryNum:12000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹12,000/mo', grad:'linear-gradient(135deg,#4d41df,#675df9)' },
    { id:2, title:'Data Entry Operator', company:'TechSeva', location:'Remote', locType:'Remote', type:'Full-time', exp:'Fresher', industry:'Technology', salaryNum:15000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹15,000/mo', grad:'linear-gradient(135deg,#5c51a0,#c8bfff)' },
    { id:3, title:'Beauty Consultant', company:'GlowUp Studio', location:'Delhi', locType:'On-site', type:'Freelance', exp:'Fresher', industry:'Retail', salaryNum:8000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹8,000/mo', grad:'linear-gradient(135deg,#875041,#feb5a2)' },
    { id:4, title:'Junior Web Developer', company:'CodeNest', location:'Hybrid', locType:'Hybrid', type:'Full-time', exp:'Fresher', industry:'Technology', salaryNum:22000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹22,000/mo', grad:'linear-gradient(135deg,#2d6a4f,#74c69d)' },
    { id:5, title:'Healthcare Assistant', company:'MediCare Plus', location:'Bangalore', locType:'On-site', type:'Full-time', exp:'Mid-level', industry:'Healthcare', salaryNum:18000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹18,000/mo', grad:'linear-gradient(135deg,#c77dff,#7b2d8b)' },
    { id:6, title:'Content Writer', company:'WordCraft', location:'Remote', locType:'Remote', type:'Freelance', exp:'Fresher', industry:'Technology', salaryNum:9000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹9,000/mo', grad:'linear-gradient(135deg,#4d41df,#875041)' },
    { id:7, title:'Retail Store Manager', company:'FashionHub', location:'Chennai', locType:'On-site', type:'Full-time', exp:'Senior', industry:'Retail', salaryNum:35000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹35,000/mo', grad:'linear-gradient(135deg,#875041,#5c51a0)' },
    { id:8, title:'UI/UX Design Intern', company:'PixelWorks', location:'Hybrid', locType:'Hybrid', type:'Internship', exp:'Fresher', industry:'Technology', salaryNum:7000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹7,000/mo', grad:'linear-gradient(135deg,#675df9,#c8bfff)' },
    { id:9, title:'Primary School Teacher', company:'BrightMinds School', location:'Pune', locType:'On-site', type:'Full-time', exp:'Mid-level', industry:'Education', salaryNum:20000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹20,000/mo', grad:'linear-gradient(135deg,#2d6a4f,#4d41df)' },
    { id:10, title:'Senior Data Analyst', company:'InsightCo', location:'Remote', locType:'Remote', type:'Full-time', exp:'Senior', industry:'Technology', salaryNum:55000, salary:'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹55,000/mo', grad:'linear-gradient(135deg,#4d41df,#2d6a4f)' },
];

const _topCompanies = [
    { name:'TechSeva', industry:'Technology', tagline:'Hiring freshers now!', color:'#4d41df', bg:'rgba(77,65,223,0.10)', icon:'computer' },
    { name:'MediCare Plus', industry:'Healthcare', tagline:'Join our care team', color:'#c77dff', bg:'rgba(199,125,255,0.10)', icon:'health_and_safety' },
    { name:'BrightMinds', industry:'Education', tagline:'Shape future leaders', color:'#2d6a4f', bg:'rgba(45,106,79,0.10)', icon:'school' },
    { name:'FashionHub', industry:'Retail', tagline:'Style meets career', color:'#875041', bg:'rgba(135,80,65,0.10)', icon:'storefront' },
    { name:'PixelWorks', industry:'Design', tagline:'Create. Inspire. Grow.', color:'#5c51a0', bg:'rgba(92,81,160,0.10)', icon:'palette' },
    { name:'WordCraft', industry:'Media', tagline:'Words that matter', color:'#675df9', bg:'rgba(103,93,249,0.10)', icon:'edit_note' },
];

const _jobFilters = { type: new Set(), exp: new Set(), loc: new Set(), industry: new Set(), salary: new Set() };

function toggleJobFilters() {
    const panel = document.getElementById('job-filter-panel');
    const btn = document.getElementById('filter-toggle-btn');
    const isHidden = panel.classList.toggle('hidden');
    btn.style.background = isHidden ? '' : 'rgba(77,65,223,0.12)';
}
window.toggleJobFilters = toggleJobFilters;

function toggleFilter(group, value) {
    const set = _jobFilters[group];
    if (set.has(value)) set.delete(value); else set.add(value);
    // Update chip visual
    document.querySelectorAll(`.filter-chip[data-filter="${group}"][data-value="${value}"]`).forEach(btn => {
        const active = set.has(value);
        btn.style.background = active ? 'rgba(77,65,223,0.15)' : '';
        btn.style.color = active ? '#4d41df' : '';
        btn.style.fontWeight = active ? '700' : '';
    });
    applyJobFilters();
}
window.toggleFilter = toggleFilter;

function clearJobFilters() {
    Object.values(_jobFilters).forEach(s => s.clear());
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.fontWeight = '';
    });
    const input = document.getElementById('job-search-input');
    if (input) input.value = '';
    applyJobFilters();
}
window.clearJobFilters = clearJobFilters;

function _salaryMatch(job, salarySet) {
    if (salarySet.size === 0) return true;
    const n = job.salaryNum;
    if (salarySet.has('under10') && n < 10000) return true;
    if (salarySet.has('10to20') && n >= 10000 && n <= 20000) return true;
    if (salarySet.has('20to40') && n > 20000 && n <= 40000) return true;
    if (salarySet.has('above40') && n > 40000) return true;
    return false;
}

function applyJobFilters() {
    const query = (document.getElementById('job-search-input')?.value || '').toLowerCase();
    const { type, exp, loc, industry, salary } = _jobFilters;

    const filtered = _allJobs.filter(job => {
        if (query && !`${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query)) return false;
        if (type.size && !type.has(job.type)) return false;
        if (exp.size && !exp.has(job.exp)) return false;
        if (loc.size && !loc.has(job.locType)) return false;
        if (industry.size && !industry.has(job.industry)) return false;
        if (!_salaryMatch(job, salary)) return false;
        return true;
    });

    _renderJobCards(filtered);
}
window.applyJobFilters = applyJobFilters;

function _renderJobCards(jobs) {
    const container = document.getElementById('jobs-list-container');
    const empty = document.getElementById('jobs-empty-state');
    const countEl = document.getElementById('jobs-count');
    if (!container) return;

    if (jobs.length === 0) {
        container.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (countEl) countEl.textContent = '';
        return;
    }
    if (empty) empty.classList.add('hidden');
    if (countEl) countEl.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

    const typeColor = t => t === 'Full-time' ? 'background:rgba(77,65,223,0.10);color:#4d41df'
        : t === 'Part-time' ? 'background:rgba(135,80,65,0.10);color:#875041'
        : t === 'Internship' ? 'background:rgba(92,81,160,0.10);color:#5c51a0'
        : 'background:rgba(45,106,79,0.10);color:#2d6a4f';

    container.innerHTML = jobs.map(job => {
        const initials = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return `
        <div class="dash-job-card" onclick="openJobDetail(${job.id})" style="cursor:pointer">
            <div style="display:flex;align-items:flex-start;gap:12px">
                <div class="dash-job-avatar" style="background:${job.grad}">${initials}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                        <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${job.title}</p>
                        <button onclick="event.stopPropagation()" style="flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(77,65,223,0.08);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">
                            <span class="material-symbols-outlined" style="font-size:16px;color:#4d41df">bookmark</span>
                        </button>
                    </div>
                    <p style="font-size:12px;color:#777587;margin-top:2px">${job.company} &bull; ${job.location}</p>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                        <span class="dash-job-badge" style="${typeColor(job.type)}">${job.type}</span>
                        <span class="dash-job-badge" style="background:rgba(56,161,105,0.10);color:#276749">${job.salary}</span>
                        <span class="dash-job-badge" style="background:rgba(119,117,135,0.08);color:#777587">${job.exp}</span>
                    </div>
                </div>
            </div>
            <button onclick="event.stopPropagation();openJobDetail(${job.id})" style="margin-top:12px;width:100%;height:38px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">Apply Now</button>
        </div>`;
    }).join('');
}

function renderTopCompanies() {
    const container = document.getElementById('top-companies-container');
    if (!container) return;
    container.innerHTML = _topCompanies.map(c => `
        <div onclick="filterByCompany('${c.name}')" style="flex-shrink:0;width:130px;background:#fff;border-radius:18px;padding:14px 12px;border:1px solid #eae6f3;box-shadow:0 2px 10px -4px rgba(77,65,223,0.10);cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;text-align:center"
            onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px -4px rgba(77,65,223,0.18)'"
            onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 10px -4px rgba(77,65,223,0.10)'"
            ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
            <div style="width:44px;height:44px;border-radius:12px;background:${c.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
                <span class="material-symbols-outlined" style="font-size:22px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
            </div>
            <p style="font-size:12px;font-weight:700;color:#1b1b24;line-height:1.3">${c.name}</p>
            <p style="font-size:10px;color:#777587;margin-top:2px">${c.industry}</p>
            <p style="font-size:10px;font-weight:600;color:${c.color};margin-top:4px;line-height:1.3">${c.tagline}</p>
        </div>`).join('');
}
window.renderTopCompanies = renderTopCompanies;

function filterByCompany(name) {
    const input = document.getElementById('job-search-input');
    if (input) { input.value = name; applyJobFilters(); }
    // Scroll to job list
    document.getElementById('jobs-list-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.filterByCompany = filterByCompany;

function runAIMatch() {
    const btn = document.querySelector('#screen-jobs button[onclick="runAIMatch()"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.75'; }
    const section = document.getElementById('ai-match-section');
    const container = document.getElementById('ai-match-container');
    if (section) section.classList.remove('hidden');
    if (container) container.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:16px;background:rgba(77,65,223,0.05);border-radius:14px"><span class="material-symbols-outlined text-primary" style="font-size:20px;animation:spin 1s linear infinite">progress_activity</span><p style="font-size:13px;color:#777587">Analysing your profile for best matches...</p></div>`;

    const d = getProfileData();
    const skills = (d.skills || '').toLowerCase();

    setTimeout(() => {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        // Pick relevant jobs based on profile skills, fallback to top 3
        let matched = _allJobs.filter(j => {
            if (!skills) return false;
            return skills.split(',').some(s => s.trim() && j.title.toLowerCase().includes(s.trim()));
        });
        if (matched.length === 0) matched = _allJobs.slice(0, 3);
        matched = matched.slice(0, 4);

        const scores = [98, 94, 89, 85];
        if (!container) return;
        container.innerHTML = matched.map((job, i) => {
            const initials = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const score = scores[i] || 80;
            return `
            <div class="dash-job-card" onclick="openJobDetail(${job.id})" style="border-left:3px solid #4d41df;cursor:pointer">
                <div style="display:flex;align-items:flex-start;gap:12px">
                    <div class="dash-job-avatar" style="background:${job.grad}">${initials}</div>
                    <div style="flex:1;min-width:0">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3">${job.title}</p>
                            <span style="flex-shrink:0;font-size:11px;font-weight:700;color:#4d41df;background:rgba(77,65,223,0.12);padding:2px 8px;border-radius:999px">${score}% match</span>
                        </div>
                        <p style="font-size:12px;color:#777587;margin-top:2px">${job.company} &bull; ${job.location}</p>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                            <span class="dash-job-badge" style="background:rgba(77,65,223,0.10);color:#4d41df">${job.type}</span>
                            <span class="dash-job-badge" style="background:rgba(56,161,105,0.10);color:#276749">${job.salary}</span>
                        </div>
                    </div>
                </div>
                <button onclick="event.stopPropagation();openJobDetail(${job.id})" style="margin-top:12px;width:100%;height:38px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">Apply Now</button>
            </div>`;
        }).join('');
    }, 2000);
}
window.runAIMatch = runAIMatch;

function initJobsPage() {
    renderTopCompanies();
    applyJobFilters();
}
window.initJobsPage = initJobsPage;

// ============================================================
// JOB DETAIL PAGE
// ============================================================

const _jobDetails = {
    1: {
        description: 'Craft India is looking for an experienced Tailoring Instructor to teach stitching, pattern-making, and garment construction to women learners. You will design lesson plans, conduct hands-on sessions, and help students build a career in the fashion industry.',
        requirements: ['Minimum 2 years of tailoring or teaching experience', 'Ability to communicate clearly in Hindi or local language', 'Patience and passion for teaching', 'Basic knowledge of fabric types and sewing machines'],
        skills: ['Tailoring', 'Pattern Making', 'Teaching', 'Communication', 'Fabric Knowledge'],
    },
    2: {
        description: 'TechSeva is hiring a Data Entry Operator to manage and update digital records accurately. You will work remotely, entering data into our systems, verifying information, and maintaining data quality standards.',
        requirements: ['Typing speed of at least 35 WPM', 'Basic computer literacy (MS Office / Google Sheets)', 'Attention to detail', 'Reliable internet connection for remote work'],
        skills: ['Data Entry', 'MS Excel', 'Google Sheets', 'Typing', 'Accuracy'],
    },
    3: {
        description: 'GlowUp Studio is seeking a freelance Beauty Consultant to provide personalised skincare and makeup advice to clients. You will conduct consultations, recommend products, and help clients build confidence through beauty.',
        requirements: ['Certification in beauty or cosmetology preferred', 'Strong interpersonal and communication skills', 'Knowledge of skincare and makeup trends', 'Ability to work flexible hours'],
        skills: ['Skincare', 'Makeup', 'Client Consultation', 'Communication', 'Product Knowledge'],
    },
    4: {
        description: 'CodeNest is looking for a Junior Web Developer to join our hybrid team. You will build and maintain web applications, collaborate with designers, and write clean, efficient code under the guidance of senior developers.',
        requirements: ['Basic knowledge of HTML, CSS, and JavaScript', 'Familiarity with React or any frontend framework is a plus', 'Ability to work in a team environment', 'Eagerness to learn and grow'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    },
    5: {
        description: 'MediCare Plus is hiring a Healthcare Assistant to support medical staff in delivering quality patient care. You will assist with patient monitoring, record-keeping, and ensuring a safe and comfortable environment.',
        requirements: ['Diploma or degree in healthcare or nursing preferred', 'Compassionate and patient-focused attitude', 'Ability to work in shifts', 'Basic knowledge of medical terminology'],
        skills: ['Patient Care', 'Medical Records', 'Communication', 'Empathy', 'First Aid'],
    },
    6: {
        description: 'WordCraft is looking for a freelance Content Writer to create engaging blog posts, social media content, and marketing copy. You will research topics, write original content, and meet deadlines consistently.',
        requirements: ['Strong written communication skills in English', 'Ability to research and write on diverse topics', 'Experience with SEO basics is a plus', 'Self-motivated and deadline-driven'],
        skills: ['Content Writing', 'SEO', 'Research', 'Editing', 'Creativity'],
    },
    7: {
        description: 'FashionHub is seeking a Senior Retail Store Manager to oversee daily operations, manage a team of sales associates, and drive revenue growth. You will ensure excellent customer experience and maintain store standards.',
        requirements: ['Minimum 4 years of retail management experience', 'Strong leadership and team management skills', 'Proven track record of meeting sales targets', 'Excellent customer service orientation'],
        skills: ['Retail Management', 'Team Leadership', 'Sales', 'Customer Service', 'Inventory Management'],
    },
    8: {
        description: 'PixelWorks is offering a UI/UX Design Internship for creative individuals passionate about digital design. You will assist in designing user interfaces, creating wireframes, and conducting user research under senior designers.',
        requirements: ['Basic knowledge of Figma or Adobe XD', 'Understanding of UI/UX principles', 'Portfolio of design work (academic or personal projects accepted)', 'Eagerness to learn and take feedback'],
        skills: ['Figma', 'UI Design', 'Wireframing', 'User Research', 'Creativity'],
    },
    9: {
        description: 'BrightMinds School is hiring a Primary School Teacher to educate students in foundational subjects. You will create engaging lesson plans, assess student progress, and foster a positive learning environment.',
        requirements: ['B.Ed or equivalent teaching qualification', 'Minimum 1 year of teaching experience', 'Strong communication and classroom management skills', 'Passion for child development and education'],
        skills: ['Teaching', 'Lesson Planning', 'Classroom Management', 'Communication', 'Child Development'],
    },
    10: {
        description: 'InsightCo is looking for a Senior Data Analyst to transform complex datasets into actionable business insights. You will build dashboards, conduct statistical analysis, and present findings to leadership teams.',
        requirements: ['3+ years of data analysis experience', 'Proficiency in SQL, Python, or R', 'Experience with BI tools like Tableau or Power BI', 'Strong analytical and problem-solving skills'],
        skills: ['SQL', 'Python', 'Tableau', 'Data Analysis', 'Statistics', 'Power BI'],
    },
};

let _currentJobId = null;

function openJobDetail(jobId) {
    const job = _allJobs.find(j => j.id === jobId);
    if (!job) return;
    _currentJobId = jobId;
    const detail = _jobDetails[jobId] || {
        description: `${job.title} at ${job.company}. Join our team and grow your career in a supportive environment.`,
        requirements: ['Relevant experience or qualification', 'Good communication skills', 'Willingness to learn'],
        skills: [job.type, job.industry, job.exp],
    };

    // Hero card gradient
    const hero = document.getElementById('jd-hero-card');
    if (hero) hero.style.background = job.grad;

    // Avatar initials
    const avatar = document.getElementById('jd-avatar');
    if (avatar) avatar.textContent = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    document.getElementById('jd-company').textContent = job.company;
    document.getElementById('jd-title').textContent = job.title;
    document.getElementById('jd-type-badge').textContent = job.type;
    document.getElementById('jd-loc-badge').textContent = job.locType;
    document.getElementById('jd-exp-badge').textContent = job.exp;
    document.getElementById('jd-salary').textContent = job.salary;
    document.getElementById('jd-location').textContent = job.location;
    document.getElementById('jd-industry').textContent = job.industry;
    document.getElementById('jd-description').textContent = detail.description;

    // Requirements list
    const reqEl = document.getElementById('jd-requirements');
    reqEl.innerHTML = detail.requirements.map(r => `
        <li style="display:flex;align-items:flex-start;gap:8px">
            <span class="material-symbols-outlined text-primary" style="font-size:16px;margin-top:1px;flex-shrink:0;font-variation-settings:'FILL' 1">check_circle</span>
            <span style="font-size:13px;color:#464555;line-height:1.5">${r}</span>
        </li>`).join('');

    // Skills chips
    const skillsEl = document.getElementById('jd-skills');
    skillsEl.innerHTML = detail.skills.map(s => `
        <span style="font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;background:rgba(77,65,223,0.10);color:#4d41df">${s}</span>`).join('');

    // Reset apply button
    const applyBtn = document.getElementById('jd-apply-btn');
    if (applyBtn) { applyBtn.disabled = false; applyBtn.style.opacity = '1'; applyBtn.onclick = function(){ openJobApplyForm(); }; applyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">send</span> Apply Now'; }

    // Bookmark state
    const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]');
    const alreadyApplied = apps.some(a => a.jobId === jobId);
    if (alreadyApplied) {
        if (applyBtn) { applyBtn.disabled = true; applyBtn.style.opacity = '0.7'; applyBtn.onclick = null; applyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">check_circle</span> Already Applied'; }
    }

    navigateTo('job-detail');
}
window.openJobDetail = openJobDetail;

function submitJobApplication() {
    const job = _allJobs.find(j => j.id === _currentJobId);
    if (!job) return;

    const applyBtn = document.getElementById('jd-apply-btn');
    if (applyBtn) { applyBtn.disabled = true; applyBtn.style.opacity = '0.7'; applyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;animation:spin 1s linear infinite">progress_activity</span> Submitting...'; }

    setTimeout(() => {
        // Save to applications
        const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]');
        const alreadyApplied = apps.some(a => a.jobId === job.id);
        if (!alreadyApplied) {
            apps.unshift({
                jobId: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary,
                type: job.type,
                grad: job.grad,
                appliedAt: new Date().toISOString(),
                status: 'Applied',
            });
            localStorage.setItem('tarini_applications', JSON.stringify(apps));
            earnCoins(20, `Applied to ${job.title}`);
            checkAndAwardBadges();
        }

        // Add notification
        addNotification('application', `Applied to ${job.title}`, `Your application to ${job.company} has been submitted successfully.`);

        // Show success toast
        const toast = document.getElementById('jd-success-toast');
        const toastJob = document.getElementById('jd-toast-job');
        if (toastJob) toastJob.textContent = `${job.title} at ${job.company}`;
        if (toast) toast.classList.remove('hidden');

        if (applyBtn) { applyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">check_circle</span> Already Applied'; }
    }, 1200);
}
window.submitJobApplication = submitJobApplication;

function closeJobToast() {
    const toast = document.getElementById('jd-success-toast');
    if (toast) toast.classList.add('hidden');
    navigateTo('jobs');
}
window.closeJobToast = closeJobToast;

function toggleJobBookmark() {
    const icon = document.getElementById('jd-bookmark-icon');
    if (!icon) return;
    const filled = icon.style.fontVariationSettings && icon.style.fontVariationSettings.includes('1');
    icon.style.fontVariationSettings = filled ? "'FILL' 0" : "'FILL' 1";
}
window.toggleJobBookmark = toggleJobBookmark;

// ============================================================
// JOB APPLICATION FORM
// ============================================================

function openJobApplyForm() {
    const job = _allJobs.find(j => j.id === _currentJobId);
    if (!job) return;

    // Pre-fill from profile
    const d = getProfileData();
    const user = auth.currentUser;
    const el = id => document.getElementById(id);

    el('af-name').value = d.name || (user && user.displayName) || '';
    el('af-email').value = (user && user.email) || '';
    el('af-phone').value = d.phone || '';
    el('af-street').value = '';
    el('af-city').value = (d.location || '').split(',')[0]?.trim() || '';
    el('af-state').value = (d.location || '').split(',')[1]?.trim() || '';
    el('af-pincode').value = '';
    el('af-education').value = d.education || '';
    el('af-experience').value = d.experience || 'Fresher';
    el('af-skills').value = d.skills || '';
    el('af-notes').value = '';
    el('af-resume-label').textContent = d.resumeName ? d.resumeName : 'Upload PDF / DOC';

    // Job summary card
    el('apply-job-title').textContent = job.title;
    el('apply-job-company').textContent = job.company + ' ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ' + job.location;
    el('apply-job-type').textContent = job.type;
    el('apply-form-subtitle').textContent = job.company;
    const avatar = el('apply-job-avatar');
    if (avatar) {
        avatar.textContent = job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        avatar.style.background = job.grad;
    }

    // Reset error + button
    const errEl = el('af-error');
    if (errEl) errEl.classList.add('hidden');
    const btn = el('af-submit-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">send</span> Submit Application'; }

    navigateTo('job-apply');
}
window.openJobApplyForm = openJobApplyForm;

function handleApplyResumeChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const label = document.getElementById('af-resume-label');
    if (label) label.textContent = file.name;
}
window.handleApplyResumeChange = handleApplyResumeChange;

function finalSubmitApplication() {
    const job = _allJobs.find(j => j.id === _currentJobId);
    if (!job) return;

    const el = id => document.getElementById(id);
    const errEl = el('af-error');
    const btn = el('af-submit-btn');

    // Collect values
    const name    = el('af-name').value.trim();
    const email   = el('af-email').value.trim();
    const phone   = el('af-phone').value.trim();
    const street  = el('af-street').value.trim();
    const city    = el('af-city').value.trim();
    const state   = el('af-state').value.trim();
    const pincode = el('af-pincode').value.trim();
    const edu     = el('af-education').value;
    const skills  = el('af-skills').value.trim();
    const exp     = el('af-experience').value;
    const notes   = el('af-notes').value.trim();
    const resumeFile = el('af-resume').files[0];

    // Validate
    if (!name || !email || !phone || !street || !city || !state || !pincode || !edu || !skills) {
        if (errEl) { errEl.textContent = 'Please fill in all required fields.'; errEl.classList.remove('hidden'); }
        return;
    }
    if (!/^\d{10,13}$/.test(phone)) {
        if (errEl) { errEl.textContent = 'Enter a valid phone number (10ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ13 digits).'; errEl.classList.remove('hidden'); }
        return;
    }
    if (!/^\d{6}$/.test(pincode)) {
        if (errEl) { errEl.textContent = 'Enter a valid 6-digit pincode.'; errEl.classList.remove('hidden'); }
        return;
    }
    if (errEl) errEl.classList.add('hidden');

    // Loading state
    if (btn) { btn.disabled = true; btn.style.opacity = '0.75'; btn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;animation:spin 1s linear infinite">progress_activity</span> Submitting...'; }

    const user = auth.currentUser;

    const doSave = (resumeName) => {
        const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]');
        const alreadyApplied = apps.some(a => a.jobId === job.id);
        if (!alreadyApplied) {
            apps.unshift({
                jobId:      job.id,
                userId:     user ? user.uid : 'guest',
                companyId:  job.company.toLowerCase().replace(/\s+/g, '_'),
                title:      job.title,
                company:    job.company,
                location:   job.location,
                salary:     job.salary,
                type:       job.type,
                industry:   job.industry,
                grad:       job.grad,
                appliedAt:  new Date().toISOString(),
                status:     'Applied',
                applicant: { name, email, phone, address: `${street}, ${city}, ${state} - ${pincode}`, education: edu, experience: exp, skills, notes, resumeName: resumeName || '' },
            });
            localStorage.setItem('tarini_applications', JSON.stringify(apps));
            earnCoins(20, `Applied to ${job.title}`);
            checkAndAwardBadges();
        }

        addNotification('application', `Applied to ${job.title}`, `Your application to ${job.company} has been submitted successfully.`);

        // Update apply button on detail page
        const applyBtn = document.getElementById('jd-apply-btn');
        if (applyBtn) { applyBtn.disabled = true; applyBtn.style.opacity = '0.7'; applyBtn.onclick = null; applyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">check_circle</span> Already Applied'; }

        // Show success toast (on job detail screen)
        const toast = document.getElementById('jd-success-toast');
        const toastJob = document.getElementById('jd-toast-job');
        if (toastJob) toastJob.textContent = `${job.title} at ${job.company}`;

        // Navigate to job-detail first so toast is visible there
        navigateTo('job-detail');
        setTimeout(() => { if (toast) toast.classList.remove('hidden'); }, 150);
    };

    setTimeout(() => {
        if (resumeFile) {
            const reader = new FileReader();
            reader.onload = () => doSave(resumeFile.name);
            reader.readAsDataURL(resumeFile);
        } else {
            doSave('');
        }
    }, 1000);
}
window.finalSubmitApplication = finalSubmitApplication;

// ============================================================
// MY APPLICATIONS SCREEN
// ============================================================

function loadApplicationsScreen() {
    const container = document.getElementById('applications-list-container');
    if (!container) return;

    const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]');

    if (apps.length === 0) {
        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0;text-align:center">
                <div style="width:64px;height:64px;border-radius:50%;background:rgba(77,65,223,0.10);display:flex;align-items:center;justify-content:center;margin-bottom:16px">
                    <span class="material-symbols-outlined" style="font-size:32px;color:#4d41df;font-variation-settings:'FILL' 1">work_history</span>
                </div>
                <p style="font-size:15px;font-weight:700;color:#1b1b24">No applications yet</p>
                <p style="font-size:13px;color:#777587;margin-top:4px">Start applying to jobs to track them here</p>
                <button onclick="navigateTo('jobs')" style="margin-top:16px;padding:10px 24px;border-radius:999px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">Browse Jobs</button>
            </div>`;
        return;
    }

    const statusStyle = s => s === 'Applied'
        ? 'background:rgba(77,65,223,0.10);color:#4d41df'
        : s === 'Reviewed'
        ? 'background:rgba(45,106,79,0.10);color:#276749'
        : s === 'Shortlisted'
        ? 'background:rgba(92,81,160,0.10);color:#5c51a0'
        : 'background:rgba(135,80,65,0.10);color:#875041';

    container.innerHTML = apps.map((app, idx) => {
        const initials = app.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const date = new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
        <div style="background:#fff;border-radius:18px;padding:16px;border:1px solid #eae6f3;box-shadow:0 2px 12px -4px rgba(77,65,223,0.08);margin-bottom:12px">
            <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0;background:${app.grad || 'linear-gradient(135deg,#4d41df,#5c51a0)'}">${initials}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                        <div style="flex:1;min-width:0">
                            <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${app.title}</p>
                            <p style="font-size:12px;color:#777587;margin-top:2px">${app.company} &bull; ${app.location}</p>
                        </div>
                        <span style="flex-shrink:0;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${statusStyle(app.status)}">${app.status}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                        <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(77,65,223,0.08);color:#4d41df">${app.type || ''}</span>
                        <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(56,161,105,0.08);color:#276749">${app.salary || ''}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;margin-top:8px">
                        <span class="material-symbols-outlined" style="font-size:13px;color:#9e9bb8">calendar_today</span>
                        <p style="font-size:11px;color:#9e9bb8">Applied on ${date}</p>
                    </div>
                </div>
            </div>
            ${app.applicant ? `
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0ecf9">
                <p style="font-size:11px;font-weight:600;color:#9e9bb8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Applicant Details</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px">
                    <p style="font-size:12px;color:#464555"><span style="color:#9e9bb8">Name:</span> ${app.applicant.name}</p>
                    <p style="font-size:12px;color:#464555"><span style="color:#9e9bb8">Phone:</span> ${app.applicant.phone}</p>
                    <p style="font-size:12px;color:#464555;grid-column:1/-1"><span style="color:#9e9bb8">Education:</span> ${app.applicant.education}</p>
                    <p style="font-size:12px;color:#464555;grid-column:1/-1"><span style="color:#9e9bb8">Experience:</span> ${app.applicant.experience}</p>
                </div>
            </div>` : ''}
        </div>`;
    }).join('');
}
window.loadApplicationsScreen = loadApplicationsScreen;

// ============================================================
// BACK NAVIGATION ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â My Applications
// ============================================================

function goBackFromApplications() {
    // Pop the last screen from the stack; fall back to dashboard
    const prev = _navStack.length > 0 ? _navStack.pop() : 'dashboard';
    // Never go back to login or another no-nav screen that doesn't make sense
    const safe = ['dashboard', 'jobs', 'job-detail', 'profile', 'shop', 'my-shop', 'cart'].includes(prev) ? prev : 'dashboard';
    navigateTo(safe);
}
window.goBackFromApplications = goBackFromApplications;

// Hardware back button / Android back gesture support
window.addEventListener('popstate', (e) => {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    const screenId = activeScreen.id.replace('screen-', '');
    // If on applications, use our custom back logic
    if (screenId === 'applications') {
        e.preventDefault();
        goBackFromApplications();
        // Push a new state so the next back press is handled again
        history.pushState({ screen: screenId }, '', window.location.pathname);
    }
});

// Push a state entry whenever we navigate so popstate fires on back gesture
const _origNavigateTo = navigateTo;
// Wrap navigateTo to also push browser history state (enables swipe-back on mobile)
(function () {
    const _orig = window.navigateTo;
    window.navigateTo = function (screenId) {
        _orig(screenId);
        if (screenId !== 'login') {
            history.pushState({ screen: screenId }, '', window.location.pathname);
        }
    };
})();

// ============================================================
// SKILL HUB PAGE
// ============================================================

const _skillCategories = [
    { name:'Design',        icon:'palette',           color:'#5c51a0', bg:'rgba(92,81,160,0.12)',   grad:'linear-gradient(135deg,#5c51a0,#c8bfff)' },
    { name:'Development',   icon:'code',              color:'#4d41df', bg:'rgba(77,65,223,0.12)',   grad:'linear-gradient(135deg,#4d41df,#675df9)' },
    { name:'Marketing',     icon:'campaign',          color:'#875041', bg:'rgba(135,80,65,0.12)',   grad:'linear-gradient(135deg,#875041,#feb5a2)' },
    { name:'Finance',       icon:'payments',          color:'#276749', bg:'rgba(45,106,79,0.12)',   grad:'linear-gradient(135deg,#276749,#74c69d)' },
    { name:'Communication', icon:'forum',             color:'#675df9', bg:'rgba(103,93,249,0.12)',  grad:'linear-gradient(135deg,#675df9,#c4c0ff)' },
    { name:'Business',      icon:'business_center',   color:'#c77dff', bg:'rgba(199,125,255,0.12)', grad:'linear-gradient(135deg,#c77dff,#e5deff)' },
    { name:'Basics',        icon:'lightbulb',         color:'#e63946', bg:'rgba(230,57,70,0.10)',   grad:'linear-gradient(135deg,#e63946,#ffb3b8)' },
    { name:'Smartphone',    icon:'smartphone',        color:'#4d41df', bg:'rgba(77,65,223,0.12)',   grad:'linear-gradient(135deg,#4d41df,#5c51a0)' },
];
const _allCourses = [
    { id:1,  ytId:'dU1xS07N-FA', title:'Figma for Beginners',              instructor:'DesignCraft',   category:'Design',        level:'Beginner',     durLabel:'1.5h',  durKey:'short',  type:'Free', rating:4.8, enrolled:3200, desc:'Learn UI design fundamentals using Figma from wireframes to polished prototypes.' },
    { id:2,  ytId:'w7ejDZ8SWv8', title:'React.js Essentials',              instructor:'CodeNest',      category:'Development',   level:'Intermediate', durLabel:'4h',    durKey:'medium', type:'Free', rating:4.7, enrolled:5100, desc:'Build modern web apps with React hooks, components, and state management.' },
    { id:3,  ytId:'nU-IIXBWlS4', title:'Digital Marketing Masterclass',    instructor:'GrowthLab',     category:'Marketing',     level:'Beginner',     durLabel:'3h',    durKey:'medium', type:'Paid', rating:4.6, enrolled:2800, desc:'Master SEO, social media, email campaigns, and paid ads from scratch.' },
    { id:4,  ytId:'HQzoZfc3GwQ', title:'Personal Finance Basics',          instructor:'MoneyWise',     category:'Finance',       level:'Beginner',     durLabel:'1h',    durKey:'short',  type:'Free', rating:4.9, enrolled:7400, desc:'Understand budgeting, savings, investments, and financial planning for everyday life.' },
    { id:5,  ytId:'tShavGuo0_E', title:'Public Speaking Confidence',       instructor:'SpeakUp India', category:'Communication', level:'Beginner',     durLabel:'2h',    durKey:'short',  type:'Free', rating:4.5, enrolled:1900, desc:'Overcome stage fear and communicate with clarity, confidence, and impact.' },
    { id:6,  ytId:'Fqch5OrUPvA', title:'Business Plan Writing',            instructor:'StartupSchool', category:'Business',      level:'Intermediate', durLabel:'2.5h',  durKey:'medium', type:'Paid', rating:4.7, enrolled:1500, desc:'Write a compelling business plan that attracts investors and guides your startup.' },
    { id:7,  ytId:'1Rs2ND1ryYc', title:'Advanced CSS and Animations',      instructor:'PixelWorks',    category:'Development',   level:'Advanced',     durLabel:'6h',    durKey:'long',   type:'Paid', rating:4.6, enrolled:2100, desc:'Deep-dive into CSS Grid, Flexbox, custom animations, and responsive design patterns.' },
    { id:8,  ytId:'p7HKvqRI_Bo', title:'Stock Market for Women',           instructor:'InvestHer',     category:'Finance',       level:'Beginner',     durLabel:'3h',    durKey:'medium', type:'Paid', rating:4.8, enrolled:3300, desc:'Demystify the stock market and learn how to invest smartly and build long-term wealth.' },
    { id:9,  ytId:'0JCUH5daCCE', title:'Brand Identity Design',            instructor:'DesignCraft',   category:'Design',        level:'Intermediate', durLabel:'5h',    durKey:'long',   type:'Paid', rating:4.7, enrolled:1800, desc:'Create powerful brand identities with logos, colour palettes, typography, and style guides.' },
    { id:10, ytId:'r-uWLhO2v9U', title:'Python for Data Analysis',         instructor:'DataSeva',      category:'Development',   level:'Intermediate', durLabel:'8h',    durKey:'long',   type:'Free', rating:4.9, enrolled:6200, desc:'Use Python, Pandas, and Matplotlib to analyse real-world datasets and visualise insights.' },
    { id:11, ytId:'sPW9r5NDLSE', title:'Effective Email Writing',          instructor:'SpeakUp India', category:'Communication', level:'Beginner',     durLabel:'45min', durKey:'short',  type:'Free', rating:4.4, enrolled:980,  desc:'Write professional emails that get responses - structure, tone, and etiquette covered.' },
    { id:12, ytId:'ZpL0oGFBsDg', title:'Entrepreneurship 101',             instructor:'StartupSchool', category:'Business',      level:'Beginner',     durLabel:'4h',    durKey:'medium', type:'Free', rating:4.6, enrolled:4100, desc:'From idea to execution - learn the mindset, tools, and steps to launch your own venture.' },
    { id:13, ytId:'Ks-_Mh1QhMc', title:'How to Use a Smartphone',         instructor:'TechSaathi',    category:'Smartphone',    level:'Beginner',     durLabel:'30min', durKey:'short',  type:'Free', rating:4.9, enrolled:8200, desc:'Simple step-by-step guide to using a smartphone - calls, messages, apps, and internet.' },
    { id:14, ytId:'mP_ZMmgFHPY', title:'Internet Basics for Beginners',   instructor:'TechSaathi',    category:'Basics',        level:'Beginner',     durLabel:'25min', durKey:'short',  type:'Free', rating:4.8, enrolled:6100, desc:'Learn what the internet is, how to browse safely, and use Google and WhatsApp.' },
    { id:15, ytId:'VvCytJvd4H0', title:'Basic Computer Skills',            instructor:'DigiLearn',     category:'Basics',        level:'Beginner',     durLabel:'40min', durKey:'short',  type:'Free', rating:4.7, enrolled:5400, desc:'Learn to use a computer from scratch - typing, files, and basic applications.' },
    { id:16, ytId:'eIho2S0ZahI', title:'How to Start a Small Business',    instructor:'StartupSchool', category:'Basics',        level:'Beginner',     durLabel:'35min', durKey:'short',  type:'Free', rating:4.8, enrolled:4900, desc:'Simple guide to starting your own small business with little money and big ideas.' },
    { id:17, ytId:'9bZkp7q19f0', title:'Simple Communication Skills',      instructor:'SpeakUp India', category:'Basics',        level:'Beginner',     durLabel:'20min', durKey:'short',  type:'Free', rating:4.6, enrolled:3800, desc:'Learn to speak clearly and confidently in everyday situations at home and work.' },
    { id:18, ytId:'kqtD5dpn9C8', title:'WhatsApp and Video Calls Guide',   instructor:'TechSaathi',    category:'Smartphone',    level:'Beginner',     durLabel:'20min', durKey:'short',  type:'Free', rating:4.9, enrolled:7100, desc:'Learn to use WhatsApp, make video calls, and share photos with family and friends.' },
    { id:19, ytId:'2ePf9rue1Ao', title:'Save Money Every Day',             instructor:'MoneyWise',     category:'Finance',       level:'Beginner',     durLabel:'18min', durKey:'short',  type:'Free', rating:4.7, enrolled:5200, desc:'Easy tips to save money from your daily income and build a small emergency fund.' },
    { id:20, ytId:'dQw4w9WgXcQ', title:'Basic Sewing and Tailoring',       instructor:'CraftIndia',    category:'Basics',        level:'Beginner',     durLabel:'45min', durKey:'short',  type:'Free', rating:4.8, enrolled:4300, desc:'Learn basic hand stitching and simple tailoring skills to make and repair clothes.' },
];
const _skillFilters = { cat: new Set(), level: new Set(), dur: new Set(), type: new Set() };

function toggleSkillFilters() {
    const panel = document.getElementById('skill-filter-panel');
    const btn   = document.getElementById('skill-filter-btn');
    const hidden = panel.classList.toggle('hidden');
    btn.style.background = hidden ? '' : 'rgba(77,65,223,0.12)';
}
window.toggleSkillFilters = toggleSkillFilters;

function toggleSkillFilter(group, value) {
    const set = _skillFilters[group];
    if (set.has(value)) set.delete(value); else set.add(value);
    document.querySelectorAll(`.skill-chip[data-sf="${group}"][data-sv="${value}"]`).forEach(btn => {
        const on = set.has(value);
        btn.style.background = on ? 'rgba(77,65,223,0.15)' : '';
        btn.style.color      = on ? '#4d41df' : '';
        btn.style.fontWeight = on ? '700' : '';
    });
    applySkillFilters();
}
window.toggleSkillFilter = toggleSkillFilter;

function clearSkillFilters() {
    Object.values(_skillFilters).forEach(s => s.clear());
    document.querySelectorAll('.skill-chip').forEach(b => { b.style.background = ''; b.style.color = ''; b.style.fontWeight = ''; });
    const inp = document.getElementById('skill-search-input');
    if (inp) inp.value = '';
    applySkillFilters();
}
window.clearSkillFilters = clearSkillFilters;

function applySkillFilters() {
    const q = (document.getElementById('skill-search-input')?.value || '').toLowerCase();
    const { cat, level, dur, type } = _skillFilters;
    const filtered = _allCourses.filter(c => {
        if (q && !`${c.title} ${c.instructor} ${c.category}`.toLowerCase().includes(q)) return false;
        if (cat.size   && !cat.has(c.category))  return false;
        if (level.size && !level.has(c.level))   return false;
        if (dur.size   && !dur.has(c.durKey))    return false;
        if (type.size  && !type.has(c.type))     return false;
        return true;
    });
    _renderCourseCards(filtered);
}
window.applySkillFilters = applySkillFilters;

function _renderCourseCards(courses) {
    const container = document.getElementById('skill-courses-container');
    const empty     = document.getElementById('skill-empty-state');
    const countEl   = document.getElementById('skill-courses-count');
    if (!container) return;
    if (courses.length === 0) {
        container.innerHTML = '';
        if (empty)   empty.classList.remove('hidden');
        if (countEl) countEl.textContent = '';
        return;
    }
    if (empty)   empty.classList.add('hidden');
    if (countEl) countEl.textContent = courses.length + ' course' + (courses.length !== 1 ? 's' : '');
    _renderCourseCardsInto(container, courses);
}

function openCourseVideo(courseId) {
    const course = _allCourses.find(c => c.id === courseId);
    if (!course) return;
    const modal   = document.getElementById('course-video-modal');
    const iframe  = document.getElementById('course-video-iframe');
    const titleEl = document.getElementById('course-video-title');
    const metaEl  = document.getElementById('course-video-meta');
    if (!modal || !iframe) return;
    if (titleEl) titleEl.textContent = course.title;
    if (metaEl)  metaEl.textContent  = course.instructor + ' \u2022 ' + course.category + ' \u2022 ' + course.durLabel;
    iframe.src = 'https://www.youtube.com/embed/' + course.ytId + '?autoplay=1&rel=0&modestbranding=1';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    enrollCourse(courseId);
}
window.openCourseVideo = openCourseVideo;

function closeCourseVideo() {
    const modal  = document.getElementById('course-video-modal');
    const iframe = document.getElementById('course-video-iframe');
    if (iframe) iframe.src = '';
    if (modal)  modal.classList.add('hidden');
    document.body.style.overflow = '';
}
window.closeCourseVideo = closeCourseVideo;

function enrollCourse(courseId) {
    const course = _allCourses.find(c => c.id === courseId);
    if (!course) return;
    const key = 'tarini_enrolled';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.includes(courseId)) return;
    list.push(courseId);
    localStorage.setItem(key, JSON.stringify(list));
    showToast('Enrolled in "' + course.title + '" \u2713');
    addNotification('system', 'Enrolled: ' + course.title, 'You have successfully enrolled in ' + course.title + ' by ' + course.instructor + '.');
    earnCoins(15, 'Enrolled in ' + course.title);
    checkAndAwardBadges();
}
window.enrollCourse = enrollCourse;

function _renderSkillCategories() {
    const container = document.getElementById('skill-categories-container');
    if (!container) return;
    container.innerHTML = _skillCategories.slice(0, 6).map(c => `
        <div onclick="openSkillCategory('${c.name}')"
            style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;width:68px">
            <div style="width:60px;height:60px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px -4px rgba(77,65,223,0.15);transition:transform 0.15s,box-shadow 0.15s"
                onmouseenter="this.style.transform='scale(1.08)';this.style.boxShadow='0 8px 20px -4px rgba(77,65,223,0.22)'"
                onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px -4px rgba(77,65,223,0.15)'"
                ontouchstart="this.style.transform='scale(0.94)'" ontouchend="this.style.transform=''">
                <span class="material-symbols-outlined" style="font-size:26px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
            </div>
            <p style="font-size:11px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3;word-break:break-word">${c.name}</p>
        </div>`).join('');
}

function openSkillCategory(name) {
    const cat = _skillCategories.find(c => c.name === name);
    const courses = _allCourses.filter(c => c.category === name);
    // Update category page header
    const titleEl = document.getElementById('skill-cat-page-title');
    const iconEl  = document.getElementById('skill-cat-page-icon');
    const countEl = document.getElementById('skill-cat-page-count');
    if (titleEl) titleEl.textContent = name;
    if (iconEl && cat) {
        iconEl.style.background = cat.bg;
        iconEl.querySelector('span').style.color = cat.color;
        iconEl.querySelector('span').textContent = cat.icon;
    }
    if (countEl) countEl.textContent = courses.length + ' course' + (courses.length !== 1 ? 's' : '');
    // Render filtered cards into category page container
    const container = document.getElementById('skill-cat-courses-container');
    if (container) {
        if (courses.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:48px 0"><span class="material-symbols-outlined text-outline-variant" style="font-size:48px">search_off</span><p class="text-on-surface-variant font-semibold mt-2">No courses in this category yet</p></div>';
        } else {
            _renderCourseCardsInto(container, courses);
        }
    }
    navigateTo('skill-categories');
}
window.openSkillCategory = openSkillCategory;

function filterBySkillCategory(name) {
    _skillFilters.cat.clear();
    _skillFilters.cat.add(name);
    document.querySelectorAll('.skill-chip[data-sf="cat"]').forEach(b => {
        const on = b.getAttribute('data-sv') === name;
        b.style.background = on ? 'rgba(77,65,223,0.15)' : '';
        b.style.color      = on ? '#4d41df' : '';
        b.style.fontWeight = on ? '700' : '';
    });
    applySkillFilters();
    document.getElementById('skill-courses-container')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.filterBySkillCategory = filterBySkillCategory;

function openAllCategories() {
    const grid = document.getElementById('all-categories-grid');
    if (grid) {
        grid.innerHTML = _skillCategories.map(c => {
            const count = _allCourses.filter(x => x.category === c.name).length;
            return `
            <div onclick="openSkillCategory('${c.name}')"
                style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:12px 4px;border-radius:16px;transition:background 0.15s"
                onmouseenter="this.style.background='rgba(77,65,223,0.05)'"
                onmouseleave="this.style.background=''">
                <div style="width:64px;height:64px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px -4px rgba(77,65,223,0.15)">
                    <span class="material-symbols-outlined" style="font-size:28px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
                </div>
                <p style="font-size:12px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3">${c.name}</p>
                <p style="font-size:10px;color:#9e9bb8">${count} course${count !== 1 ? 's' : ''}</p>
            </div>`;
        }).join('');
    }
    // Show all-categories grid on the skill-categories screen (not a category detail)
    const titleEl = document.getElementById('skill-cat-page-title');
    const iconEl  = document.getElementById('skill-cat-page-icon');
    const countEl = document.getElementById('skill-cat-page-count');
    const container = document.getElementById('skill-cat-courses-container');
    if (titleEl) titleEl.textContent = 'All Categories';
    if (iconEl)  iconEl.style.display = 'none';
    if (countEl) countEl.textContent = '';
    if (container) container.innerHTML = '';
    document.getElementById('all-categories-grid').style.display = 'grid';
    document.getElementById('skill-cat-courses-container').style.display = 'none';
    navigateTo('skill-categories');
}
window.openAllCategories = openAllCategories;

// Shared helper: render course cards into any container element
function _renderCourseCardsInto(container, courses) {
    const levelColor = l => l === 'Beginner'     ? 'background:rgba(45,106,79,0.10);color:#276749'
                          : l === 'Intermediate' ? 'background:rgba(77,65,223,0.10);color:#4d41df'
                          :                        'background:rgba(135,80,65,0.10);color:#875041';
    const typeColor  = t => t === 'Free' ? 'background:rgba(45,106,79,0.10);color:#276749'
                          :                'background:rgba(92,81,160,0.10);color:#5c51a0';
    const stars = r => {
        const full = Math.floor(r);
        return Array.from({length:5}, (_,i) =>
            `<span class="material-symbols-outlined" style="font-size:13px;color:${i < full ? '#f59e0b' : '#d1d5db'};font-variation-settings:'FILL' 1">star</span>`
        ).join('');
    };
    container.innerHTML = courses.map(c => {
        const catMeta = _skillCategories.find(x => x.name === c.category) || { bg:'rgba(77,65,223,0.12)', color:'#4d41df', icon:'school' };
        const enrolled = JSON.parse(localStorage.getItem('tarini_enrolled') || '[]').includes(c.id);
        // Try hqdefault first, fall back to mqdefault via onerror
        const thumbHq = 'https://img.youtube.com/vi/' + c.ytId + '/hqdefault.jpg';
        const thumbMq = 'https://img.youtube.com/vi/' + c.ytId + '/mqdefault.jpg';
        return `
        <div style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #eae6f3;box-shadow:0 2px 12px -4px rgba(77,65,223,0.08);transition:transform 0.15s,box-shadow 0.15s"
            onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px -4px rgba(77,65,223,0.14)'"
            onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 12px -4px rgba(77,65,223,0.08)'"
            ontouchstart="this.style.transform='scale(0.98)'" ontouchend="this.style.transform=''">
            <div onclick="openCourseVideo(${c.id})" style="position:relative;width:100%;height:160px;cursor:pointer;overflow:hidden;background:${catMeta.bg}">
                <img src="${thumbHq}" alt="${c.title}"
                    style="width:100%;height:100%;object-fit:cover;display:block"
                    onerror="this.src='${thumbMq}';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex'}"/>
                <div style="display:none;width:100%;height:100%;background:${catMeta.bg};align-items:center;justify-content:center;position:absolute;inset:0">
                    <span class="material-symbols-outlined" style="font-size:40px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>
                </div>
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.22);transition:background 0.2s"
                    onmouseenter="this.style.background='rgba(0,0,0,0.38)'" onmouseleave="this.style.background='rgba(0,0,0,0.22)'">
                    <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.28);transition:transform 0.15s"
                        onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform=''">
                        <span class="material-symbols-outlined" style="font-size:26px;color:#4d41df;font-variation-settings:'FILL' 1;margin-left:3px">play_arrow</span>
                    </div>
                </div>
                <span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.72);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px">${c.durLabel}</span>
                ${enrolled ? '<span style="position:absolute;top:8px;left:8px;background:rgba(45,106,79,0.90);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">Enrolled</span>' : ''}
            </div>
            <div style="padding:14px 16px 16px">
                <div style="display:flex;align-items:flex-start;gap:10px">
                    <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${catMeta.bg}">
                        <span class="material-symbols-outlined" style="font-size:18px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>
                    </div>
                    <div style="flex:1;min-width:0">
                        <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3">${c.title}</p>
                        <p style="font-size:12px;color:#777587;margin-top:2px">${c.instructor} &bull; ${c.category}</p>
                    </div>
                </div>
                <p style="font-size:12px;color:#464555;margin-top:8px;line-height:1.5">${c.desc}</p>
                <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                    <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;${levelColor(c.level)}">${c.level}</span>
                    <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;${typeColor(c.type)}">${c.type}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                    <div style="display:flex;align-items:center;gap:4px">
                        ${stars(c.rating)}
                        <span style="font-size:12px;font-weight:700;color:#1b1b24;margin-left:2px">${c.rating}</span>
                        <span style="font-size:11px;color:#9e9bb8">(${c.enrolled.toLocaleString('en-IN')})</span>
                    </div>
                    <button onclick="openCourseVideo(${c.id})" style="height:34px;padding:0 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:5px;transition:opacity 0.15s" onmouseenter="this.style.opacity='0.88'" onmouseleave="this.style.opacity='1'">
                        <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">play_circle</span>Watch
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}
window._renderCourseCardsInto = _renderCourseCardsInto;

function initSkillsPage() {
    _renderSkillCategories();
    applySkillFilters();
}
window.initSkillsPage = initSkillsPage;

// ============================================================
// MARKETPLACE PAGE
// ============================================================

const _marketCategories = [
    { name:'Handicrafts', icon:'category',        color:'#4d41df', bg:'rgba(77,65,223,0.12)'   },
    { name:'Clothing',    icon:'checkroom',        color:'#875041', bg:'rgba(135,80,65,0.12)'   },
    { name:'Jewellery',   icon:'diamond',          color:'#5c51a0', bg:'rgba(92,81,160,0.12)'   },
    { name:'Food',        icon:'restaurant',       color:'#276749', bg:'rgba(45,106,79,0.12)'   },
    { name:'Art',         icon:'palette',          color:'#675df9', bg:'rgba(103,93,249,0.12)'  },
    { name:'Beauty',      icon:'spa',              color:'#c77dff', bg:'rgba(199,125,255,0.12)' },
    { name:'Home Decor',  icon:'chair',            color:'#875041', bg:'rgba(135,80,65,0.10)'   },
    { name:'Stationery',  icon:'edit_note',        color:'#4d41df', bg:'rgba(77,65,223,0.10)'   },
];

const _marketProducts = [
    { id:'m1', image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', name:'Hand-embroidered Dupatta',  seller:'Meena Crafts',   sellerType:'user',    category:'Clothing',    price:850,  stock:12, rating:4.8, desc:'Beautifully hand-embroidered dupatta with traditional motifs.' },
    { id:'m2', image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', name:'Terracotta Earrings Set',   seller:'Clay & Co.',     sellerType:'company', category:'Jewellery',   price:320,  stock:30, rating:4.7, desc:'Lightweight terracotta earrings, eco-friendly and unique.' },
    { id:'m3', image:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80', name:'Organic Turmeric Powder',   seller:'Spice Garden',   sellerType:'user',    category:'Food',        price:180,  stock:50, rating:4.9, desc:'100% organic turmeric sourced directly from farms.' },
    { id:'m4', image:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', name:'Madhubani Art Print',        seller:'ArtByPriya',     sellerType:'user',    category:'Art',         price:1200, stock:5,  rating:4.6, desc:'Original Madhubani art print on handmade paper.' },
    { id:'m5', image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', name:'Handwoven Jute Bag',         seller:'GreenWeave',     sellerType:'company', category:'Handicrafts', price:450,  stock:20, rating:4.5, desc:'Eco-friendly jute bag, perfect for daily use.' },
    { id:'m6', image:'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80', name:'Rose & Sandalwood Soap',     seller:'NaturalGlow',    sellerType:'user',    category:'Beauty',      price:150,  stock:40, rating:4.8, desc:'Handmade cold-process soap with natural ingredients.' },
    { id:'m7', image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', name:'MacramÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© Wall Hanging',       seller:'KnotArt Studio', sellerType:'company', category:'Home Decor',  price:2200, stock:8,  rating:4.7, desc:'Handcrafted macramÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© wall hanging, boho style.' },
    { id:'m8', image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80', name:'Handmade Greeting Cards',    seller:'PaperLove',      sellerType:'user',    category:'Stationery',  price:80,   stock:100,rating:4.4, desc:'Set of 5 handmade greeting cards for all occasions.' },
    { id:'m9', image:'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80', name:'Silk Thread Bangles',        seller:'Meena Crafts',   sellerType:'user',    category:'Jewellery',   price:250,  stock:25, rating:4.6, desc:'Colourful silk thread bangles, set of 6.' },
    { id:'m10',name:'Handloom Cotton Saree',      seller:'WeaversHub',     sellerType:'company', category:'Clothing',    price:3500, stock:15, rating:4.9, desc:'Pure handloom cotton saree with natural dyes.' },
];

const _marketFilters = { cat: new Set(), price: new Set(), seller: new Set(), stock: new Set() };

function toggleMarketFilters() {
    const panel = document.getElementById('market-filter-panel');
    const btn   = document.getElementById('market-filter-btn');
    const hidden = panel.classList.toggle('hidden');
    btn.style.background = hidden ? '' : 'rgba(77,65,223,0.12)';
}
window.toggleMarketFilters = toggleMarketFilters;

function toggleMarketFilter(group, value) {
    const set = _marketFilters[group];
    if (set.has(value)) set.delete(value); else set.add(value);
    document.querySelectorAll(`.market-chip[data-mf="${group}"][data-mv="${value}"]`).forEach(btn => {
        const on = set.has(value);
        btn.style.background = on ? 'rgba(77,65,223,0.15)' : '';
        btn.style.color      = on ? '#4d41df' : '';
        btn.style.fontWeight = on ? '700' : '';
    });
    applyMarketFilters();
}
window.toggleMarketFilter = toggleMarketFilter;

function clearMarketFilters() {
    Object.values(_marketFilters).forEach(s => s.clear());
    document.querySelectorAll('.market-chip').forEach(b => { b.style.background = ''; b.style.color = ''; b.style.fontWeight = ''; });
    const inp = document.getElementById('market-search-input');
    if (inp) inp.value = '';
    applyMarketFilters();
}
window.clearMarketFilters = clearMarketFilters;

function _priceMatch(p, priceSet) {
    if (priceSet.size === 0) return true;
    if (priceSet.has('under500')  && p.price < 500)                    return true;
    if (priceSet.has('500to2k')   && p.price >= 500 && p.price <= 2000) return true;
    if (priceSet.has('above2k')   && p.price > 2000)                   return true;
    return false;
}

function _getFilteredProducts() {
    const q = (document.getElementById('market-search-input')?.value || '').toLowerCase();
    const { cat, price, seller, stock } = _marketFilters;

    // Merge catalogue + user's own shop products
    const userProds = getShopProducts().map(p => ({
        id: 'u' + p.id, name: p.name, seller: 'My Shop', sellerType: 'user',
        category: p.category || 'Handicrafts', price: Number(p.price) || 0,
        stock: Number(p.stock) || 0, rating: 0, image: p.image || '', desc: p.description || '',
    }));
    const all = [..._marketProducts, ...userProds];

    return all.filter(p => {
        if (q && !`${p.name} ${p.seller} ${p.category}`.toLowerCase().includes(q)) return false;
        if (cat.size    && !cat.has(p.category))                                    return false;
        if (!_priceMatch(p, price))                                                 return false;
        if (seller.size && !seller.has(p.sellerType))                               return false;
        if (stock.size) {
            if (stock.has('instock')    && p.stock <= 0) return false;
            if (stock.has('outofstock') && p.stock > 0)  return false;
        }
        return true;
    });
}

function applyMarketFilters() {
    const filtered = _getFilteredProducts();
    _renderMarketAllProducts(filtered);
}
window.applyMarketFilters = applyMarketFilters;

function _productCard(p, horizontal) {
    const catMeta = _marketCategories.find(c => c.name === p.category) || { color:'#4d41df', bg:'rgba(77,65,223,0.10)', icon:'category' };
    const stars = r => r > 0 ? Array.from({length:5}, (_,i) =>
        `<span class="material-symbols-outlined" style="font-size:11px;color:${i < Math.floor(r) ? '#f59e0b' : '#d1d5db'};font-variation-settings:'FILL' 1">star</span>`
    ).join('') : '';
    const imgContent = p.image
        ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><span class="material-symbols-outlined" style="display:none;font-size:32px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>`
        : `<span class="material-symbols-outlined" style="font-size:32px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>`;

    if (horizontal) {
        return `
        <div style="flex-shrink:0;width:160px;background:#fff;border-radius:18px;border:1px solid #eae6f3;box-shadow:0 2px 10px -4px rgba(77,65,223,0.10);overflow:hidden;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s"
            onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px -4px rgba(77,65,223,0.18)'"
            onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 10px -4px rgba(77,65,223,0.10)'"
            ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
            <div style="width:100%;height:110px;background:${catMeta.bg};display:flex;align-items:center;justify-content:center;overflow:hidden">${imgContent}</div>
            <div style="padding:10px">
                <p style="font-size:12px;font-weight:700;color:#1b1b24;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</p>
                <p style="font-size:10px;color:#777587;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.seller}</p>
                <div style="display:flex;align-items:center;gap:2px;margin-top:3px">${stars(p.rating)}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
                    <p style="font-size:13px;font-weight:800;color:#4d41df">&#8377;${p.price.toLocaleString('en-IN')}</p>
                    <button onclick="event.stopPropagation();buyProduct('${p.id}')" style="height:26px;padding:0 10px;border-radius:8px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:10px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">Buy</button>
                </div>
            </div>
        </div>`;
    }

    return `
    <div style="background:#fff;border-radius:18px;border:1px solid #eae6f3;box-shadow:0 2px 10px -4px rgba(77,65,223,0.08);overflow:hidden;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s"
        onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px -4px rgba(77,65,223,0.16)'"
        onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 10px -4px rgba(77,65,223,0.08)'"
        ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
        <div style="width:100%;height:120px;background:${catMeta.bg};display:flex;align-items:center;justify-content:center;overflow:hidden">${imgContent}</div>
        <div style="padding:10px">
            <p style="font-size:12px;font-weight:700;color:#1b1b24;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.name}</p>
            <p style="font-size:10px;color:#777587;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.seller}</p>
            <div style="display:flex;align-items:center;gap:2px;margin-top:3px">${stars(p.rating)}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:4px">
                <p style="font-size:13px;font-weight:800;color:#4d41df">&#8377;${p.price.toLocaleString('en-IN')}</p>
                <button onclick="event.stopPropagation();buyProduct('${p.id}')" style="height:28px;padding:0 10px;border-radius:8px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:10px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;white-space:nowrap">Buy</button>
            </div>
            ${p.stock <= 0 ? '<p style="font-size:10px;color:#ba1a1a;font-weight:600;margin-top:3px">Out of stock</p>' : ''}
        </div>
    </div>`;
}

function _renderMarketPopular() {
    const container = document.getElementById('market-popular-container');
    if (!container) return;
    const popular = _marketProducts.slice(0, 6);
    container.innerHTML = popular.map(p => _productCard(p, true)).join('');
}

function _renderMarketAllProducts(products) {
    const container = document.getElementById('market-all-products');
    const empty     = document.getElementById('market-empty-state');
    const countEl   = document.getElementById('market-products-count');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '';
        if (empty)   empty.classList.remove('hidden');
        if (countEl) countEl.textContent = '';
        return;
    }
    if (empty)   empty.classList.add('hidden');
    if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    container.innerHTML = products.map(p => _productCard(p, false)).join('');
}

function showAllMarketProducts() {
    clearMarketFilters();
    document.getElementById('market-all-products')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.showAllMarketProducts = showAllMarketProducts;

function buyProduct(productId) {
    addToCart(productId);
}
window.buyProduct = buyProduct;

function _renderMarketCategories() {
    const container = document.getElementById('market-categories-container');
    if (!container) return;
    container.innerHTML = _marketCategories.slice(0, 6).map(c => `
        <div onclick="filterByMarketCategory('${c.name}')"
            style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;width:68px">
            <div style="width:60px;height:60px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px -4px rgba(77,65,223,0.15);transition:transform 0.15s,box-shadow 0.15s"
                onmouseenter="this.style.transform='scale(1.08)';this.style.boxShadow='0 8px 20px -4px rgba(77,65,223,0.22)'"
                onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px -4px rgba(77,65,223,0.15)'"
                ontouchstart="this.style.transform='scale(0.94)'" ontouchend="this.style.transform=''">
                <span class="material-symbols-outlined" style="font-size:26px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
            </div>
            <p style="font-size:11px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3;word-break:break-word">${c.name}</p>
        </div>`).join('');
}

function filterByMarketCategory(name) {
    _marketFilters.cat.clear();
    _marketFilters.cat.add(name);
    document.querySelectorAll('.market-chip[data-mf="cat"]').forEach(b => {
        const on = b.getAttribute('data-mv') === name;
        b.style.background = on ? 'rgba(77,65,223,0.15)' : '';
        b.style.color      = on ? '#4d41df' : '';
        b.style.fontWeight = on ? '700' : '';
    });
    applyMarketFilters();
    document.getElementById('market-all-products')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.filterByMarketCategory = filterByMarketCategory;

function openAllMarketCategories() {
    const grid = document.getElementById('market-all-categories-grid');
    if (grid) {
        grid.innerHTML = _marketCategories.map(c => {
            const count = _marketProducts.filter(p => p.category === c.name).length;
            return `
            <div onclick="navigateTo('shop');setTimeout(()=>filterByMarketCategory('${c.name}'),200)"
                style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:12px 4px;border-radius:16px;transition:background 0.15s"
                onmouseenter="this.style.background='rgba(77,65,223,0.05)'"
                onmouseleave="this.style.background=''">
                <div style="width:64px;height:64px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px -4px rgba(77,65,223,0.15)">
                    <span class="material-symbols-outlined" style="font-size:28px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
                </div>
                <p style="font-size:12px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3">${c.name}</p>
                <p style="font-size:10px;color:#9e9bb8">${count} products</p>
            </div>`;
        }).join('');
    }
    navigateTo('market-categories');
}
window.openAllMarketCategories = openAllMarketCategories;

function initMarketplace() {
    _renderMarketCategories();
    _renderMarketPopular();
    applyMarketFilters();
    renderShopProducts();   // keep existing My Listings in sync
}
window.initMarketplace = initMarketplace;

// ============================================================
// CART
// ============================================================

function _getCart() { return JSON.parse(localStorage.getItem('tarini_cart') || '[]'); }
function _saveCart(c) { localStorage.setItem('tarini_cart', JSON.stringify(c)); }

function _updateCartBadge() {
    const cart = _getCart();
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (total > 0) { badge.textContent = total > 9 ? '9+' : total; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
}

function addToCart(productId) {
    const all = [..._marketProducts, ...getShopProducts().map(p => ({
        id: 'u' + p.id, name: p.name, price: Number(p.price) || 0,
        image: p.image || '', category: p.category || 'Handicrafts',
        seller: 'My Shop', stock: Number(p.stock) || 0,
    }))];
    const p = all.find(x => x.id === productId);
    if (!p) return;
    const cart = _getCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) { existing.qty = Math.min(existing.qty + 1, p.stock || 99); }
    else { cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, seller: p.seller || '', qty: 1, stock: p.stock || 99 }); }
    _saveCart(cart);
    _updateCartBadge();
    showToast(`"${p.name}" added to cart ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ`);
}
window.addToCart = addToCart;

function removeFromCart(productId) {
    _saveCart(_getCart().filter(i => i.id !== productId));
    _updateCartBadge();
    renderCart();
}
window.removeFromCart = removeFromCart;

function updateCartQty(productId, delta) {
    const cart = _getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, Math.min(item.qty + delta, item.stock || 99));
    _saveCart(cart);
    _updateCartBadge();
    renderCart();
}
window.updateCartQty = updateCartQty;

function clearCart() {
    _saveCart([]);
    _updateCartBadge();
    renderCart();
}
window.clearCart = clearCart;

function renderCart() {
    const cart = _getCart();
    const listEl   = document.getElementById('cart-items-list');
    const emptyEl  = document.getElementById('cart-empty');
    const barEl    = document.getElementById('cart-checkout-bar');
    const totalEl  = document.getElementById('cart-total');
    const countEl  = document.getElementById('cart-item-count-label');
    if (!listEl) return;

    const itemCount = cart.reduce((s, i) => s + i.qty, 0);
    if (countEl) countEl.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;

    if (cart.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (barEl)   barEl.classList.add('hidden');
        return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');
    if (barEl)   barEl.classList.remove('hidden');

    const grandTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (totalEl) totalEl.textContent = 'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹' + grandTotal.toLocaleString('en-IN');

    listEl.innerHTML = cart.map(item => `
        <div style="background:#fff;border-radius:18px;padding:14px;border:1px solid #eae6f3;box-shadow:0 2px 10px -4px rgba(77,65,223,0.08);display:flex;align-items:center;gap:12px">
            <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;flex-shrink:0;background:rgba(77,65,223,0.08);display:flex;align-items:center;justify-content:center">
                ${item.image
                    ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><span class="material-symbols-outlined" style="display:none;font-size:28px;color:#4d41df;font-variation-settings:'FILL' 1">image</span>`
                    : `<span class="material-symbols-outlined" style="font-size:28px;color:#4d41df;font-variation-settings:'FILL' 1">image</span>`}
            </div>
            <div style="flex:1;min-width:0">
                <p style="font-size:13px;font-weight:700;color:#1b1b24;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</p>
                <p style="font-size:11px;color:#777587;margin-top:1px">${item.seller}</p>
                <p style="font-size:14px;font-weight:800;color:#4d41df;margin-top:4px">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${(item.price * item.qty).toLocaleString('en-IN')}</p>
                <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
                    <button onclick="updateCartQty('${item.id}',-1)" style="width:28px;height:28px;border-radius:8px;border:1px solid #eae6f3;background:#f6f2ff;color:#4d41df;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center">ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢</button>
                    <span style="font-size:14px;font-weight:700;color:#1b1b24;min-width:20px;text-align:center">${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}',1)" style="width:28px;height:28px;border-radius:8px;border:1px solid #eae6f3;background:#f6f2ff;color:#4d41df;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
                    <button onclick="removeFromCart('${item.id}')" style="margin-left:auto;width:28px;height:28px;border-radius:8px;border:none;background:rgba(186,26,26,0.08);color:#ba1a1a;cursor:pointer;display:flex;align-items:center;justify-content:center">
                        <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                    </button>
                </div>
            </div>
        </div>`).join('');
}
window.renderCart = renderCart;

function proceedToCheckout() {
    const cart = _getCart();
    if (cart.length === 0) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cart.forEach(item => addNotification('order', `Order: ${item.name}`, `Your order for ${item.name} (ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â${item.qty}) has been placed.`));
    clearCart();
    showToast(`Order placed! Total: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${total.toLocaleString('en-IN')} ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ`);
    navigateTo('shop');
}
window.proceedToCheckout = proceedToCheckout;

// ============================================================
// MY SHOP (Seller View)
// ============================================================

function initMyShop() {
    const products = getShopProducts();
    const listEl   = document.getElementById('myshop-products-list');
    const emptyEl  = document.getElementById('myshop-empty');
    const totalEl  = document.getElementById('myshop-total-count');
    const instockEl= document.getElementById('myshop-instock-count');
    const soldEl   = document.getElementById('myshop-sold-count');
    if (!listEl) return;

    if (totalEl)   totalEl.textContent   = products.length;
    if (instockEl) instockEl.textContent = products.filter(p => Number(p.stock) > 0).length;
    if (soldEl)    soldEl.textContent    = products.filter(p => Number(p.stock) === 0).length;

    if (products.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) { emptyEl.classList.remove('hidden'); emptyEl.style.display = ''; }
        return;
    }
    if (emptyEl) { emptyEl.classList.add('hidden'); emptyEl.style.display = 'none'; }

    listEl.innerHTML = products.slice().reverse().map(p => {
        const inStock = Number(p.stock) > 0;
        const statusStyle = inStock
            ? 'background:rgba(45,106,79,0.10);color:#276749'
            : 'background:rgba(186,26,26,0.08);color:#ba1a1a';
        const statusLabel = inStock ? 'Available' : 'Sold Out';
        return `
        <div style="background:#fff;border-radius:18px;padding:14px;border:1px solid #eae6f3;box-shadow:0 2px 10px -4px rgba(77,65,223,0.08);display:flex;align-items:center;gap:12px">
            <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;flex-shrink:0;background:rgba(77,65,223,0.08);display:flex;align-items:center;justify-content:center">
                ${p.image
                    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><span class="material-symbols-outlined" style="display:none;font-size:28px;color:#4d41df;font-variation-settings:'FILL' 1">image</span>`
                    : `<span class="material-symbols-outlined" style="font-size:28px;color:#4d41df;font-variation-settings:'FILL' 1">image</span>`}
            </div>
            <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                    <p style="font-size:13px;font-weight:700;color:#1b1b24;line-height:1.3;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</p>
                    <span style="flex-shrink:0;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;${statusStyle}">${statusLabel}</span>
                </div>
                <p style="font-size:14px;font-weight:800;color:#4d41df;margin-top:3px">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(p.price).toLocaleString('en-IN')}</p>
                <p style="font-size:11px;color:#777587;margin-top:1px">Stock: ${p.stock} &bull; ${p.category || 'Uncategorised'}</p>
                <div style="display:flex;gap:8px;margin-top:8px">
                    <button onclick="openPostProduct(${p.id})" style="height:28px;padding:0 12px;border-radius:8px;border:1px solid rgba(77,65,223,0.25);background:rgba(77,65,223,0.06);color:#4d41df;font-size:11px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:4px">
                        <span class="material-symbols-outlined" style="font-size:13px">edit</span>Edit
                    </button>
                    <button onclick="deleteMyShopProduct(${p.id})" style="height:28px;padding:0 12px;border-radius:8px;border:1px solid rgba(186,26,26,0.20);background:rgba(186,26,26,0.06);color:#ba1a1a;font-size:11px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:4px">
                        <span class="material-symbols-outlined" style="font-size:13px">delete</span>Delete
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}
window.initMyShop = initMyShop;

function deleteMyShopProduct(productId) {
    if (!confirm('Delete this product?')) return;
    saveShopProducts(getShopProducts().filter(p => p.id !== productId));
    initMyShop();
    initMarketplace();
}
window.deleteMyShopProduct = deleteMyShopProduct;

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Initialise cart badge on page load ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
document.addEventListener('DOMContentLoaded', () => { _updateCartBadge(); });

// ============================================================
// REWARDS ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â TARINI COINS, TASKS & BADGES
// ============================================================

const _REWARDS_KEY = 'tarini_rewards';

function _getRewards() {
    return JSON.parse(localStorage.getItem(_REWARDS_KEY) || JSON.stringify({
        coins: 0, streak: 0, lastLogin: null, activity: [], earnedBadges: []
    }));
}
function _saveRewards(r) { localStorage.setItem(_REWARDS_KEY, JSON.stringify(r)); }

// Earn coins and log activity
function earnCoins(amount, reason) {
    const r = _getRewards();
    r.coins += amount;
    r.activity.unshift({ amount, reason, time: new Date().toISOString() });
    r.activity = r.activity.slice(0, 20);
    _saveRewards(r);
    _animateCoinEarn(amount);
}
window.earnCoins = earnCoins;

function _animateCoinEarn(amount) {
    const el = document.getElementById('rewards-total-points');
    if (!el) return;
    // Flash animation
    el.style.transition = 'transform 0.2s ease, color 0.2s ease';
    el.style.transform = 'scale(1.3)';
    el.style.color = '#f59e0b';
    setTimeout(() => { el.style.transform = 'scale(1)'; el.style.color = ''; }, 400);
    // Floating +N toast
    const toast = document.createElement('div');
    toast.textContent = `+${amount} ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚ÂªÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢`;
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#4d41df,#675df9);color:#fff;font-size:14px;font-weight:800;padding:8px 16px;border-radius:999px;z-index:9999;animation:coinFloat 1.8s ease-out forwards;pointer-events:none;box-shadow:0 4px 16px rgba(77,65,223,0.4)';
    if (!document.getElementById('coin-float-style')) {
        const s = document.createElement('style');
        s.id = 'coin-float-style';
        s.textContent = '@keyframes coinFloat{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:1;transform:translateY(-40px) scale(1.1)}100%{opacity:0;transform:translateY(-70px) scale(0.8)}}';
        document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1900);
}

// Daily login streak
function _checkDailyLogin() {
    const r = _getRewards();
    const today = new Date().toDateString();
    if (r.lastLogin === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    r.streak = (r.lastLogin === yesterday) ? (r.streak || 0) + 1 : 1;
    r.lastLogin = today;
    _saveRewards(r);
    earnCoins(10, 'Daily login bonus');
    checkAndAwardBadges();
}

// Badge definitions
const _allBadges = [
    { id: 'first_login',    icon: 'waving_hand',        color: '#4d41df', bg: 'rgba(77,65,223,0.12)',   name: 'Welcome!',          desc: 'Joined Tarini',                  condition: r => true },
    { id: 'profile_star',   icon: 'person_check',       color: '#276749', bg: 'rgba(45,106,79,0.12)',   name: 'Profile \u0938\u094d\u091f\u093e\u0930',  desc: 'Completed your profile',         condition: r => computeProfileProgress() >= 100 },
    { id: 'first_apply',    icon: 'send',               color: '#875041', bg: 'rgba(135,80,65,0.12)',   name: 'First Apply',       desc: 'Applied to your first job',      condition: () => (JSON.parse(localStorage.getItem('tarini_applications')||'[]')).length >= 1 },
    { id: 'rising_talent',  icon: 'trending_up',        color: '#675df9', bg: 'rgba(103,93,249,0.12)',  name: 'Rising Talent',     desc: 'Applied to 3+ jobs',             condition: () => (JSON.parse(localStorage.getItem('tarini_applications')||'[]')).length >= 3 },
    { id: 'skill_learner',  icon: 'school',             color: '#5c51a0', bg: 'rgba(92,81,160,0.12)',   name: 'Skill Learner',     desc: 'Enrolled in a course',           condition: r => r.activity.some(a => a.reason.startsWith('Enrolled in')) },
    { id: 'seller_debut',   icon: 'storefront',         color: '#c77dff', bg: 'rgba(199,125,255,0.12)', name: 'Seller Debut',      desc: 'Listed your first product',      condition: () => getShopProducts().length >= 1 },
    { id: 'top_seller',     icon: 'workspace_premium',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  name: 'Top Seller',        desc: 'Listed 5+ products',             condition: () => getShopProducts().length >= 5 },
    { id: 'streak_3',       icon: 'local_fire_department', color: '#e63946', bg: 'rgba(230,57,70,0.10)', name: 'On Fire!',         desc: '3-day login streak',             condition: r => (r.streak || 0) >= 3 },
    { id: 'streak_7',       icon: 'bolt',               color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  name: 'Consistent User',   desc: '7-day login streak',             condition: r => (r.streak || 0) >= 7 },
    { id: 'coin_100',       icon: 'monetization_on',    color: '#276749', bg: 'rgba(45,106,79,0.12)',   name: 'Coin Collector',    desc: 'Earned 100+ Tarini Coins',       condition: r => r.coins >= 100 },
    { id: 'coin_500',       icon: 'diamond',            color: '#4d41df', bg: 'rgba(77,65,223,0.12)',   name: 'Coin Champion',     desc: 'Earned 500+ Tarini Coins',       condition: r => r.coins >= 500 },
    { id: 'design_pro',     icon: 'palette',            color: '#5c51a0', bg: 'rgba(92,81,160,0.12)',   name: 'Design Pro',        desc: 'Enrolled in a Design course',    condition: r => r.activity.some(a => a.reason.toLowerCase().includes('figma') || a.reason.toLowerCase().includes('brand')) },
];

function checkAndAwardBadges() {
    const r = _getRewards();
    let newBadge = false;
    _allBadges.forEach(b => {
        if (!r.earnedBadges.includes(b.id) && b.condition(r)) {
            r.earnedBadges.push(b.id);
            newBadge = true;
            _showBadgeUnlockToast(b);
        }
    });
    if (newBadge) _saveRewards(r);
}
window.checkAndAwardBadges = checkAndAwardBadges;

function _showBadgeUnlockToast(badge) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:#fff;border:2px solid rgba(77,65,223,0.25);border-radius:20px;padding:12px 20px;display:flex;align-items:center;gap:12px;z-index:9999;box-shadow:0 8px 32px rgba(77,65,223,0.20);animation:fadeIn 0.3s ease-out;min-width:260px;max-width:320px';
    el.innerHTML = `<div style="width:40px;height:40px;border-radius:12px;background:${badge.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:22px;color:${badge.color};font-variation-settings:'FILL' 1">${badge.icon}</span></div><div><p style="font-size:12px;font-weight:700;color:#4d41df">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚ÂÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Badge Unlocked!</p><p style="font-size:13px;font-weight:700;color:#1b1b24">${badge.name}</p><p style="font-size:11px;color:#777587">${badge.desc}</p></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; setTimeout(() => el.remove(), 400); }, 3000);
}

// Task definitions (evaluated fresh each call)
function _getDailyTasks() {
    const r = _getRewards();
    const today = new Date().toDateString();
    const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]');
    const todayApps = apps.filter(a => new Date(a.appliedAt).toDateString() === today);
    const profilePct = computeProfileProgress();
    return [
        { id: 'daily_login',    icon: 'login',          color: '#4d41df', coins: 10, label: 'Daily Login',          desc: 'Open the app today',              done: r.lastLogin === today },
        { id: 'complete_profile', icon: 'person_check', color: '#276749', coins: 50, label: 'Complete Profile',     desc: 'Fill all profile fields',         done: profilePct >= 100 },
        { id: 'apply_job',      icon: 'send',           color: '#875041', coins: 20, label: 'Apply to a Job',       desc: 'Submit a job application',        done: todayApps.length >= 1 },
        { id: 'enroll_course',  icon: 'school',         color: '#5c51a0', coins: 15, label: 'Enroll in a Course',   desc: 'Join any Skill Hub course',       done: r.activity.some(a => a.reason.startsWith('Enrolled in') && new Date(a.time).toDateString() === today) },
        { id: 'list_product',   icon: 'storefront',     color: '#c77dff', coins: 25, label: 'List a Product',       desc: 'Add a product to your shop',      done: r.activity.some(a => a.reason === 'Listed a new product' && new Date(a.time).toDateString() === today) },
    ];
}

function initRewardsScreen() {
    _checkDailyLogin();
    checkAndAwardBadges();
    const r = _getRewards();

    // Update header stats
    const coinsEl = document.getElementById('rewards-total-points');
    const badgeEl = document.getElementById('rewards-badge-count');
    const streakEl = document.getElementById('rewards-streak');
    if (coinsEl) coinsEl.textContent = r.coins;
    if (badgeEl) badgeEl.textContent = r.earnedBadges.length;
    if (streakEl) streakEl.textContent = r.streak || 0;

    _renderTasks();
    _renderActivity(r);
    _renderBadges(r);
}
window.initRewardsScreen = initRewardsScreen;

function _renderTasks() {
    const container = document.getElementById('rewards-tasks-container');
    const label = document.getElementById('tasks-done-label');
    if (!container) return;
    const tasks = _getDailyTasks();
    const done = tasks.filter(t => t.done).length;
    if (label) label.textContent = `${done}/${tasks.length} done`;

    container.innerHTML = tasks.map(t => `
        <div style="display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:12px 14px;border:1px solid ${t.done ? 'rgba(45,106,79,0.20)' : '#eae6f3'};box-shadow:0 2px 8px -4px rgba(77,65,223,0.08);transition:all 0.2s;${t.done ? 'opacity:0.75' : ''}">
            <div style="width:40px;height:40px;border-radius:12px;background:${t.done ? 'rgba(45,106,79,0.12)' : `rgba(${t.color === '#4d41df' ? '77,65,223' : t.color === '#276749' ? '45,106,79' : t.color === '#875041' ? '135,80,65' : t.color === '#5c51a0' ? '92,81,160' : '199,125,255'},0.12)`};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <span class="material-symbols-outlined" style="font-size:20px;color:${t.done ? '#276749' : t.color};font-variation-settings:'FILL' 1">${t.done ? 'check_circle' : t.icon}</span>
            </div>
            <div style="flex:1;min-width:0">
                <p style="font-size:13px;font-weight:700;color:${t.done ? '#276749' : '#1b1b24'};${t.done ? 'text-decoration:line-through' : ''}">${t.label}</p>
                <p style="font-size:11px;color:#777587;margin-top:1px">${t.desc}</p>
            </div>
            <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">
                <span class="material-symbols-outlined" style="font-size:14px;color:#f59e0b;font-variation-settings:'FILL' 1">monetization_on</span>
                <span style="font-size:12px;font-weight:700;color:#1b1b24">+${t.coins}</span>
            </div>
        </div>`).join('');
}

function _renderActivity(r) {
    const container = document.getElementById('rewards-activity-container');
    if (!container) return;
    if (!r.activity.length) {
        container.innerHTML = `<div style="text-align:center;padding:24px 0;color:#9e9bb8;font-size:13px">No activity yet. Start earning coins!</div>`;
        return;
    }
    container.innerHTML = r.activity.slice(0, 6).map(a => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border-radius:14px;border:1px solid #eae6f3">
            <div style="width:32px;height:32px;border-radius:10px;background:rgba(77,65,223,0.10);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <span class="material-symbols-outlined" style="font-size:16px;color:#4d41df;font-variation-settings:'FILL' 1">monetization_on</span>
            </div>
            <p style="flex:1;font-size:12px;color:#464555;line-height:1.4">${a.reason}</p>
            <span style="font-size:12px;font-weight:800;color:#276749;flex-shrink:0">+${a.amount}</span>
        </div>`).join('');
}

function _renderBadges(r) {
    const container = document.getElementById('rewards-list-container');
    const label = document.getElementById('badges-earned-label');
    if (!container) return;
    if (label) label.textContent = `${r.earnedBadges.length} earned`;

    container.innerHTML = _allBadges.map(b => {
        const earned = r.earnedBadges.includes(b.id);
        return `
        <div style="background:#fff;border-radius:18px;padding:14px 10px;border:${earned ? `2px solid ${b.color}30` : '1px solid #eae6f3'};box-shadow:${earned ? `0 4px 16px -4px ${b.color}30` : '0 2px 8px -4px rgba(77,65,223,0.06)'};text-align:center;transition:transform 0.15s;${earned ? '' : 'opacity:0.45;filter:grayscale(0.6)'}"
            onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
            <div style="width:48px;height:48px;border-radius:14px;background:${earned ? b.bg : 'rgba(119,117,135,0.08)'};display:flex;align-items:center;justify-content:center;margin:0 auto 8px;position:relative">
                <span class="material-symbols-outlined" style="font-size:24px;color:${earned ? b.color : '#9e9bb8'};font-variation-settings:'FILL' 1">${b.icon}</span>
                ${earned ? `<span style="position:absolute;-top:4px;-right:4px;width:14px;height:14px;background:#276749;border-radius:50%;display:flex;align-items:center;justify-content:center;top:-4px;right:-4px"><span class="material-symbols-outlined" style="font-size:10px;color:#fff;font-variation-settings:'FILL' 1">check</span></span>` : ''}
            </div>
            <p style="font-size:11px;font-weight:700;color:${earned ? '#1b1b24' : '#9e9bb8'};line-height:1.3">${b.name}</p>
            <p style="font-size:10px;color:#9e9bb8;margin-top:2px;line-height:1.3">${b.desc}</p>
        </div>`;
    }).join('');
}



// ============================================================
// COMPANY DATA — separate localStorage key from women user profile
// ============================================================

function getCompanyData() {
    return JSON.parse(localStorage.getItem('companyProfileData') || '{}');
}

function saveCompanyData(data) {
    localStorage.setItem('companyProfileData', JSON.stringify(data));
}

// ============================================================
// COMPANY NAVIGATION
// ============================================================

function companyNavTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screenId);
    if (!target) return;
    target.classList.add('active');

    const bottomNav = document.getElementById('bottom-nav');
    const companyNav = document.getElementById('company-bottom-nav');
    const globalHeader = document.getElementById('global-header');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (companyNav) companyNav.classList.remove('hidden');
    if (globalHeader) {
        if (screenId === 'edit-company-profile') globalHeader.classList.add('hidden');
        else globalHeader.classList.remove('hidden');
    }

    // Map sub-screens to nav tabs
    const navTargetMap = { 'edit-company-profile': 'company-profile' };
    const activeTarget = navTargetMap[screenId] || screenId;

    document.querySelectorAll('.co-nav-item').forEach(item => {
        item.classList.remove('text-indigo-600', 'scale-110');
        item.classList.add('text-slate-400');
        const icon = item.querySelector('.co-nav-icon');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
        if (item.getAttribute('data-co-target') === activeTarget) {
            item.classList.remove('text-slate-400');
            item.classList.add('text-indigo-600', 'scale-110');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
    });

    if (screenId === 'company-dashboard') loadCompanyDashboard();
    if (screenId === 'company-profile') loadCompanyProfileScreen();
    if (screenId === 'company-applications') loadCompanyApplications();

    history.pushState({ screen: screenId }, '', window.location.pathname);
}
window.companyNavTo = companyNavTo;

// ============================================================
// COMPANY DASHBOARD
// ============================================================

function _getCompanyId() {
    const d = getCompanyData();
    const user = auth.currentUser;
    const name = d.name || (user && user.displayName) || '';
    return name.toLowerCase().replace(/\s+/g, '_');
}

function loadCompanyDashboard() {
    const d = getCompanyData();
    const user = auth.currentUser;
    const name = d.name || (user && user.displayName) || 'Company';

    const nameEl = document.getElementById('company-dashboard-name');
    if (nameEl) nameEl.textContent = 'Welcome, ' + name;

    updateCompanyHeaderAvatar();

    if (!user) return;
    const companyId = _getCompanyId();

    // Active jobs from Firestore
    db.collection('jobs').where('companyId', '==', user.uid).get()
        .then(snap => { const el = document.getElementById('co-stat-jobs'); if (el) el.textContent = snap.size; })
        .catch(() => {});

    // Applications stats — Firestore first, localStorage fallback
    db.collection('applications').where('companyId', '==', companyId).get()
        .then(snap => _setCompanyStats(snap.docs.map(d => d.data())))
        .catch(() => {
            const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]').filter(a => a.companyId === companyId);
            _setCompanyStats(apps);
        });
}

function _setCompanyStats(apps) {
    const el = document.getElementById('co-stat-apps');
    const slEl = document.getElementById('co-stat-shortlisted');
    const hiEl = document.getElementById('co-stat-hired');
    if (el) el.textContent = apps.length;
    if (slEl) slEl.textContent = apps.filter(a => a.status === 'Shortlisted').length;
    if (hiEl) hiEl.textContent = apps.filter(a => a.status === 'Hired').length;
}

function updateCompanyHeaderAvatar() {
    const d = getCompanyData();
    const img = document.getElementById('header-avatar-img');
    const icon = document.getElementById('header-avatar-icon');
    if (!img || !icon) return;
    if (d.logo) {
        img.src = d.logo;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        icon.classList.remove('hidden');
        icon.textContent = 'business';
    }
}

// ============================================================
// COMPANY PROFILE SCREEN
// ============================================================

function loadCompanyProfileScreen() {
    const d = getCompanyData();
    const user = auth.currentUser;
    const name = d.name || (user && user.displayName) || 'Company';

    const set = (id, val, fallback) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || fallback || '\u2014';
    };
    set('co-profile-name', name, 'Company Name');
    set('co-profile-industry', d.industry, 'Industry not set');
    set('co-profile-location', d.location, 'Location not set');
    set('co-profile-website', d.website, 'Website not set');
    set('co-profile-desc', d.description, 'No description added yet.');
    set('co-profile-email', d.email || (user && user.email));
    set('co-profile-phone', d.phone);
    set('co-profile-address', d.address);

    const img = document.getElementById('co-logo-img');
    const icon = document.getElementById('co-logo-icon');
    if (img && icon) {
        if (d.logo) { img.src = d.logo; img.classList.remove('hidden'); icon.classList.add('hidden'); }
        else { img.classList.add('hidden'); icon.classList.remove('hidden'); }
    }
}
window.loadCompanyProfileScreen = loadCompanyProfileScreen;

function handleCompanyLogoChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const d = getCompanyData();
        d.logo = e.target.result;
        saveCompanyData(d);
        loadCompanyProfileScreen();
        updateCompanyHeaderAvatar();
    };
    reader.readAsDataURL(file);
}
window.handleCompanyLogoChange = handleCompanyLogoChange;

function openEditCompanyProfile() {
    const d = getCompanyData();
    const user = auth.currentUser;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('ecp-name', d.name || (user && user.displayName));
    set('ecp-industry', d.industry);
    set('ecp-desc', d.description);
    set('ecp-location', d.location);
    set('ecp-website', d.website);
    set('ecp-email', d.email || (user && user.email));
    set('ecp-phone', d.phone);
    companyNavTo('edit-company-profile');
}
window.openEditCompanyProfile = openEditCompanyProfile;

function saveCompanyProfile() {
    const d = getCompanyData();
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    d.name = get('ecp-name');
    d.industry = get('ecp-industry');
    d.description = get('ecp-desc');
    d.location = get('ecp-location');
    d.website = get('ecp-website');
    d.email = get('ecp-email');
    d.phone = get('ecp-phone');
    saveCompanyData(d);
    // Sync name to profileData so dashboard greeting updates
    const pd = getProfileData();
    if (d.name) { pd.name = d.name; saveProfileData(pd); }
    companyNavTo('company-profile');
    showToast('Company profile saved!');
}
window.saveCompanyProfile = saveCompanyProfile;

// ============================================================
// COMPANY APPLICATIONS
// ============================================================

function loadCompanyApplications() {
    const companyId = _getCompanyId();
    const container = document.getElementById('co-applications-list');
    if (!container) return;

    const apps = JSON.parse(localStorage.getItem('tarini_applications') || '[]').filter(a => a.companyId === companyId);

    if (apps.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-secondary" style="font-size:32px;font-variation-settings:'FILL' 1">assignment</span>
                </div>
                <p class="font-bold text-on-surface text-[15px]">No applications yet</p>
                <p class="text-[13px] text-on-surface-variant mt-1">Applications from candidates will appear here.</p>
            </div>`;
        return;
    }

    const statusStyle = s => s === 'Applied' ? 'background:rgba(77,65,223,0.10);color:#4d41df'
        : s === 'Shortlisted' ? 'background:rgba(92,81,160,0.10);color:#5c51a0'
        : s === 'Hired' ? 'background:rgba(45,106,79,0.10);color:#276749'
        : 'background:rgba(135,80,65,0.10);color:#875041';

    container.innerHTML = apps.map(app => {
        const date = new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
        <div style="background:#fff;border-radius:18px;padding:16px;border:1px solid #eae6f3;box-shadow:0 2px 12px -4px rgba(77,65,223,0.08)">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                <div>
                    <p style="font-size:14px;font-weight:700;color:#1b1b24">${app.applicant ? app.applicant.name : 'Applicant'}</p>
                    <p style="font-size:12px;color:#777587;margin-top:2px">${app.title} &bull; ${app.location}</p>
                    <p style="font-size:11px;color:#9e9bb8;margin-top:4px">Applied ${date}</p>
                </div>
                <span style="flex-shrink:0;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${statusStyle(app.status)}">${app.status}</span>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
// ROLE-BASED AUTH ROUTING — fixes company users seeing women profile
// ============================================================

function _routeAfterAuth() {
    const d = getProfileData();
    if (d.role === 'company') {
        // Seed companyData from registration fields on first login
        const cd = getCompanyData();
        if (!cd.name) {
            const user = auth.currentUser;
            cd.name = d.name || (user && user.displayName) || '';
            cd.industry = d.industry || '';
            cd.address = d.address || '';
            cd.email = (user && user.email) || '';
            saveCompanyData(cd);
        }
        companyNavTo('company-dashboard');
    } else {
        navigateTo('dashboard');
    }
}

// Replace the original onAuthStateChanged with role-aware version
auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('login-btn');
    const regBtn = document.getElementById('register-btn');
    const lang = localStorage.getItem('authLangPref') || 'en';
    const dict = (window.authTranslations && window.authTranslations[lang]) ? window.authTranslations[lang] : (window.authTranslations ? window.authTranslations['en'] : null);
    if (loginBtn) { loginBtn.textContent = dict && dict['signIn'] ? dict['signIn'] : 'Sign In'; loginBtn.disabled = false; }
    if (regBtn) { regBtn.textContent = dict && dict['createAccount'] ? dict['createAccount'] : 'Create Account'; regBtn.disabled = false; }

    if (user) {
        const displayName = user.displayName || 'User';
        const dashEl = document.getElementById('dashboard-user-name');
        if (dashEl) dashEl.textContent = displayName;
        const profileEl = document.getElementById('profile-user-name');
        if (profileEl) profileEl.textContent = displayName;

        const r = _getRewards();
        if (!r.earnedBadges.includes('first_login')) { earnCoins(30, 'Welcome to Tarini!'); checkAndAwardBadges(); }

        const loginScreen = document.getElementById('screen-login');
        const isOnLogin = (loginScreen && loginScreen.classList.contains('active')) || (history.state && history.state.screen === 'login');
        if (isOnLogin) _routeAfterAuth();
    } else {
        navigateToWithOutHistory('login');
        history.replaceState({ screen: 'login' }, '', window.location.pathname);
    }
});

// Fix global header avatar — route to correct profile based on role
document.addEventListener('DOMContentLoaded', () => {
    const avatarBtn = document.querySelector('#global-header [onclick="navigateTo(\'profile\')"]');
    if (avatarBtn) {
        avatarBtn.removeAttribute('onclick');
        avatarBtn.addEventListener('click', () => {
            const d = getProfileData();
            if (d.role === 'company') companyNavTo('company-profile');
            else navigateTo('profile');
        });
    }
});
