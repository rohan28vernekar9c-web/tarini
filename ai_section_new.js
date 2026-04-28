
// ============================================================
// AI ASSISTANT - full interactive implementation
// ============================================================

function closeAIAssistant() {
    const prev = _navStack.length > 0 ? _navStack.pop() : 'dashboard';
    const safe = ['dashboard','jobs','skills','shop','profile','rewards','applications'].includes(prev) ? prev : 'dashboard';
    navigateTo(safe);
}
window.closeAIAssistant = closeAIAssistant;

function _aiSetThemeVars() {
    const dark = document.documentElement.classList.contains('dark-theme');
    document.documentElement.style.setProperty('--ai-bot-bg',  dark ? '#252438' : '#f0ecf9');
    document.documentElement.style.setProperty('--ai-bot-txt', dark ? '#e8e6f4' : '#1b1b24');
}

function _aiInjectStyles() {
    if (document.getElementById('ai-styles')) return;
    const s = document.createElement('style');
    s.id = 'ai-styles';
    s.textContent = '@keyframes typingDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}';
    document.head.appendChild(s);
}

function sendAIQuick(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = text;
    sendAIMessage();
}
window.sendAIQuick = sendAIQuick;

function _aiActionBtns(actions) {
    return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' +
        actions.map(function(a) {
            return '<button onclick="' + a.fn + '" style="height:28px;padding:0 10px;border-radius:8px;border:none;background:' + a.bg + ';color:' + a.col + ';font-size:11px;font-weight:700;cursor:pointer;font-family:Poppins,sans-serif;display:inline-flex;align-items:center;gap:4px">' +
                '<span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\'FILL\' 1">' + a.icon + '</span>' + a.label +
                '</button>';
        }).join('') +
    '</div>';
}

