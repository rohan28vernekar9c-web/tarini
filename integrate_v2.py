import sys
sys.stdout.reconfigure(encoding='utf-8')

# ── index.html ────────────────────────────────────────────────────────────────
html = open('index.html', encoding='utf-8').read()

# 1. Replace jobs-company-section: remove search bar, add "View All" button
old_section = '''                <!-- Explore Companies (registered + static) -->
                <section id="jobs-company-section" class="mb-lg">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-on-surface">Explore Companies</h3>
                        <span class="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full" id="jobs-company-count"></span>
                    </div>
                    <div class="relative mb-3">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span class="material-symbols-outlined text-outline" style="font-size:18px">search</span>
                        </div>
                        <input id="jobs-company-search" type="text" placeholder="Search companies by name, industry..." oninput="renderJobsCompanies()" class="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-[13px] transition-all shadow-sm"/>
                    </div>
                    <div id="jobs-company-container" class="flex overflow-x-auto hide-scrollbar gap-3 pb-2"></div>
                </section>'''

new_section = '''                <!-- Explore Companies -->
                <section id="jobs-company-section" class="mb-lg">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-on-surface">Explore Companies</h3>
                        <button onclick="openAllCompanies()" class="text-[12px] font-semibold text-primary flex items-center gap-0.5 hover:underline active:scale-95 transition-all">
                            View All <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
                        </button>
                    </div>
                    <div id="jobs-company-container" class="flex overflow-x-auto hide-scrollbar gap-3 pb-2"></div>
                </section>'''

if old_section in html:
    html = html.replace(old_section, new_section)
    print('Updated jobs-company-section')
else:
    print('ERROR: jobs-company-section not found')

# 2. Add screen-all-companies before screen-company-dashboard
new_screen = '''        <!-- SCREEN: ALL COMPANIES -->
        <div id="screen-all-companies" class="screen">
            <main class="max-w-2xl mx-auto px-5 py-md pb-32">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-5">
                    <button onclick="navigateTo('jobs')" class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h2 class="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-on-surface">All Companies</h2>
                        <p class="text-[12px] text-on-surface-variant mt-0.5" id="all-companies-count"></p>
                    </div>
                </div>

                <!-- Search + Filters -->
                <div class="space-y-3 mb-5">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span class="material-symbols-outlined text-outline" style="font-size:18px">search</span>
                        </div>
                        <input id="all-companies-search" type="text" placeholder="Search by name, industry, location..." oninput="renderAllCompanies()" class="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-[14px] transition-all shadow-sm"/>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <select id="all-companies-industry" onchange="renderAllCompanies()" class="h-12 px-4 rounded-2xl bg-surface-container-low border-none text-[13px] font-semibold text-on-surface shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                            <option value="">All Industries</option>
                            <option>Technology</option>
                            <option>Education</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Design</option>
                            <option>Media</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                        <select id="all-companies-location" onchange="renderAllCompanies()" class="h-12 px-4 rounded-2xl bg-surface-container-low border-none text-[13px] font-semibold text-on-surface shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                            <option value="">All Locations</option>
                            <option>Remote</option>
                            <option>Mumbai</option>
                            <option>Delhi</option>
                            <option>Bangalore</option>
                            <option>Pune</option>
                            <option>Chennai</option>
                            <option>Hybrid</option>
                        </select>
                    </div>
                    <button onclick="clearAllCompanyFilters()" class="text-[12px] font-semibold text-error flex items-center gap-1 active:scale-95 transition-all">
                        <span class="material-symbols-outlined" style="font-size:14px">close</span> Clear filters
                    </button>
                </div>

                <!-- Results -->
                <div id="all-companies-list" class="space-y-3"></div>
            </main>
        </div>

        <!-- SCREEN: COMPANY DASHBOARD -->'''

if '        <!-- SCREEN: COMPANY DASHBOARD -->' in html:
    html = html.replace('        <!-- SCREEN: COMPANY DASHBOARD -->', new_screen)
    print('Added screen-all-companies')
else:
    print('ERROR: company dashboard anchor not found')

open('index.html', 'w', encoding='utf-8').write(html)
print('index.html saved')

# ── app.js ────────────────────────────────────────────────────────────────────
js = open('app.js', encoding='utf-8').read()

# 3. Replace renderJobsCompanies — remove query/search dependency, show first 8 as horizontal chips
old_fn_start = 'function renderJobsCompanies() {'
old_fn_end   = 'window.renderTopCompanies = renderJobsCompanies;'

i_start = js.find(old_fn_start)
i_end   = js.find(old_fn_end) + len(old_fn_end)

