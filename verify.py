import sys, os
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

checks = [
    ('jobs-company-section in HTML',            'jobs-company-section' in html),
    ('jobs-company-search input in HTML',       'jobs-company-search' in html),
    ('top-companies-container removed',         'top-companies-container' not in html),
    ('company-search-section removed from dash',html.count('company-search-section') == 0),
    ('renderJobsCompanies defined in JS',       'function renderJobsCompanies' in js),
    ('renderTopCompanies aliased',              'window.renderTopCompanies = renderJobsCompanies' in js),
    ('initJobsPage calls renderJobsCompanies',  'renderJobsCompanies();\n    applyJobFilters' in js),
    ('searchCompanies removed from nav',        'setTimeout(searchCompanies' not in js),
    ('_getAllRegisteredCompanies used',          '_getAllRegisteredCompanies' in js),
]
for label, result in checks:
    print(('OK  ' if result else 'FAIL') + '  ' + label)