function _aiGetReply(lower) {
    var dark = document.documentElement.classList.contains('dark-theme');
    var botTxt = dark ? '#e8e6f4' : '#1b1b24';
    var cardBg = dark ? 'rgba(77,65,223,0.12)' : 'rgba(77,65,223,0.07)';

    // Jobs intent
    if (/job|work|hire|apply|career|vacancy|position|recruit/.test(lower)) {
        var jobs = (window._allJobs || []).slice(0, 3);
        var cards = jobs.map(function(j) {
            var initials = j.company.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
            return '<div onclick="openJobDetail(' + j.id + ')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:' + cardBg + ';border:1px solid rgba(77,65,223,0.15);cursor:pointer;margin-top:6px;transition:transform 0.15s" onmouseenter="this.style.transform=\'scale(1.01)\'" onmouseleave="this.style.transform=\'\'">' +
                '<div style="width:36px;height:36px;border-radius:10px;background:' + j.grad + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0">' + initials + '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<p style="font-size:12px;font-weight:700;color:' + botTxt + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + j.title + '</p>' +
                    '<p style="font-size:11px;color:#9e9bb8;margin-top:1px">' + j.company + ' &bull; ' + j.salary + '</p>' +
                '</div>' +
                '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(77,65,223,0.12);color:#4d41df;flex-shrink:0">' + j.type + '</span>' +
            '</div>';
        }).join('');
        var btns = _aiActionBtns([
            { fn: "navigateTo('jobs')", icon: 'work', label: 'All Jobs', bg: 'linear-gradient(135deg,#4d41df,#5c51a0)', col: '#fff' },
            { fn: "navigateTo('jobs');setTimeout(runAIMatch,400)", icon: 'auto_awesome', label: 'AI Match', bg: 'rgba(77,65,223,0.12)', col: '#4d41df' }
        ]);
        return { text: 'Here are some jobs that might suit you \uD83D\uDCBC', extra: cards + btns };
    }

    // Skills intent
    if (/skill|course|learn|train|study|certif|class/.test(lower)) {
        var courses = (window._allCourses || []).filter(function(c){ return c.lang === 'en'; }).slice(0, 3);
        var cBg = dark ? 'rgba(92,81,160,0.12)' : 'rgba(92,81,160,0.07)';
        var cCards = courses.map(function(c) {
            return '<div onclick="openCourseVideo(' + c.id + ')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:' + cBg + ';border:1px solid rgba(92,81,160,0.15);cursor:pointer;margin-top:6px;transition:transform 0.15s" onmouseenter="this.style.transform=\'scale(1.01)\'" onmouseleave="this.style.transform=\'\'">' +
                '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#5c51a0,#c8bfff);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                    '<span class="material-symbols-outlined" style="font-size:18px;color:#fff;font-variation-settings:\'FILL\' 1">school</span>' +
                '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<p style="font-size:12px;font-weight:700;color:' + botTxt + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.title + '</p>' +
                    '<p style="font-size:11px;color:#9e9bb8;margin-top:1px">' + c.instructor + ' &bull; ' + c.durLabel + ' &bull; ' + c.type + '</p>' +
                '</div>' +
            '</div>';
        }).join('');
        var cBtns = _aiActionBtns([
            { fn: "navigateTo('skills')", icon: 'school', label: 'Skill Hub', bg: 'linear-gradient(135deg,#5c51a0,#675df9)', col: '#fff' }
        ]);
        return { text: 'Here are some top courses for you \uD83D\uDCDA', extra: cCards + cBtns };
    }

    // Marketplace intent
    if (/shop|market|sell|product|buy|handmade|craft|listing/.test(lower)) {
        var prods = (window._marketProducts || []).slice(0, 3);
        var mBg = dark ? 'rgba(135,80,65,0.12)' : 'rgba(135,80,65,0.07)';
        var mCards = prods.map(function(p) {
            var imgHtml = p.image
                ? '<img src="' + p.image + '" style="width:100%;height:100%;object-fit:cover" />'
                : '<span class="material-symbols-outlined" style="font-size:18px;color:#875041;font-variation-settings:\'FILL\' 1">storefront</span>';
            return '<div onclick="navigateTo(\'shop\')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:' + mBg + ';border:1px solid rgba(135,80,65,0.15);cursor:pointer;margin-top:6px;transition:transform 0.15s" onmouseenter="this.style.transform=\'scale(1.01)\'" onmouseleave="this.style.transform=\'\'">' +
                '<div style="width:36px;height:36px;border-radius:10px;overflow:hidden;background:rgba(135,80,65,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + imgHtml + '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<p style="font-size:12px;font-weight:700;color:' + botTxt + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.name + '</p>' +
                    '<p style="font-size:11px;color:#9e9bb8;margin-top:1px">' + p.seller + ' &bull; \u20B9' + p.price.toLocaleString('en-IN') + '</p>' +
                '</div>' +
            '</div>';
        }).join('');
        var mBtns = _aiActionBtns([
            { fn: "navigateTo('shop')",    icon: 'storefront', label: 'Marketplace', bg: 'linear-gradient(135deg,#875041,#feb5a2)', col: '#fff' },
            { fn: "navigateTo('my-shop')", icon: 'add_circle', label: 'My Shop',     bg: 'rgba(135,80,65,0.12)',                   col: '#875041' }
        ]);
        return { text: 'Check out these popular products \uD83D\uDECD\uFE0F', extra: mCards + mBtns };
    }

    // Rewards intent
    if (/reward|coin|badge|streak|point/.test(lower)) {
        var r = (typeof _getRewards === 'function') ? _getRewards() : { coins: 0, streak: 0, earnedBadges: [] };
        var rBtns = _aiActionBtns([
            { fn: "navigateTo('rewards')", icon: 'military_tech', label: 'View Rewards', bg: 'linear-gradient(135deg,#675df9,#4d41df)', col: '#fff' }
        ]);
        return { text: 'You have <strong>' + r.coins + ' Tarini Coins</strong> and a <strong>' + (r.streak || 0) + '-day streak</strong> \uD83C\uDFC6<br><br>Earn more by logging in daily, applying to jobs, enrolling in courses, and listing products!', extra: rBtns };
    }

    // Profile intent
    if (/profile|bio|resume|complete|photo|picture/.test(lower)) {
        var pct = (typeof computeProfileProgress === 'function') ? computeProfileProgress() : 0;
        var pBtns = _aiActionBtns([
            { fn: "navigateTo('profile')",      icon: 'person', label: 'My Profile', bg: 'linear-gradient(135deg,#276749,#74c69d)', col: '#fff' },
            { fn: "navigateTo('edit-profile')", icon: 'edit',   label: 'Edit',       bg: 'rgba(45,106,79,0.12)',                   col: '#276749' }
        ]);
        return { text: 'Your profile is <strong>' + pct + '% complete</strong> \uD83D\uDCCB<br><br>A complete profile gets <strong>3x more visibility</strong> to companies. Add your bio, skills, and upload a resume!', extra: pBtns };
    }

    // Applications intent
    if (/application|applied|status|interview|shortlist/.test(lower)) {
        var aBtns = _aiActionBtns([
            { fn: "navigateTo('applications')", icon: 'assignment', label: 'My Applications', bg: 'linear-gradient(135deg,#875041,#feb5a2)', col: '#fff' }
        ]);
        return { text: 'Track all your job applications and their status in the Applications section \uD83D\uDCCB', extra: aBtns };
    }

    // Greeting
    if (/^(hi|hello|hey|namaste|hii|helo)/.test(lower.trim())) {
        var d2 = (typeof getProfileData === 'function') ? getProfileData() : {};
        var u2 = (typeof auth !== 'undefined') ? auth.currentUser : null;
        var name2 = d2.name || (u2 && u2.displayName) || 'there';
        var gBtns = _aiActionBtns([
            { fn: "navigateTo('jobs')",    icon: 'work',       label: 'Find Jobs',   bg: 'linear-gradient(135deg,#4d41df,#5c51a0)', col: '#fff' },
            { fn: "navigateTo('skills')",  icon: 'school',     label: 'Skill Hub',   bg: 'rgba(92,81,160,0.12)',                   col: '#5c51a0' },
            { fn: "navigateTo('shop')",    icon: 'storefront', label: 'Marketplace', bg: 'rgba(135,80,65,0.12)',                   col: '#875041' }
        ]);
        return { text: 'Hello ' + name2 + '! \uD83D\uDC4B I\'m Tarini AI, your personal career assistant.<br><br>What would you like to do today?', extra: gBtns };
    }

    // Fallback
    var fallbacks = [
        'Your journey matters. Tarini is here to support every step of your empowerment \u2728',
        'Keep going! Every application brings you one step closer to your dream job \uD83D\uDCAA',
        'Tip: A complete profile gets 3x more visibility to companies on Tarini.',
        'Try the AI Job Match feature \u2014 it finds jobs tailored to your skills automatically!'
    ];
    var fBtns = _aiActionBtns([
        { fn: "navigateTo('jobs')",   icon: 'work',   label: 'Find Jobs', bg: 'linear-gradient(135deg,#4d41df,#5c51a0)', col: '#fff' },
        { fn: "navigateTo('skills')", icon: 'school', label: 'Skill Hub', bg: 'rgba(92,81,160,0.12)',                   col: '#5c51a0' }
    ]);
    return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)], extra: fBtns };
}

