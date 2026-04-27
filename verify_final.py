import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

checks = [
    # Single search bar - no duplicate in jobs screen
    ('Single search bar (job-search-input)',         html.count('id="job-search-input"') == 1),
    ('No jobs-company-search in HTML',               'jobs-company-search' not in html),
    # Explore Companies section
    ('jobs-company-section exists',                  'jobs-company-section' in html),
    ('View All button calls openAllCompanies',        'openAllCompanies()' in html),
    ('Chips call openCompanyProfile',                'openCompanyProfile' in html),
    # All Companies screen
    ('screen-all-companies exists',                  'screen-all-companies' in html),
    ('all-companies-search input',                   'all-companies-search' in html),
    ('all-companies-industry filter',                'all-companies-industry' in html),
    ('all-companies-location filter',                'all-companies-location' in html),
    # Company Profile screen
    ('screen-company-profile exists',               'screen-company-profile' in html),
    ('cp-header element',                            'id="cp-header"' in html),
    ('cp-about element',                             'id="cp-about"' in html),
    ('cp-jobs element',                              'id="cp-jobs"' in html),
    ('cp-videos element',                            'id="cp-videos"' in html),
    # JS functions
    ('openCompanyProfile defined',                   'function openCompanyProfile' in js),
    ('renderCompanyProfile defined',                 'function renderCompanyProfile' in js),
    ('renderAllCompanies defined',                   'function renderAllCompanies' in js),
    ('clearAllCompanyFilters defined',               'function clearAllCompanyFilters' in js),
    ('company-profile in screensWithoutNav',         "'company-profile'" in js),
    ('company-profile wired in navigateTo',          "screenId === 'company-profile'" in js),
    # applyJobFilters unified search
    ('applyJobFilters filters companies section',    'renderJobsCompanies(companyMatch)' in js),
    # renderJobsCompanies uses prefiltered
    ('renderJobsCompanies accepts prefiltered',      'function renderJobsCompanies(prefiltered)' in js),
]

all_ok = True
for label, result in checks:
    status = 'OK  ' if result else 'FAIL'
    if not result: all_ok = False
    print(status + '  ' + label)

print('\n' + ('ALL CHECKS PASSED' if all_ok else 'SOME CHECKS FAILED'))
