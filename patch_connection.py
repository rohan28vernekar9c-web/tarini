import re

# ── 1. app.js ────────────────────────────────────────────────────────────────
with open('app.js', encoding='utf-8') as f:
    app = f.read()

# Add Hire button to candidate cards via regex
app = re.sub(
    r'(Contact</button>\s*\n\s*</div>\s*\n\s*</div>`)',
    lambda m: m.group(0).replace(
        'Contact</button>',
        "Contact</button>\n                        <button onclick=\"hireCandidate('${c.id}','${(c.name||'').replace(/'/g,'')}')\" style=\"flex:1;height:34px;border-radius:10px;border:none;background:rgba(45,106,79,0.12);color:#276749;font-size:11px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif\">Hire</button>"
    ),
    app, count=1
)
print('1. Hire button:', 'Hire</button>' in app)

# Fix broken toast chars
app = app.replace('\u30d0"', '\u2713')
app = app.replace('\u30d0\\"', '\u2713')
print('2. Toast fix done')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app)
print('app.js saved')

# ── 2. index.html ────────────────────────────────────────────────────────────
with open('index.html', encoding='utf-8') as f:
    html = f.read()

# Add screen-company-search before screen-all-companies
if 'screen-company-search' not in html:
    screen = '''
        <!-- SCREEN: COMPANY SEARCH (Women-facing) -->
        <div id="screen-company-search" class="screen">
            <main class="max-w-2xl mx-auto px-5 py-md pb-32">
                <div class="flex items-center gap-3 mb-5">
                    <button onclick="navigateTo('jobs')" class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h2 class="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-on-surface">Search Companies</h2>
                        <p class="text-[12px] text-on-surface-variant mt-0.5" id="company-search-count"></p>
                    </div>
                </div>
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-outline" style="font-size:18px">search</span>
                    </div>
                    <input id="company-search-input" type="text"
                        placeholder="Search by name, industry, location..."
                        oninput="searchCompanies()"
                        class="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-[14px] transition-all shadow-sm"/>
                </div>
                <div id="company-search-empty" class="hidden text-center py-12">
                    <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span class="material-symbols-outlined text-primary" style="font-size:28px">domain_disabled</span>
                    </div>
                    <p class="font-bold text-on-surface text-[14px]">No companies found</p>
                    <p class="text-[12px] text-on-surface-variant mt-1">Try a different search term</p>
                </div>
                <div id="company-search-results" class="space-y-3"></div>
            </main>
        </div>

'''
    html = html.replace('<!-- SCREEN: ALL COMPANIES -->', screen + '        <!-- SCREEN: ALL COMPANIES -->')
    print('3. screen-company-search added')
else:
    print('3. screen-company-search already exists')

# Add Search Companies button to Jobs screen before Explore Companies section
if "navigateTo('company-search')" not in html:
    btn = '''
                <!-- Search Companies -->
                <div class="mb-md">
                    <button onclick="navigateTo('company-search')"
                        class="w-full py-4 rounded-[20px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                        style="background:linear-gradient(135deg,rgba(92,81,160,0.10),rgba(77,65,223,0.08));border:1.5px solid rgba(77,65,223,0.15)">
                        <span class="material-symbols-outlined text-tertiary" style="font-size:22px;font-variation-settings:'FILL' 1">business_center</span>
                        <span class="font-bold text-[15px] text-tertiary">Search Companies</span>
                        <span class="material-symbols-outlined text-tertiary" style="font-size:18px">chevron_right</span>
                    </button>
                </div>

'''
    html = html.replace('<!-- Explore Companies -->', btn + '                <!-- Explore Companies -->')
    print('4. Search Companies button added to Jobs screen')
else:
    print('4. Search Companies button already exists')

# Update company bottom nav: replace Messages with Candidates
old_nav = '''            <div class="co-nav-item flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 text-slate-400"
                data-co-target="company-messages" onclick="companyNavTo('company-messages')">
                <span class="material-symbols-outlined co-nav-icon">chat</span>
                <span class="text-[11px] font-semibold font-['Plus_Jakarta_Sans']">Messages</span>
            </div>'''
new_nav = '''            <div class="co-nav-item flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 text-slate-400"
                data-co-target="company-candidates" onclick="companyNavTo('company-candidates')">
                <span class="material-symbols-outlined co-nav-icon">person_search</span>
                <span class="text-[11px] font-semibold font-['Plus_Jakarta_Sans']">Candidates</span>
            </div>'''
if old_nav in html:
    html = html.replace(old_nav, new_nav)
    print('5. Company nav: Messages -> Candidates')
else:
    print('5. Company nav already updated or not found')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('index.html saved')
print('ALL DONE')
