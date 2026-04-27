import sys
sys.stdout.reconfigure(encoding='utf-8')
js = open('app.js', encoding='utf-8').read()

# Full _getTrainingVideos and video object structure
idx = js.find('function _getTrainingVideos')
print('=== _getTrainingVideos + nearby ===')
print(js[idx:idx+600])

# screensWithoutNav
idx2 = js.find('screensWithoutNav')
print('\n=== screensWithoutNav ===')
print(js[idx2:idx2+200])

# _companyJobsKey
idx3 = js.find('function _companyJobsKey')
print('\n=== _companyJobsKey ===')
print(js[idx3:idx3+200])
