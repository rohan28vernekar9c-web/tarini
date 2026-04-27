import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# ── 1. screensWithoutNav: add company-profile ─────────────────────────────────
old_nav = "'all-companies'];"
new_nav = "'all-companies', 'company-profile'];"
js = js.replace(old_nav, new_nav, 1)
print('1. screensWithoutNav updated:', old_nav in open('app.js',encoding='utf-8').read() == False)

# ── 2. Wire company-profile in navigateTo ────────────────────────────────────
old_wire = "        if (screenId === 'all-companies') renderAllCompanies();\n    } else {"
new_wire = "        if (screenId === 'all-companies') renderAllCompanies();\n        if (screenId === 'company-profile') renderCompanyProfile();\n    } else {"
js = js.replace(old_wire, new_wire, 1)
print('2. navigateTo wired')

# ── 3. Update renderJobsCompanies: chips open company profile ────────────────
old_chip_click = "onclick=\"filterByCompany('${safeName}')\"\n                style=\"flex-shrink:0;width:130px"
new_chip_click = "onclick=\"openCompanyProfile('${safeName}')\"\n                style=\"flex-shrink:0;width:130px"
js = js.replace(old_chip_click, new_chip_click, 1)
print('3. renderJobsCompanies chip click updated')

# ── 4. Update renderAllCompanies: rows open company profile ──────────────────
old_row_click = "onclick=\"filterByCompany('${safeName}');navigateTo('jobs')\""
new_row_click = "onclick=\"openCompanyProfile('${safeName}')\""
js = js.replace(old_row_click, new_row_click, 1)
print('4. renderAllCompanies row click updated')

# ── 5. Update applyJobFilters to also filter companies section ────────────────
old_apply = """function applyJobFilters() {
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
window.applyJobFilters = applyJobFilters;"""

new_apply = """function applyJobFilters() {
    const query = (document.getElementById('job-search-input')?.value || '').toLowerCase();
    const { type, exp, loc, industry, salary } = _jobFilters;

    const filtered = _allJobs.filter(job => {
        if (query && !`${job.title} ${job.company} ${job.location} ${job.industry}`.toLowerCase().includes(query)) return false;
        if (type.size && !type.has(job.type)) return false;
        if (exp.size && !exp.has(job.exp)) return false;
        if (loc.size && !loc.has(job.locType)) return false;
        if (industry.size && !industry.has(job.industry)) return false;
        if (!_salaryMatch(job, salary)) return false;
        return true;
    });

    _renderJobCards(filtered);

    // Also filter the Explore Companies section by query
    if (query) {
        _getAllRegisteredCompanies().then(all => {
            const companyMatch = all.filter(c =>
                (c.name + ' ' + c.industry + ' ' + c.location).toLowerCase().includes(query)
            );
            const sec = document.getElementById('jobs-company-section');
            if (sec) sec.style.display = companyMatch.length ? '' : 'none';
            if (companyMatch.length) renderJobsCompanies(companyMatch);
        });
    } else {
        const sec = document.getElementById('jobs-company-section');
        if (sec) sec.style.display = '';
        renderJobsCompanies();
    }
}
window.applyJobFilters = applyJobFilters;"""

if old_apply in js:
    js = js.replace(old_apply, new_apply, 1)
    print('5. applyJobFilters updated')
else:
    print('5. ERROR: applyJobFilters not found exactly')

# ── 6. Update renderJobsCompanies to accept optional filtered list ────────────
old_rjc_sig = "function renderJobsCompanies() {"
new_rjc_sig = "function renderJobsCompanies(prefiltered) {"
js = js.replace(old_rjc_sig, new_rjc_sig, 1)

old_rjc_fetch = "    _getAllRegisteredCompanies().then(all => {\n        const preview = all.slice(0, 8);"
new_rjc_fetch = "    _getAllRegisteredCompanies().then(all => {\n        const preview = (prefiltered || all).slice(0, 8);"
js = js.replace(old_rjc_fetch, new_rjc_fetch, 1)
print('6. renderJobsCompanies accepts prefiltered list')

