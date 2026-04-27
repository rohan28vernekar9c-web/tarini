import sys
c = open('app.js', encoding='utf-8').read()
lines = c.split('\n')

def show_lines(start, end):
    for i in range(start-1, min(end, len(lines))):
        sys.stdout.write(str(i+1) + ': ' + lines[i] + '\n')

sys.stdout.write('=== _topCompanies (1436-1450) ===\n')
show_lines(1436, 1450)
sys.stdout.write('\n=== renderTopCompanies (1562-1620) ===\n')
show_lines(1562, 1620)
sys.stdout.write('\n=== initJobsPage (1648-1660) ===\n')
show_lines(1648, 1660)
