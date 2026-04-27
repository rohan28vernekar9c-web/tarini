import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

i_start = html.find('        <div id="screen-all-companies"')
i_end   = html.find('        <!-- SCREEN: COMPANY DASHBOARD -->', i_start)

print(f'Replacing chars {i_start} to {i_end}')

new_screens = """        <!-- SCREEN: ALL COMPANIES -->
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
                <div class="flex items-center gap-3 px-5 pt-4 pb-2">
                    <button onclick="history.back()" class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 class="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface">Company Profile</h2>
                </div>
                <div id="cp-header"></div>
                <div class="px-5 pt-4 space-y-4">
                    <div id="cp-about"></div>
                    <div>
                        <p class="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-on-surface mb-3">Open Positions</p>
                        <div id="cp-jobs"></div>
                    </div>
                    <div>
                        <p class="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-on-surface mb-3">Company Videos</p>
                        <div id="cp-videos"></div>
                    </div>
                </div>
            </main>
        </div>

        <!-- SCREEN: COMPANY DASHBOARD -->
"""

html = html[:i_start] + new_screens + html[i_end + len('        <!-- SCREEN: COMPANY DASHBOARD -->'):]

# Also add company-profile to screensWithoutNav
old_nav = "'all-companies'];"
new_nav = "'all-companies', 'company-profile'];"
if old_nav in js:
    js = js.replace(old_nav, new_nav, 1)
    print('screensWithoutNav updated')
else:
    print('screensWithoutNav already updated or not found')

open('index.html', 'w', encoding='utf-8').write(html)
open('app.js',     'w', encoding='utf-8').write(js)
print('Done.')
