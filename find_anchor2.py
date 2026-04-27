import sys
sys.stdout.reconfigure(encoding='utf-8')
html = open('index.html', encoding='utf-8').read()

i_start = html.find('        <div id="screen-all-companies"')
# Find the end: look for </div>\n\n        <!-- after the results div
chunk = html[i_start:i_start+4000]
# find last </div> in this chunk
end_markers = ['        <!-- SCREEN:', '        <!-- COMPANY', '        <!-- SCREEN: COMPANY']
for m in end_markers:
    idx = html.find(m, i_start+100)
    print(f'{m!r} -> {idx}')
    if idx > 0:
        print('  context:', repr(html[idx:idx+60]))
