c = open('app.js', encoding='utf-8').read()

# Find the candidate card buttons section
idx1 = c.find('Invite</button>')
idx2 = c.find('Contact</button>', idx1)
idx3 = c.find('</div>', idx2) + len('</div>')

print('idx1=%d idx2=%d idx3=%d' % (idx1, idx2, idx3))
print('SECTION:')
print(repr(c[idx1-200:idx3]))
