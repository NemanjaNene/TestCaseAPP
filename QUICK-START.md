# Quick Start Guide 🚀

## Start the Application

**Super easy way:**

```bash
./start
```

**Or with npm:**

```bash
npm run app
```

This will:

1. Kill any process on port 3000
2. Open your browser automatically
3. Start the development server

## First Time Setup

1. **Login**

   - Username: `admin`
   - Password: `admin123`

2. **Create Your First Project**

   - Click "New Project"
   - Enter project name (e.g., "E-Commerce Website")
   - Add a description (optional)
   - Click "Create Project"

3. **Add Test Cases**
   - Click on your project
   - Click "New Test Case"
   - Fill in the form:
     - **Title:** What you're testing (required)
     - **Description:** Additional context
     - **Preconditions:** What needs to be set up first
     - **Test Steps:** How to execute the test
     - **Expected Result:** What should happen
   - Click "Create Test Case"

---

## 🔥 Team Collaboration Setup (Firebase)

By default, the app runs in **local mode** - data is saved only in your browser.

To share data with your team, set up Firebase:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "qa-test-cases-team")
4. Disable Google Analytics (not needed) → Click "Create Project"

### Step 2: Create Web App

1. In your project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" → Click "</>" (Web) icon
3. Register app with nickname (e.g., "test-case-manager")
4. Copy the `firebaseConfig` values

### Step 3: Enable Firestore Database

1. In Firebase Console sidebar → "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select closest location (e.g., `europe-west1` for Europe)
5. Click "Enable"

### Step 4: Set Firestore Rules (IMPORTANT!)

1. In Firestore → "Rules" tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

> ⚠️ These rules allow anyone with the config to read/write. For production, add proper authentication.

### Step 5: Create .env.local File

Create a file named `.env.local` in the project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxx
```

Replace with YOUR values from Step 2.

### Step 6: Restart the App

```bash
./start
```

You should see in the console:

```
✅ Firebase initialized successfully
```

### Step 7: Share with Team

Share your `.env.local` file with teammates (via secure channel).
They copy it to their project folder and now everyone sees the same data! 🎉

---

## Tips

- Use numbered lists for test steps (1., 2., 3.)
- Be specific in expected results
- Keep preconditions clear
- Update test cases when requirements change

## Keyboard Shortcuts

- `Enter` - Submit forms (when focused on input)
- `Escape` - Close modals (planned feature)

## That's It! 🎉

You're ready to manage your test cases professionally!

---

For more details, see the full README.md
