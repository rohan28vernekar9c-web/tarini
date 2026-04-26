with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 2: Replace the mismatch check to handle missing role gracefully
old2 = (
    "        // Role mismatch check\n"
    "        if (storedRole !== selectedRole) {\n"
    "\n"
    "            await auth.signOut();\n"
    "\n"
    "            showError(\"Selected role does not match your account.\");\n"
    "\n"
    "            return;\n"
    "\n"
    "        }"
)

new2 = (
    "        // Role mismatch check: only block if a role IS stored and doesn't match\n"
    "        if (storedRole && storedRole !== selectedRole) {\n"
    "            await auth.signOut();\n"
    "            showError(\"Selected role does not match your account.\");\n"
    "            return;\n"
    "        }\n"
    "\n"
    "        // If no role stored yet, trust the selected role and persist it\n"
    "        if (!storedRole) {\n"
    "            const _key = `profileData_${cred.user.uid}`;\n"
    "            const _ex = JSON.parse(localStorage.getItem(_key) || '{}');\n"
    "            _ex.role = selectedRole;\n"
    "            localStorage.setItem(_key, JSON.stringify(_ex));\n"
    "            db.collection('users').doc(cred.user.uid).set({ role: selectedRole }, { merge: true }).catch(console.warn);\n"
    "        }"
)

if old2 in content:
    content = content.replace(old2, new2)
    print("Fix 2 applied")
else:
    print("Fix 2 NOT FOUND - trying flexible match")
    import re
    pattern = r'        // Role mismatch check\s+if \(storedRole !== selectedRole\) \{.*?return;\s+\}'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = content[:match.start()] + new2 + content[match.end():]
        print("Fix 2 applied via regex")
    else:
        print("Fix 2 FAILED")

# Fix 3: Remove bad default 'woman' role in _loadUserProfileFromFirestore
old3 = "            if (!existing.role) existing.role = 'woman';\n"
if old3 in content:
    content = content.replace(old3, "")
    print("Fix 3 applied")
else:
    print("Fix 3 already applied or not found")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
