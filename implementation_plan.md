# Translate the Entire Application

The application currently supports changing languages for the authentication screen using a hardcoded dictionary (`authTranslations`). To translate the entire application (Dashboard, Profile, Marketplace, etc.) into all 13 supported languages dynamically, manually translating every piece of text would be extremely slow, difficult to maintain, and bloat the code significantly.

Instead, the most robust and standard approach is to integrate the **Google Translate Website Widget**. We can connect it to your existing language dropdown so that it seamlessly translates the whole app without the user ever seeing the default Google Translate UI.

## Proposed Changes

### 1. Integration of Google Translate
- Include the Google Translate API script in `index.html`.
- Initialize the Google Translate widget configured for the 13 languages you support: `en, hi, bn, mr, ta, te, gu, kn, ml, pa, or, ur, as`.
- Add a hidden container (`<div id="google_translate_element"></div>`) so the Google widget can load invisibly.

### 2. Connect the Custom Dropdown
- We will update the `change` event listener on your existing dropdown (`auth-lang-select`).
- When a user selects a language (e.g., Hindi), the script will automatically programmatically select "Hindi" in the hidden Google Translate widget and trigger a `change` event.
- This will instantly translate the **entire application** (all screens, dynamic content, placeholders, and buttons) into the chosen language.

### 3. Cleanup & Adjustments
- We will add some CSS rules to hide the Google Translate top banner (which normally pushes the page down) to keep the app's premium look.
- We will retain your `localStorage` saving mechanism so that if the user refreshes the page, their selected language is remembered and automatically applied.

## User Review Required

> [!IMPORTANT]
> **Use of Google Translate API**
> Are you comfortable using the Google Translate Website Widget to handle the translations for the rest of the application? This is the fastest and most comprehensive way to achieve full-app translation. If you strictly prefer manual dictionary-based translations (like the current Auth screen) for the entire app, please let me know, though it will require a massive manual effort to build dictionaries for all the text.

## Verification Plan

- Select a language (e.g., Odia) from the dropdown on the login screen.
- Verify that the auth screen translates.
- Log in and verify that the Dashboard, navigation items, and all text are also translated into Odia.
- Refresh the page and verify the translation persists.
