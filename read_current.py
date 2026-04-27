import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# Find jobs-company-section in HTML
idx = html.find('jobs-company-section')
print('=== jobs-company-section HTML ===')
print(html[max(0,idx-50):idx+800])

# Find job-search-input area
idx2 = html.find('job-search-input')
print('\n=== job-search-input area ===')
print(html[max(0,idx2-200):idx2+100])

# Find renderJobsCompanies in JS
idx3 = js.find('function renderJobsCompanies')
print('\n=== renderJobsCompanies JS (first 60 lines) ===')
lines = js[idx3:idx3+2500].split('\n')
for i,l in enumerate(lines[:60]):
    print(str(idx3)+'+'+str(i)+': '+l)