new_fn = '''function renderJobsCompanies() {
    const container = document.getElementById('jobs-company-container');
    const countEl   = document.getElementById('jobs-company-count');
    if (!container) return;
    const _dark   = document.documentElement.classList.contains('dark-theme');
    const cardBg  = _dark ? '#1c1b2e' : '#fff';
    const border  = _dark ? '#2a2840' : '#eae6f3';
    const titleC  = _dark ? '#e8e6f4' : '#1b1b24';
    const subC    = _dark ? '#9e9bb8' : '#777587';
    const shadowN = _dark ? '0 2px 10px -4px rgba(0,0,0,0.5)' : '0 2px 10px -4px rgba(77,65,223,0.10)';
    const shadowH = _dark ? '0 6px 18px -4px rgba(0,0,0,0.7)' : '0 6px 18px -4px rgba(77,65,223,0.18)';
    const grads   = ['linear-gradient(135deg,#4d41df,#675df9)','linear-gradient(135deg,#875041,#feb5a2)','linear-gradient(135deg,#5c51a0,#c8bfff)','linear-gradient(135deg,#2d6a4f,#74c69d)','linear-gradient(135deg,#c77dff,#7b2d8b)'];
    const openJobs = name => _allJobs.filter(j => j.company.toLowerCase() === name.toLowerCase()).length;

    _getAllRegisteredCompanies().then(all => {
        const preview = all.slice(0, 8);
        if (countEl) countEl.textContent = '';
        container.innerHTML = preview.map((c, i) => {
            const initials = (c.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
            const grad = grads[i % grads.length];
            const jobs = openJobs(c.name);
            const isReg = !!c.uid;
            const safeName = c.name.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");
            return `<div onclick="filterByCompany('${safeName}')"
                style="flex-shrink:0;width:130px;background:${cardBg};border-radius:18px;padding:14px 12px;border:1px solid ${border};box-shadow:${shadowN};cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;text-align:center"
                onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='${shadowH}'"
                onmouseleave="this.style.transform='';this.style.boxShadow='${shadowN}'"
                ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
                ${c.logo
                    ? `<img src="${c.logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;margin:0 auto 8px;display:block" onerror="this.style.display='none'"/>`
                    : `<div style="width:44px;height:44px;border-radius:12px;background:${grad};display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:16px;font-weight:800;color:#fff">${initials}</div>`}
                <p style="font-size:12px;font-weight:700;color:${titleC};line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</p>
                <p style="font-size:10px;color:${subC};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.industry||''}</p>
                <p style="font-size:10px;font-weight:600;color:#4d41df;margin-top:3px">${jobs} job${jobs!==1?'s':''}</p>
                ${isReg ? '<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(45,106,79,0.12);color:#276749;display:inline-block;margin-top:3px">Registered</span>' : ''}
            </div>`;
        }).join('');
    });
}
window.renderJobsCompanies = renderJobsCompanies;
window.renderTopCompanies  = renderJobsCompanies;

// ---- Full companies page ----

function openAllCompanies() {
    navigateTo('all-companies');
    setTimeout(renderAllCompanies, 100);
}
window.openAllCompanies = openAllCompanies;

function clearAllCompanyFilters() {
    const s = document.getElementById('all-companies-search');
    const ind = document.getElementById('all-companies-industry');
    const loc = document.getElementById('all-companies-location');
    if (s)   s.value   = '';
    if (ind) ind.value = '';
    if (loc) loc.value = '';
    renderAllCompanies();
}
window.clearAllCompanyFilters = clearAllCompanyFilters;

function renderAllCompanies() {
    const container = document.getElementById('all-companies-list');
    const countEl   = document.getElementById('all-companies-count');
    if (!container) return;

    const query    = (document.getElementById('all-companies-search')?.value    || '').toLowerCase().trim();
    const industry = (document.getElementById('all-companies-industry')?.value  || '').toLowerCase().trim();
    const location = (document.getElementById('all-companies-location')?.value  || '').toLowerCase().trim();

    container.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:20px;background:rgba(77,65,223,0.05);border-radius:14px"><span class="material-symbols-outlined text-primary" style="font-size:20px;animation:spin 1s linear infinite">progress_activity</span><p style="font-size:13px;color:#777587">Loading companies...</p></div>';

    _getAllRegisteredCompanies().then(all => {
        let filtered = all;
        if (query)    filtered = filtered.filter(c => (c.name+' '+c.industry+' '+c.location+' '+(c.tagline||'')).toLowerCase().includes(query));
        if (industry) filtered = filtered.filter(c => (c.industry||'').toLowerCase().includes(industry));
        if (location) filtered = filtered.filter(c => (c.location||'').toLowerCase().includes(location));

        if (countEl) countEl.textContent = filtered.length + ' compan' + (filtered.length === 1 ? 'y' : 'ies');

        if (filtered.length === 0) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:48px 0;text-align:center"><div style="width:56px;height:56px;border-radius:50%;background:rgba(77,65,223,0.10);display:flex;align-items:center;justify-content:center;margin-bottom:12px"><span class="material-symbols-outlined" style="font-size:28px;color:#4d41df">domain_disabled</span></div><p style="font-size:14px;font-weight:700;color:#1b1b24">No companies found</p><p style="font-size:12px;color:#777587;margin-top:4px">Try different filters</p></div>';
            return;
        }

        const _dark  = document.documentElement.classList.contains('dark-theme');
        const cardBg = _dark ? '#1c1b2e' : '#fff';
        const border = _dark ? '#2a2840' : '#eae6f3';
        const titleC = _dark ? '#e8e6f4' : '#1b1b24';
        const subC   = _dark ? '#9e9bb8' : '#777587';
        const grads  = ['linear-gradient(135deg,#4d41df,#675df9)','linear-gradient(135deg,#875041,#feb5a2)','linear-gradient(135deg,#5c51a0,#c8bfff)','linear-gradient(135deg,#2d6a4f,#74c69d)','linear-gradient(135deg,#c77dff,#7b2d8b)'];
        const openJobs = name => _allJobs.filter(j => j.company.toLowerCase() === name.toLowerCase()).length;

        container.innerHTML = filtered.map((c, i) => {
            const initials = (c.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
            const grad = grads[i % grads.length];
            const jobs = openJobs(c.name);
            const isReg = !!c.uid;
            const safeName = c.name.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");
            return `<div style="background:${cardBg};border-radius:18px;padding:16px;border:1px solid ${border};box-shadow:0 2px 12px -4px rgba(77,65,223,0.08);display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;active:scale-[0.98]"
                onclick="filterByCompany('${safeName}');navigateTo('jobs')"
                onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">
                ${c.logo
                    ? `<img src="${c.logo}" style="width:48px;height:48px;border-radius:14px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'"/>`
                    : `<div style="width:48px;height:48px;border-radius:14px;background:${grad};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0">${initials}</div>`}
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:6px">
                        <p style="font-size:14px;font-weight:700;color:${titleC};line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</p>
                        ${isReg ? '<span style="flex-shrink:0;font-size:10px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(45,106,79,0.12);color:#276749">Registered</span>' : ''}
                    </div>
                    <p style="font-size:12px;color:${subC};margin-top:2px">${c.industry||''}${c.location ? ' &bull; '+c.location : ''}</p>
                    ${c.tagline ? `<p style="font-size:11px;color:#4d41df;font-weight:600;margin-top:2px">${c.tagline}</p>` : ''}
                </div>
                <div style="flex-shrink:0;text-align:right">
                    <p style="font-size:13px;font-weight:800;color:#4d41df">${jobs}</p>
                    <p style="font-size:10px;color:${subC}">job${jobs!==1?'s':''}</p>
                </div>
            </div>`;
        }).join('');
    });
}
window.renderAllCompanies = renderAllCompanies;'''

