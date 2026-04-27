import sys
c = open('app.js', encoding='utf-8').read()
lines = c.split('\n')

targets = ['function initJobsPage', 'function renderTopCompanies', 'function _getAllRegisteredCompanies', '_topCompanies = [', 'function searchCompanies']
for t in targets:
    idx = c.find(t)
    if idx >= 0:
        line_no = c[:idx].count('\n') + 1
        sys.stdout.write(t + ' -> line ' + str(line_no) + '\n')
    else:
        sys.stdout.write(t + ' -> NOT FOUND\n')
