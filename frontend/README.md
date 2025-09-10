# Doctor's Database - Frontend

React-based frontend application for the Doctor's Database system.

## 🛠️ Built With

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **Custom CSS** - Professional medical styling

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

Opens at http://localhost:5173

## 🏗️ Build

```bash
npm run build
```

Generates production build in `dist/` folder.

## 📁 Structure

```
src/
├── components/
│   ├── Navigation.jsx      # Header navigation
│   ├── Dashboard.jsx       # Dashboard overview
│   ├── AddPatient.jsx      # Add/Edit patient form
│   ├── PatientsList.jsx    # Patients grid with filters
│   └── PatientDetails.jsx  # Patient detail view
├── services/
│   └── api.js              # API service functions
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## 🎨 Styling

Custom CSS with:
- CSS variables for theming
- Professional medical color scheme
- Responsive grid layouts
- Mobile-first approach

## 📡 API Integration

All API calls are handled through `services/api.js`:
- Patient CRUD operations
- File upload handling
- Error management

## ⚙️ Configuration

Update API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```