if i_start >= 0 and i_end > i_start:
    js = js[:i_start] + new_fn + js[i_end:]
    print('Replaced renderJobsCompanies + added openAllCompanies/renderAllCompanies')
else:
    print('ERROR: could not find renderJobsCompanies block i_start=' + str(i_start) + ' i_end=' + str(i_end))

# 4. Add 'all-companies' to screensWithoutNav so nav hides on that screen
old_nav = "const screensWithoutNav = ['login', 'notifications', 'ai-assistant', 'post-product', 'product-detail', 'edit-profile', 'job-detail', 'job-apply', 'skill-categories', 'market-categories'];"
new_nav = "const screensWithoutNav = ['login', 'notifications', 'ai-assistant', 'post-product', 'product-detail', 'edit-profile', 'job-detail', 'job-apply', 'skill-categories', 'market-categories', 'all-companies'];"
if old_nav in js:
    js = js.replace(old_nav, new_nav)
    print('Added all-companies to screensWithoutNav')
else:
    print('ERROR: screensWithoutNav not found')

# 5. Wire up all-companies in navigateTo
old_nav_call = "        if (screenId === 'rewards') initRewardsScreen();\n    } else {"
new_nav_call = "        if (screenId === 'rewards') initRewardsScreen();\n        if (screenId === 'all-companies') renderAllCompanies();\n    } else {"
if old_nav_call in js:
    js = js.replace(old_nav_call, new_nav_call)
    print('Wired all-companies in navigateTo')
else:
    # Try without the else branch (navigateToWithOutHistory)
    old_nav_call2 = "        if (screenId === 'rewards') initRewardsScreen();\n    }\n}"
    new_nav_call2 = "        if (screenId === 'rewards') initRewardsScreen();\n        if (screenId === 'all-companies') renderAllCompanies();\n    }\n}"
    count2 = js.count(old_nav_call2)
    js = js.replace(old_nav_call2, new_nav_call2)
    print('Wired all-companies in navigateToWithOutHistory (' + str(count2) + ' replacements)')

open('app.js', 'w', encoding='utf-8').write(js)
print('app.js saved')
