import json
import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const authTranslations = (\{.*?\n\});\n', content, re.DOTALL)
if match:
    dict_str = match.group(1)
    
    def fix_multi(text):
        original = text
        for _ in range(4):
            try:
                b = text.encode('cp1252', errors='ignore')
                new_text = b.decode('utf-8', errors='strict')
                if new_text == text: break
                text = new_text
            except UnicodeDecodeError:
                break
        
        # fallback just in case
        return text if text != original else original

    def repl(m):
        val = m.group(1)
        fixed = fix_multi(val)
        return '\"' + fixed + '\"'

    new_dict_str = re.sub(r'\"([^\"]+)\"', repl, dict_str)
    
    if dict_str != new_dict_str:
        print('Fixed some mojibake!')
        idx = new_dict_str.find('hi: {')
        if idx != -1:
            print(new_dict_str[idx:idx+200])
        
        # Save to file
        new_content = content.replace(dict_str, new_dict_str)
        with open('app.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Saved app.js')
    else:
        print('No changes made.')
else:
    print('Not found')
