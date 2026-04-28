# Tarini - Women Empowerment Platform

A comprehensive platform connecting women job seekers with companies, featuring job applications, marketplace, skill development, and rewards.

## Features

- 🔐 **Authentication**: Email/Password & Google Sign-In
- 💼 **Job Portal**: Browse, filter, and apply for jobs
- 🛍️ **Marketplace**: Buy and sell handmade products
- 📚 **Skill Hub**: Access training courses
- 🏆 **Rewards System**: Earn coins and badges
- 🤖 **AI Assistant**: Career guidance and job matching
- 🏢 **Company Dashboard**: Post jobs and manage applications

## Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hosting**: Netlify

## Deployment

### Deploy to Netlify

1. **Connect to Git**:
   - Push your code to GitHub
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build command: `echo 'No build required'`
   - Publish directory: `.` (root)
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Environment Variables** (if needed):
   - Go to Site settings → Environment variables
   - Add any Firebase config if you want to use environment variables

4. **Deploy**:
   - Click "Deploy site"
   - Your site will be live at `https://your-site-name.netlify.app`

### Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Firebase Configuration

Make sure your Firebase configuration in `app.js` is properly set up:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Local Development

Simply open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

## Project Structure

```
tarini/
├── index.html          # Main HTML file
├── app.js             # Main JavaScript logic
├── styles.css         # Custom styles
├── netlify.toml       # Netlify configuration
├── *.png              # Images and logos
└── README.md          # This file
```

## License

© 2024 Tarini. All rights reserved.
