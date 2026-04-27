import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# applyJobFilters full function
idx = js.find('function applyJobFilters')
print('=== applyJobFilters ===')
print(js[idx:idx+600])

# _allJobs first entry to see structure
idx2 = js.find('const _allJobs = [')
print('\n=== _allJobs sample ===')
print(js[idx2:idx2+400])

# screen-all-companies HTML
idx3 = html.find('screen-all-companies')
print('\n=== screen-all-companies HTML ===')
print(html[idx3:idx3+300])

# company training - check if getCompanyJobs exists
idx4 = js.find('function getCompanyJobs')
print('\n=== getCompanyJobs ===')
print(js[idx4:idx4+200] if idx4>=0 else 'NOT FOUND')

# check for training videos structure
idx5 = js.find('loadTrainingScreen')
print('\n=== loadTrainingScreen ===')
print(js[idx5:idx5+300] if idx5>=0 else 'NOT FOUND')
