import sys
sys.stdout.reconfigure(encoding='utf-8')

html = open('index.html', encoding='utf-8').read()
js   = open('app.js',    encoding='utf-8').read()

# Find what comes after screen-all-companies closing div
i_start = html.find('        <div id="screen-all-companies"')
print('start:', i_start)
# Find the closing </div>\n\n        <!-- next screen
chunk = html[i_start:i_start+3000]
print(repr(chunk[-500:]))