# ── 7. Add openCompanyProfile + renderCompanyProfile functions ────────────────
new_functions = """
// ============================================================
// COMPANY PROFILE PAGE (women-facing)
// ============================================================

let _currentCompanyName = null;

function openCompanyProfile(name) {
    _currentCompanyName = name;
    navigateTo('company-profile');
}
window.openCompanyProfile = openCompanyProfile;

function renderCompanyProfile() {
    if (!_currentCompanyName) return;
    const name = _currentCompanyName;

    _getAllRegisteredCompanies().then(all => {
        const c = all.find(x => x.name === name) || { name, industry: '', location: '', description: '', tagline: '', logo: '', employees: '', founded: '', website: '' };

        const _d    = document.documentElement.classList.contains('dark-theme');
        const titleC = _d ? '#e8e6f4' : '#1b1b24';
        const subC   = _d ? '#9e9bb8' : '#777587';
        const cardBg = _d ? '#1c1b2e' : '#fff';
        const border = _d ? '#2a2840' : '#eae6f3';
        const grads  = ['linear-gradient(135deg,#4d41df,#675df9)','linear-gradient(135deg,#875041,#feb5a2)','linear-gradient(135deg,#5c51a0,#c8bfff)','linear-gradient(135deg,#2d6a4f,#74c69d)','linear-gradient(135deg,#c77dff,#7b2d8b)'];
        const grad   = grads[Math.abs(name.split('').reduce((a,ch)=>a+ch.charCodeAt(0),0)) % grads.length];
        const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

        // Header
        const hdr = document.getElementById('cp-header');
        if (hdr) {
            hdr.innerHTML = `
            <div style="position:relative;overflow:hidden;border-radius:0 0 28px 28px;background:${grad};padding:24px 20px 28px">
                <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.10)"></div>
                <div style="display:flex;align-items:flex-start;gap:14px;position:relative;z-index:1">
                    ${c.logo
                        ? `<img src="${c.logo}" style="width:64px;height:64px;border-radius:18px;object-fit:cover;border:2px solid rgba(255,255,255,0.3);flex-shrink:0" onerror="this.style.display='none'"/>`
                        : `<div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.20);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0">${initials}</div>`}
                    <div style="flex:1;min-width:0">
                        <p style="font-size:20px;font-weight:800;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.2">${c.name}</p>
                        ${c.tagline ? `<p style="font-size:12px;color:rgba(255,255,255,0.80);margin-top:3px">${c.tagline}</p>` : ''}
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
                            ${c.industry ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:#fff">${c.industry}</span>` : ''}
                            ${c.location ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:#fff">📍 ${c.location}</span>` : ''}
                            ${c.employees ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:#fff">👥 ${c.employees}</span>` : ''}
                            ${c.founded ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:#fff">Est. ${c.founded}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        }

        // About
        const about = document.getElementById('cp-about');
        if (about) {
            const hasInfo = c.description || c.mission || c.website;
            about.innerHTML = hasInfo ? `
            <div style="background:${cardBg};border-radius:20px;padding:16px;border:1px solid ${border};margin-bottom:12px">
                <p style="font-size:12px;font-weight:700;color:${subC};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">About</p>
                ${c.description ? `<p style="font-size:13px;color:${subC};line-height:1.6;margin-bottom:8px">${c.description}</p>` : ''}
                ${c.mission ? `<p style="font-size:13px;color:${subC};line-height:1.6;font-style:italic">"${c.mission}"</p>` : ''}
                ${c.website ? `<a href="${c.website.startsWith('http')?c.website:'https://'+c.website}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#4d41df;margin-top:8px;text-decoration:none"><span class="material-symbols-outlined" style="font-size:14px">language</span>${c.website}</a>` : ''}
            </div>` : '';
        }

        // Jobs
        const jobsEl = document.getElementById('cp-jobs');
        if (jobsEl) {
            const compJobs = _allJobs.filter(j => j.company.toLowerCase() === name.toLowerCase());
            // Also include jobs posted by this company via company dashboard
            const uid = c.uid;
            const postedJobs = uid ? JSON.parse(localStorage.getItem('companyJobs_' + uid) || '[]').filter(j => j.status === 'active') : [];

            const typeColor = t => t === 'Full-time' ? 'rgba(77,65,223,0.10);color:#4d41df'
                : t === 'Part-time' ? 'rgba(135,80,65,0.10);color:#875041'
                : t === 'Internship' ? 'rgba(92,81,160,0.10);color:#5c51a0'
                : 'rgba(45,106,79,0.10);color:#2d6a4f';

            const jobCards = compJobs.map(j => `
                <div style="background:${cardBg};border-radius:16px;padding:14px;border:1px solid ${border};margin-bottom:8px;cursor:pointer;transition:transform 0.15s"
                    onclick="openJobDetail(${j.id})"
                    onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                        <div style="flex:1;min-width:0">
                            <p style="font-size:14px;font-weight:700;color:${titleC};line-height:1.3">${j.title}</p>
                            <p style="font-size:12px;color:${subC};margin-top:2px">${j.location} &bull; ${j.exp}</p>
                        </div>
                        <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:${typeColor(j.type)}">${j.type}</span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                        <span style="font-size:12px;font-weight:700;color:#276749">${j.salary}</span>
                        <button onclick="event.stopPropagation();openJobDetail(${j.id})"
                            style="height:32px;padding:0 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">
                            Apply
                        </button>
                    </div>
                </div>`).join('');

            const postedCards = postedJobs.map(j => `
                <div style="background:${cardBg};border-radius:16px;padding:14px;border:1px solid ${border};margin-bottom:8px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                        <div style="flex:1;min-width:0">
                            <p style="font-size:14px;font-weight:700;color:${titleC};line-height:1.3">${j.title}</p>
                            <p style="font-size:12px;color:${subC};margin-top:2px">${j.location||''} &bull; ${j.experience||''}</p>
                        </div>
                        <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(77,65,223,0.10);color:#4d41df">${j.type||''}</span>
                    </div>
                    <p style="font-size:12px;color:${subC};margin-top:6px;line-height:1.5">${(j.description||'').slice(0,100)}${j.description&&j.description.length>100?'...':''}</p>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                        <span style="font-size:12px;font-weight:700;color:#276749">${j.salaryMin&&j.salaryMax?'₹'+j.salaryMin+' – ₹'+j.salaryMax:''}</span>
                        <button onclick="navigateTo('jobs')"
                            style="height:32px;padding:0 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">
                            Apply
                        </button>
                    </div>
                </div>`).join('');

            const allCards = jobCards + postedCards;
            jobsEl.innerHTML = allCards || `<div style="text-align:center;padding:24px 0;color:${subC};font-size:13px">No open positions right now.</div>`;
        }

        // Videos
        const videosEl = document.getElementById('cp-videos');
        if (videosEl) {
            // Fetch public training videos for this company (by uid)
            const uid = c.uid;
            const videos = uid
                ? JSON.parse(localStorage.getItem('companyTraining_' + uid) || '[]').filter(v => v.privacy === 'public' || !v.privacy)
                : [];

            if (videos.length === 0) {
                videosEl.innerHTML = `<p style="font-size:13px;color:${subC};text-align:center;padding:16px 0">No public videos uploaded yet.</p>`;
            } else {
                videosEl.innerHTML = videos.map(v => `
                    <div style="background:${cardBg};border-radius:16px;overflow:hidden;border:1px solid ${border};margin-bottom:10px;cursor:pointer"
                        onclick="openTrainingPlayer && openTrainingPlayer(${JSON.stringify(v).replace(/"/g,'&quot;')})">
                        <div style="position:relative;width:100%;padding-top:56.25%;background:#000;overflow:hidden">
                            ${v.thumbnail
                                ? `<img src="${v.thumbnail}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>`
                                : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(77,65,223,0.12)"><span class="material-symbols-outlined" style="font-size:40px;color:#4d41df;font-variation-settings:'FILL' 1">play_circle</span></div>`}
                            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25)">
                                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.90);display:flex;align-items:center;justify-content:center">
                                    <span class="material-symbols-outlined" style="font-size:24px;color:#4d41df;font-variation-settings:'FILL' 1;margin-left:3px">play_arrow</span>
                                </div>
                            </div>
                        </div>
                        <div style="padding:12px">
                            <p style="font-size:13px;font-weight:700;color:${titleC};line-height:1.3">${v.title||'Untitled'}</p>
                            ${v.description ? `<p style="font-size:12px;color:${subC};margin-top:4px;line-height:1.4">${v.description}</p>` : ''}
                        </div>
                    </div>`).join('');
            }
        }
    });
}
window.renderCompanyProfile = renderCompanyProfile;
"""

