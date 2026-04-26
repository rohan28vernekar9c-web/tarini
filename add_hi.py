import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

hi_dict = '''    hi: {
        emailAddress: "ईमेल पता", emailPlaceholder: "name@example.com",
        password: "पासवर्ड", passwordPlaceholder: "पासवर्ड",
        forgotPassword: "पासवर्ड भूल गए?", signIn: "साइन इन",
        or: "या", signInGoogle: "Google के साथ साइन इन करें",
        chooseRole: "अपनी भूमिका चुनें", chooseRoleSub: "वह भूमिका चुनें जो आपका सबसे अच्छा वर्णन करती है",
        womanReg: "महिला पंजीकरण", fullName: "पूरा नाम", fullNamePlaceholder: "आपका पूरा नाम",
        skills: "कौशल", skillsPlaceholder: "उदा. सिलाई, हस्तशिल्प, शिक्षण",
        jobPref: "नौकरी की प्राथमिकता", selectPref: "प्राथमिकता चुनें", createAccount: "खाता बनाएं",
        companyReg: "कंपनी पंजीकरण", companyName: "कंपनी का नाम", industry: "उद्योग",
        address: "पता", addressPlaceholder: "शहर, राज्य", registerCompany: "कंपनी पंजीकृत करें",
        adminReg: "व्यवस्थापक पंजीकरण", registerAdmin: "व्यवस्थापक के रूप में पंजीकृत करें",
        newToTarini: "Tarini में नए हैं?", signUp: "साइन अप करें",
        alreadyHaveAccount: "क्या आपके पास पहले से खाता है?", back: "पीछे",
        loginAs: "लॉगिन करें", selectRole: "अपनी भूमिका चुनें",
        welcomeBack: "Tarini में आपकी वापसी का स्वागत है", tariniWelcomesYou: "Tarini आपका स्वागत करता है",
        womanOption: "👩 महिला", companyOption: "🏢 कंपनी",
        womanUsers: "महिला उपयोगकर्ता", womanUsersDesc: "उन व्यक्तियों के लिए जो नौकरी की तलाश में हैं, उत्पाद बेच रहे हैं, और नए कौशल सीख रहे हैं",
        company: "कंपनी", companyDesc: "उन कंपनियों के लिए जो नौकरियां पोस्ट करना और कुशल प्रतिभाओं को नियुक्त करना चाहती हैं",
        admin: "व्यवस्थापक", adminDesc: "प्लेटफ़ॉर्म प्रबंधन और उपयोगकर्ता नियंत्रण पहुंच के लिए",
        fullTime: "पूर्णकालिक", partTime: "अंशकालिक", freelance: "फ्रीलांस", remote: "रिमोट",
        selectIndustry: "उद्योग चुनें", tech: "प्रौद्योगिकी", manufacturing: "विनिर्माण", retail: "खुदरा",
        healthcare: "स्वास्थ्य सेवा", education: "शिक्षा", other: "अन्य", contactEmail: "संपर्क ईमेल",
        adminNamePlaceholder: "व्यवस्थापक नाम", adminEmailPlaceholder: "admin@tarini.com",
        companyNamePlaceholder: "Acme Pvt. Ltd."
    },'''

new_content = content.replace('    hi: {},\n', hi_dict + '\n')
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Hindi dictionary added!')