function sendAIMessage() {
    var input = document.getElementById('ai-chat-input');
    var container = document.getElementById('ai-chat-container');
    if (!input || !container) return;

    var text = input.value.trim();
    if (!text) return;

    _aiInjectStyles();
    _aiSetThemeVars();

    var dark = document.documentElement.classList.contains('dark-theme');
    var userBg = dark ? '#2a2840' : '#4d41df';
    var botBg  = dark ? '#252438' : '#f0ecf9';
    var botTxt = dark ? '#e8e6f4' : '#1b1b24';

    // User bubble
    var userMsg = document.createElement('div');
    userMsg.style.cssText = 'display:flex;justify-content:flex-end';
    userMsg.innerHTML = '<div style="background:' + userBg + ';color:#fff;border-radius:18px;border-bottom-right-radius:4px;padding:10px 14px;max-width:78%;font-size:13px;line-height:1.55">' + text + '</div>';
    container.appendChild(userMsg);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Typing indicator
    var typing = document.createElement('div');
    typing.id = 'ai-typing';
    typing.style.cssText = 'display:flex;align-items:center;gap:8px';
    typing.innerHTML =
        '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4d41df,#5c51a0);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<span class="material-symbols-outlined" style="font-size:14px;color:#fff;font-variation-settings:\'FILL\' 1">smart_toy</span>' +
        '</div>' +
        '<div style="background:' + botBg + ';border-radius:18px;border-top-left-radius:4px;padding:10px 14px">' +
            '<div style="display:flex;gap:4px;align-items:center">' +
                '<span style="width:6px;height:6px;border-radius:50%;background:#4d41df;animation:typingDot 1.2s infinite 0s"></span>' +
                '<span style="width:6px;height:6px;border-radius:50%;background:#4d41df;animation:typingDot 1.2s infinite 0.2s"></span>' +
                '<span style="width:6px;height:6px;border-radius:50%;background:#4d41df;animation:typingDot 1.2s infinite 0.4s"></span>' +
            '</div>' +
        '</div>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;

    var lower = text.toLowerCase();
    var result = _aiGetReply(lower);

    setTimeout(function() {
        var t = document.getElementById('ai-typing');
        if (t) t.remove();

        var botMsg = document.createElement('div');
        botMsg.style.cssText = 'display:flex;align-items:flex-start;gap:8px';
        botMsg.innerHTML =
            '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4d41df,#5c51a0);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">' +
                '<span class="material-symbols-outlined" style="font-size:14px;color:#fff;font-variation-settings:\'FILL\' 1">smart_toy</span>' +
            '</div>' +
            '<div style="background:' + botBg + ';color:' + botTxt + ';border-radius:18px;border-top-left-radius:4px;padding:10px 14px;max-width:82%;font-size:13px;line-height:1.55">' +
                result.text +
                (result.extra || '') +
            '</div>';
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1200);
}
window.sendAIMessage = sendAIMessage;
