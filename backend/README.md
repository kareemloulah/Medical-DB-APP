# Doctor's Database - Backend API

Node.js/Express backend API for the Doctor's Database system.

## 🛠️ Built With

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **ES6 Modules** - Modern JavaScript

## 📦 Installation

```bash
npm install
```

## ⚙️ Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

## 🚀 Development

```bash
npm run dev
```

Server runs at http://localhost:5000

## 📡 API Endpoints

### Patients
- `GET /api/patients` - List patients (with filtering)
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Utility
- `GET /api/health` - Health check
- `GET /api/patients/stats` - Patient statistics
- `GET /api/patients/search` - Search patients

## 📁 Structure

```
├── models/
│   └── Patient.js          # MongoDB patient schema
├── routes/
│   └── patients.js         # Patient API routes
├── middleware/
│   └── upload.js           # File upload middleware
├── uploads/                # File storage directory
├── server.js               # Main server file
└── package.json
```

## 🗃️ Database

MongoDB schema with validation:
- Name validation (2-100 characters)
- Age validation (0-120)
- Phone number format validation
- File upload path storage

## 🔒 Security

- Helmet for security headers
- CORS configuration
- File upload restrictions
- Input validation and sanitization
- Error handling middleware

## 📄 File Uploads

- Images only (JPEG, PNG, GIF)
- 5MB size limit
- Unique filename generation
- Automatic cleanup on errors
