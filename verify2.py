import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

checks = [
    # HTML
    ('No search input in jobs-company-section',  'jobs-company-search' not in html),
    ('View All button present',                  'openAllCompanies()' in html),
    ('screen-all-companies exists',              'screen-all-companies' in html),
    ('all-companies-search input exists',        'all-companies-search' in html),
    ('all-companies-industry filter exists',     'all-companies-industry' in html),
    ('all-companies-location filter exists',     'all-companies-location' in html),
    ('clearAllCompanyFilters button exists',     'clearAllCompanyFilters()' in html),
    # JS
    ('renderJobsCompanies defined',              'function renderJobsCompanies' in js),
    ('openAllCompanies defined',                 'function openAllCompanies' in js),
    ('renderAllCompanies defined',               'function renderAllCompanies' in js),
    ('clearAllCompanyFilters defined',           'function clearAllCompanyFilters' in js),
    ('all-companies in screensWithoutNav',       "'all-companies'" in js),
    ('all-companies wired in navigateTo',        "screenId === 'all-companies'" in js),
    ('No jobs-company-search in JS',             'jobs-company-search' not in js),
]
for label, result in checks:
    print(('OK  ' if result else 'FAIL') + '  ' + label)