# Insert before the connection module comment
anchor = '// ============================================================\n// WOMEN'
if anchor in js:
    js = js.replace(anchor, new_functions + '\n' + anchor, 1)
    print('7. openCompanyProfile + renderCompanyProfile added')
else:
    # append at end
    js += new_functions
    print('7. Functions appended at end')

# ── 8. HTML: Replace screen-all-companies with improved version ───────────────
old_all_screen_start = '        <div id="screen-all-companies" class="screen">'
old_all_screen_end   = '        <!-- SCREEN: COMPANY CANDIDATE'
if old_all_screen_end not in html:
    old_all_screen_end = '        <!-- SCREEN: COMPANY DASHBOARD'

i_start = html.find(old_all_screen_start)
i_end   = html.find(old_all_screen_end, i_start)

new_all_screen = """        <!-- SCREEN: ALL COMPANIES -->
        <div id="screen-all-companies" class="screen">
            <main class="max-w-2xl mx-auto px-5 py-md pb-32">
                <div class="flex items-center gap-3 mb-5">
                    <button onclick="navigateTo('jobs')" class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h2 class="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-on-surface">All Companies</h2>
                        <p class="text-[12px] text-on-surface-variant mt-0.5" id="all-companies-count"></p>
                    </div>
                </div>
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
                            <option>Technology</option><option>Education</option><option>Healthcare</option>
                            <option>Retail</option><option>Design</option><option>Media</option>
                            <option>Manufacturing</option><option>Other</option>
                        </select>
                        <select id="all-companies-location" onchange="renderAllCompanies()" class="h-12 px-4 rounded-2xl bg-surface-container-low border-none text-[13px] font-semibold text-on-surface shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                            <option value="">All Locations</option>
                            <option>Remote</option><option>Mumbai</option><option>Delhi</option>
                            <option>Bangalore</option><option>Pune</option><option>Chennai</option><option>Hybrid</option>
                        </select>
                    </div>
                    <button onclick="clearAllCompanyFilters()" class="text-[12px] font-semibold text-error flex items-center gap-1 active:scale-95 transition-all">
                        <span class="material-symbols-outlined" style="font-size:14px">close</span> Clear filters
                    </button>
                </div>
                <div id="all-companies-list" class="space-y-3"></div>
            </main>
        </div>

        <!-- SCREEN: COMPANY PROFILE (women-facing) -->
        <div id="screen-company-profile" class="screen">
            <main class="max-w-2xl mx-auto pb-32">
                <!-- Back -->
                <div class="flex items-center gap-3 px-5 pt-4 pb-2">
                    <button onclick="history.back()" class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 class="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface">Company Profile</h2>
                </div>
                <!-- Hero header (logo, name, chips) -->
                <div id="cp-header"></div>
                <!-- Body -->
                <div class="px-5 pt-4 space-y-4">
                    <!-- About -->
                    <div id="cp-about"></div>
                    <!-- Open Positions -->
                    <div>
                        <p class="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-on-surface mb-3">Open Positions</p>
                        <div id="cp-jobs"></div>
                    </div>
                    <!-- Videos -->
                    <div>
                        <p class="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-on-surface mb-3">Company Videos</p>
                        <div id="cp-videos"></div>
                    </div>
                </div>
            </main>
        </div>

"""

if i_start >= 0 and i_end > i_start:
    html = html[:i_start] + new_all_screen + html[i_end:]
    print('8. screen-all-companies replaced + screen-company-profile added')
else:
    print('8. ERROR: i_start=' + str(i_start) + ' i_end=' + str(i_end))

# ── Save ──────────────────────────────────────────────────────────────────────
open('index.html', 'w', encoding='utf-8').write(html)
open('app.js',     'w', encoding='utf-8').write(js)
print('Done. Files saved.')
