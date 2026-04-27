import sys
c = open('index.html', encoding='utf-8').read()
idx = c.find('Top Companies Recommended')
if idx < 0:
    idx = c.find('top-companies-container')
sys.stdout.write('idx=' + str(idx) + '\n')
sys.stdout.write(c[max(0,idx-300):idx+800])
