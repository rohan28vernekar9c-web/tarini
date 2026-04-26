import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

correct_options = '''<option value="en">English</option>
                                            <option value="hi">हिन्दी (Hindi)</option>
                                            <option value="bn">বাংলা (Bengali)</option>
                                            <option value="te">తెలుగు (Telugu)</option>
                                            <option value="mr">मराठी (Marathi)</option>
                                            <option value="ta">தமிழ் (Tamil)</option>
                                            <option value="ur">اردو (Urdu)</option>
                                            <option value="gu">ગુજરાતી (Gujarati)</option>
                                            <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                            <option value="ml">മലയാളം (Malayalam)</option>
                                            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                                            <option value="or">ଓଡ଼ିଆ (Odia)</option>
                                            <option value="as">অসমীয়া (Assamese)</option>'''

content = re.sub(
    r'<option value=\"en\">English</option>.*?<option value=\"as\">[^<]+</option>', 
    correct_options, 
    content, 
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed dropdown text!')
