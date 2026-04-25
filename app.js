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
const screensWithoutNav = ['login', 'notifications', 'ai-assistant', 'applications', 'rewards', 'post-product', 'product-detail', 'edit-profile'];

function navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        updateBottomNav(screenId);
        if (screenId === 'shop') renderShopProducts();
        if (screenId === 'profile') loadProfileScreen();
        if (screenId === 'dashboard') loadDashboardEarnings();
        if (screenId === 'notifications') loadNotificationsScreen();
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
        if (screenId === 'shop') renderShopProducts();
        if (screenId === 'profile') loadProfileScreen();
        if (screenId === 'dashboard') loadDashboardEarnings();
        if (screenId === 'notifications') loadNotificationsScreen();
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
        label.textContent = 'Profile Completed ✓';
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
    navigateTo('shop');
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
    { title: 'Elegant Handcrafted Earrings – Artisan Collection', desc: 'Beautifully crafted by skilled artisans using premium materials. Each piece is unique, lightweight, and perfect for everyday wear or special occasions. A thoughtful gift for loved ones.' },
    { title: 'Premium Handwoven Silk Saree – Traditional Elegance', desc: 'Experience the timeless beauty of handwoven silk. This exquisite saree features intricate patterns crafted by master weavers, blending tradition with modern aesthetics.' },
    { title: 'Organic Herbal Skincare Set – Natural Glow Collection', desc: 'Nourish your skin with our 100% organic herbal blend. Free from harmful chemicals, this set is crafted with love using traditional recipes passed down through generations.' },
    { title: 'Handmade Terracotta Jewellery – Earthy Charm Series', desc: 'Celebrate the art of terracotta with these stunning handmade pieces. Lightweight, eco-friendly, and uniquely designed to complement both traditional and contemporary outfits.' },
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
        title.textContent = 'Sign Up';
        subtitle.textContent = '✦ Tarini Welcomes You';
        toggleToRegister.style.display = 'none';
        toggleToLogin.style.display = 'block';
    } else {
        roleSelector.style.display = 'none';
        loginForm.style.display = 'block';
        title.textContent = 'Sign In';
        subtitle.textContent = 'Welcome back to Tarini';
        toggleToRegister.style.display = 'block';
        toggleToLogin.style.display = 'none';
    }
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
        // onAuthStateChanged will handle navigation
    } catch (error) {
        showError(error.message);
        btn.textContent = "Sign In";
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
    } catch (error) {
        showError(error.message);
        btn.textContent = role === 'woman' ? 'Create Account' : role === 'company' ? 'Register Company' : 'Register as Admin';
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
    if (regBtn) { regBtn.textContent = "Create Account"; regBtn.disabled = false; }

    if (user) {
        // User is signed in. Update UI and go to dashboard
        const displayName = user.displayName || 'User';
        const dashboardUserNameEl = document.getElementById('dashboard-user-name');
        if (dashboardUserNameEl) dashboardUserNameEl.textContent = displayName;
        
        const profileUserNameEl = document.getElementById('profile-user-name');
        if (profileUserNameEl) profileUserNameEl.textContent = displayName;
        
        if (history.state && history.state.screen === 'login') {
            navigateTo('dashboard');
        }
    } else {
        navigateToWithOutHistory('login');
        history.replaceState({ screen: 'login' }, '', window.location.pathname);
    }
});
