import sys
sys.stdout.reconfigure(encoding='utf-8')
html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# 1. Full jobs screen HTML
idx = html.find('id="screen-jobs"')
end = html.find('<!-- SCREEN: SKILL HUB', idx)
print('=== JOBS SCREEN HTML ===')
print(html[idx:end])

# 2. applyJobFilters full body
idx2 = js.find('function applyJobFilters()')
end2 = js.find('\nwindow.applyJobFilters', idx2)
print('\n=== applyJobFilters ===')
print(js[idx2:end2+30])

# 3. renderJobsCompanies full body
idx3 = js.find('function renderJobsCompanies()')
end3 = js.find('\nwindow.renderJobsCompanies', idx3)
print('\n=== renderJobsCompanies ===')
print(js[idx3:end3+30])

# 4. filterByCompany
idx4 = js.find('function filterByCompany(')
end4 = js.find('\nwindow.filterByCompany', idx4)
print('\n=== filterByCompany ===')
print(js[idx4:end4+30])

# 5. screen-all-companies HTML
idx5 = html.find('id="screen-all-companies"')
end5 = html.find('<!-- SCREEN: COMPANY CANDIDATE', idx5)
if end5 < 0: end5 = html.find('<!-- SCREEN: COMPANY DASHBOARD', idx5)
print('\n=== screen-all-companies HTML ===')
print(html[idx5:end5])

# 6. getCompanyJobs + training videos key
idx6 = js.find('function getCompanyJobs()')
print('\n=== getCompanyJobs ===')
print(js[idx6:idx6+200])

idx7 = js.find('trainingVideos') if 'trainingVideos' in js else js.find('training_')
print('\n=== training videos key ===')
print(js[idx7:idx7+300] if idx7>=0 else 'NOT FOUND')
