import sys
c = open('index.html', encoding='utf-8').read()

for marker in ['company-search-section', 'top-companies-container', 'Explore Companies']:
    idx = c.find(marker)
    sys.stdout.write('\n=== ' + marker + ' at ' + str(idx) + ' ===\n')
    if idx >= 0:
        sys.stdout.write(c[max(0,idx-100):idx+600])
