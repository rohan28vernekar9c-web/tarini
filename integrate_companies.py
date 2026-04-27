import sys

# ── index.html changes ────────────────────────────────────────────────────────
html = open('index.html', encoding='utf-8').read()

# 1. Replace "Top Companies Recommended" block in Jobs screen with Explore Companies
old_top = '''                <!-- Top Companies Recommended -->
                <div class="mb-lg">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-on-surface">Top Companies Recommended</h3>
                    </div>
                    <div id="top-companies-container" class="flex overflow-x-auto hide-scrollbar gap-3 pb-2"></div>
                </div>'''

new_top = '''                <!-- Explore Companies (registered + static) -->
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

if old_top in html:
    html = html.replace(old_top, new_top)
    sys.stdout.write('Replaced Top Companies section in Jobs screen\n')
else:
    sys.stdout.write('ERROR: Top Companies block not found\n')

# 2. Remove the Explore Companies section from the dashboard
# Find the full section block
dash_section_start = '                \n                <!-- COMPANY SEARCH SECTION -->\n                <section id="company-search-section">'
dash_section_end = '</section>\n\n</div><!-- end px-5 -->'

idx_start = html.find('<!-- COMPANY SEARCH SECTION -->')
idx_end   = html.find('</div><!-- end px-5 -->')

if idx_start >= 0 and idx_end >= 0:
    # Remove from the comment to just before </div><!-- end px-5 -->
    html = html[:idx_start] + '\n' + html[idx_end:]
    sys.stdout.write('Removed Explore Companies from dashboard\n')
else:
    sys.stdout.write('Dashboard section markers: start=' + str(idx_start) + ' end=' + str(idx_end) + '\n')

open('index.html', 'w', encoding='utf-8').write(html)
sys.stdout.write('index.html saved\n')

# ── app.js changes ────────────────────────────────────────────────────────────
js = open('app.js', encoding='utf-8').read()

# 3. Replace renderTopCompanies with renderJobsCompanies (uses real data)
old_render = '''function renderTopCompanies() {
    const container = document.getElementById('top-companies-container');
    if (!container) return;
    const _dark = document.documentElement.classList.contains('dark-theme');
    const cardBg  = _dark ? '#1c1b2e' : '#fff';
    const border  = _dark ? '#2a2840' : '#eae6f3';
    const titleC  = _dark ? '#e8e6f4' : '#1b1b24';
    const subC    = _dark ? '#9e9bb8' : '#777587';
    const shadowN = _dark ? '0 2px 10px -4px rgba(0,0,0,0.5)' : '0 2px 10px -4px rgba(77,65,223,0.10)';
    const shadowH = _dark ? '0 6px 18px -4px rgba(0,0,0,0.7)' : '0 6px 18px -4px rgba(77,65,223,0.18)';
    container.innerHTML = _topCompanies.map(c => `
        <div onclick="filterByCompany('${c.name}')" style="flex-shrink:0;width:130px;background:${cardBg};border-radius:18px;padding:14px 12px;border:1px solid ${border};box-shadow:${shadowN};cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;text-align:center"
            onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='${shadowH}'"
            onmouseleave="this.style.transform='';this.style.boxShadow='${shadowN}'"
            ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
            <div style="width:44px;height:44px;border-radius:12px;background:${c.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
                <span class="material-symbols-outlined" style="font-size:22px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
            </div>
            <p style="font-size:12px;font-weight:700;color:${titleC};line-height:1.3">${c.name}</p>
            <p style="font-size:10px;color:${subC};margin-top:2px">${c.industry}</p>
            <p style="font-size:10px;font-weight:600;color:${c.color};margin-top:4px;line-height:1.3">${c.tagline}</p>
        </div>`).join('');
}
window.renderTopCompanies = renderTopCompanies;'''

new_render = '''function renderJobsCompanies() {
    const container = document.getElementById('jobs-company-container');
    const countEl   = document.getElementById('jobs-company-count');
    if (!container) return;
    const query = (document.getElementById('jobs-company-search')?.value || '').toLowerCase().trim();
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
        const filtered = query
            ? all.filter(c => (c.name + ' ' + c.industry + ' ' + c.location + ' ' + (c.tagline||'')).toLowerCase().includes(query))
            : all;
        if (countEl) countEl.textContent = filtered.length ? filtered.length + ' companies' : '';
        container.innerHTML = filtered.map((c, i) => {
            const initials = (c.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
            const grad = grads[i % grads.length];
            const jobs = openJobs(c.name);
            const isReg = !!c.uid;
            const safeName = c.name.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");
            return `<div onclick="filterByCompany('${safeName}')"
                style="flex-shrink:0;width:140px;background:${cardBg};border-radius:18px;padding:14px 12px;border:1px solid ${border};box-shadow:${shadowN};cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;text-align:center"
                onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='${shadowH}'"
                onmouseleave="this.style.transform='';this.style.boxShadow='${shadowN}'"
                ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
                ${c.logo ? `<img src="${c.logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;margin:0 auto 8px;display:block" onerror="this.style.display='none'"/>` :
                  `<div style="width:44px;height:44px;border-radius:12px;background:${grad};display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:16px;font-weight:800;color:#fff">${initials}</div>`}
                <p style="font-size:12px;font-weight:700;color:${titleC};line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</p>
                <p style="font-size:10px;color:${subC};margin-top:2px">${c.industry||''}</p>
                <p style="font-size:10px;font-weight:600;color:#4d41df;margin-top:3px;line-height:1.3">${jobs} job${jobs!==1?'s':''}</p>
                ${isReg ? '<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(45,106,79,0.12);color:#276749;display:inline-block;margin-top:3px">Registered</span>' : ''}
            </div>`;
        }).join('');
    });
}
window.renderJobsCompanies = renderJobsCompanies;
// Keep old name as alias so any existing calls don't break
window.renderTopCompanies = renderJobsCompanies;'''

if old_render in js:
    js = js.replace(old_render, new_render)
    sys.stdout.write('Replaced renderTopCompanies with renderJobsCompanies\n')
else:
    sys.stdout.write('ERROR: renderTopCompanies body not found exactly\n')

# 4. Update initJobsPage to call renderJobsCompanies
old_init = '''function initJobsPage() {
    renderTopCompanies();
    applyJobFilters();
}
window.initJobsPage = initJobsPage;'''

new_init = '''function initJobsPage() {
    renderJobsCompanies();
    applyJobFilters();
}
window.initJobsPage = initJobsPage;'''

if old_init in js:
    js = js.replace(old_init, new_init)
    sys.stdout.write('Updated initJobsPage\n')
else:
    sys.stdout.write('ERROR: initJobsPage not found exactly\n')

# 5. Remove searchCompanies calls from navigateTo / navigateToWithOutHistory (dashboard no longer needs it)
old_dash1 = "if (screenId === 'dashboard') { loadDashboardEarnings(); setTimeout(searchCompanies, 200); }"
new_dash1 = "if (screenId === 'dashboard') { loadDashboardEarnings(); }"
count = js.count(old_dash1)
js = js.replace(old_dash1, new_dash1)
sys.stdout.write('Removed searchCompanies from dashboard nav calls: ' + str(count) + ' replacements\n')

open('app.js', 'w', encoding='utf-8').write(js)
sys.stdout.write('app.js saved\n')
