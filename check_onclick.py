import sys
sys.stdout.reconfigure(encoding='utf-8')
js = open('app.js', encoding='utf-8').read()

for kw in ['openCompanyProfile', "onclick=\"filterByCompany", "onclick=\\\"filterByCompany", "onclick=\\\\\"filterByCompany"]:
    idx = js.find(kw)
    print(f'{kw!r} -> {idx}')
    if idx >= 0:
        print('  ' + js[idx:idx+80])
