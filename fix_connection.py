import re

f = 'app.js'
with open(f, 'r', encoding='utf-8') as fh:
    c = fh.read()

# ── 1. Remove duplicate searchCompanies (second definition) ──────────────────
marker = 'function searchCompanies'
i1 = c.index(marker)
i2 = c.index(marker, i1 + 1)

# Walk back from i2 to find the comment line that precedes the duplicate block
block_start = c.rfind('// ---- WOMEN SIDE:', 0, i2)
if block_start < 0:
    block_start = i2

# Walk forward to find the closing window.searchCompanies = searchCompanies;
end_marker = 'window.searchCompanies = searchCompanies;'
end_pos = c.index(end_marker, i2) + len(end_marker)

c = c[:block_start] + c[end_pos:]
print('Duplicate searchCompanies removed')

# ── 2. Insert static sample companies into _getAllRegisteredCompanies ─────────
cache_marker = '    _companiesCache = companies;'
insert_pos = c.index(cache_marker)

static_block = """
    // Static sample companies — always visible even before any company registers
    [
        { name:'TechSeva',           industry:'Technology', location:'Remote',    description:'Hiring freshers in tech roles.',          tagline:'Hiring freshers now!',  logo:'' },
        { name:'Craft India',        industry:'Education',  location:'Mumbai',    description:'Teaching tailoring and crafts to women.', tagline:'Empowering artisans',   logo:'' },
        { name:'GlowUp Studio',      industry:'Retail',     location:'Delhi',     description:'Beauty and wellness consultancy.',        tagline:'Beauty meets career',   logo:'' },
        { name:'MediCare Plus',      industry:'Healthcare', location:'Bangalore', description:'Healthcare support roles available.',     tagline:'Join our care team',    logo:'' },
        { name:'BrightMinds School', industry:'Education',  location:'Pune',      description:'Primary school teachers needed.',        tagline:'Shape future leaders',  logo:'' },
        { name:'CodeNest',           industry:'Technology', location:'Hybrid',    description:'Web development internships available.',  tagline:'Build the future',      logo:'' },
        { name:'FashionHub',         industry:'Retail',     location:'Chennai',   description:'Retail management and sales roles.',     tagline:'Style meets career',    logo:'' },
        { name:'PixelWorks',         industry:'Design',     location:'Hybrid',    description:'UI/UX design internships available.',    tagline:'Create. Inspire. Grow.',logo:'' },
        { name:'WordCraft',          industry:'Media',      location:'Remote',    description:'Content writing and editing roles.',     tagline:'Words that matter',     logo:'' },
        { name:'InsightCo',          industry:'Technology', location:'Remote',    description:'Data analyst positions open.',           tagline:'Data-driven growth',    logo:'' },
    ].forEach(s => { if (!seen.has(s.name)) { seen.add(s.name); companies.push(s); } });

"""

c = c[:insert_pos] + static_block + c[insert_pos:]
print('Static samples inserted')

# ── 3. Verify ─────────────────────────────────────────────────────────────────
count = len(re.findall(r'function searchCompanies', c))
has_static = 'Static sample companies' in c
print(f'searchCompanies definitions: {count}  (expected 1)')
print(f'Static samples present: {has_static}')

with open(f, 'w', encoding='utf-8') as fh:
    fh.write(c)
print('Saved.')
