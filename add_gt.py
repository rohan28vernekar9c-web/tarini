with open('index.html', 'r', encoding='cp1252', errors='replace') as f:
    content = f.read()

google_script = '''
    <!-- Google Translate Global Widget (Hidden) -->
    <div id="google_translate_element" style="display:none;"></div>
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <style>
        /* Hide Google Translate UI */
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; position: static !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
    </style>
'''

if '</body>' in content:
    content = content.replace('</body>', google_script + '\n</body>', 1)

with open('index.html', 'w', encoding='utf-8', errors='replace') as f:
    f.write(content)
print('Google Translate added to index.html and saved as UTF-8')
