import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# HTML: jobs screen search + filter area
idx = html.find('screen-jobs')
print('=== Jobs screen start (first 2000 chars) ===')
print(html[idx:idx+2000])

# HTML: jobs-company-section
idx2 = html.find('jobs-company-section')
print('\n=== jobs-company-section ===')
print(html[max(0,idx2-50):idx2+500])

# JS: filterByCompany
idx3 = js.find('function filterByCompany')
print('\n=== filterByCompany ===')
print(js[idx3:idx3+200])

# JS: initJobsPage
idx4 = js.find('function initJobsPage')
print('\n=== initJobsPage ===')
print(js[idx4:idx4+150])

# JS: applyJobFilters search input
idx5 = js.find('job-search-input')
print('\n=== job-search-input in JS ===')
print(js[idx5:idx5+200])
