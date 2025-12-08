# QA Test Case Manager 🧪

Professional Test Case Management Tool for QA Engineers

## Features ✨

- **User Authentication** - Secure login system
- **Project Management** - Create and organize multiple projects
- **Test Case Creation** - Comprehensive test case forms with all necessary fields:
  - Title
  - Description
  - Preconditions
  - Test Steps
  - Expected Results
- **CRUD Operations** - Create, Read, Update, and Delete test cases
- **Beautiful UI** - Modern, responsive design with smooth animations
- **Local Storage** - All data persists in browser local storage

## Getting Started 🚀

### Installation

```bash
# Install dependencies
npm install

# Run the application (easiest way!)
./start

# Or use npm commands
npm run dev
npm run app
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

- **Username:** admin
- **Password:** admin123

## Usage 📝

1. **Login** - Use the default credentials or create your own
2. **Create Project** - Click "New Project" to create your first project
3. **Add Test Cases** - Select a project and start adding test cases
4. **Manage** - Edit or delete test cases as needed

## Tech Stack 💻

- **Next.js 14** - React framework
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Beautiful icons
- **Local Storage** - Data persistence

## Project Structure 📁

```
├── app/
│   ├── page.tsx          # Login page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── ProjectView.tsx        # Project detail view
│   ├── CreateProjectModal.tsx # Project creation modal
│   ├── TestCaseForm.tsx       # Test case form
│   └── TestCaseList.tsx       # Test case list
├── types/
│   └── index.ts          # TypeScript interfaces
└── utils/
    └── storage.ts        # Local storage utilities
```

## Features in Detail 📋

### Project Management
- Create unlimited projects
- Each project can contain multiple test cases
- Delete projects (with confirmation)
- Track creation dates

### Test Cases
- Structured format matching industry standards
- Edit existing test cases
- Delete with confirmation
- Track creation and update timestamps
- Full CRUD operations

### User Experience
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Visual feedback for all actions
- Modern gradient designs

## Data Storage 💾

All data is stored in browser's Local Storage:
- `qa_users` - User accounts
- `qa_current_user` - Currently logged in user
- `qa_projects` - All projects
- `qa_test_cases` - All test cases

To reset the application, clear your browser's Local Storage.

## Tips 💡

1. Use descriptive project names for easy identification
2. Number your test steps for clarity
3. Be specific in preconditions and expected results
4. Regularly backup your test cases (export Local Storage data)
5. Use the edit feature to keep test cases up to date

## Future Enhancements 🔮

Potential features for future versions:
- Export test cases (PDF, Excel, CSV)
- Import test cases
- Test case templates
- Tags and categories
- Search and filter
- Test execution tracking
- Multiple users with permissions
- Backend integration
- File attachments

## License 📄

MIT

---

Built with ❤️ for QA Engineers
