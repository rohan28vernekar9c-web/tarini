import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

checks = [
    ('Single search bar only',                       html.count('id="job-search-input"') == 1),
    ('No duplicate company search in HTML',          'jobs-company-search' not in html),
    ('Explore Companies section in Jobs screen',     'jobs-company-section' in html),
    ('View All button',                              'openAllCompanies()' in html),
    ('Chips call openCompanyProfile (in JS)',        "openCompanyProfile('${safeName}')" in js),
    ('screen-all-companies with filters',            'all-companies-industry' in html),
    ('screen-company-profile exists',               'screen-company-profile' in html),
    ('Company hero header (cp-header)',              'id="cp-header"' in html),
    ('Company about section (cp-about)',             'id="cp-about"' in html),
    ('Company jobs list (cp-jobs)',                  'id="cp-jobs"' in html),
    ('Company videos (cp-videos)',                   'id="cp-videos"' in html),
    ('openCompanyProfile JS function',               'function openCompanyProfile' in js),
    ('renderCompanyProfile JS function',             'function renderCompanyProfile' in js),
    ('company-profile in screensWithoutNav',         "'company-profile'" in js),
    ('company-profile wired in navigateTo',          "screenId === 'company-profile'" in js),
    ('Unified search filters companies too',         'renderJobsCompanies(companyMatch)' in js),
    ('renderJobsCompanies accepts prefiltered arg',  'function renderJobsCompanies(prefiltered)' in js),
    ('All Companies rows open company profile',      "openCompanyProfile('${safeName}')" in js),
]

all_ok = True
for label, result in checks:
    if not result: all_ok = False
    print(('OK  ' if result else 'FAIL') + '  ' + label)
print('\n' + ('ALL CHECKS PASSED ✓' if all_ok else 'SOME FAILED'))
