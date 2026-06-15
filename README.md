# VendorAI – Autonomous Vendor Onboarding & Compliance Agent

A production-quality full-stack application for AI-powered vendor onboarding, document validation, compliance checking, and risk assessment.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express.js, JWT Auth, Multer |
| Database | MongoDB Atlas (Mongoose) |
| AI | Google Gemini API |

## Project Structure

```
Vendor_Onboarding/
├── backend/
│   ├── server.js                 # Express entry point
│   ├── uploads/                  # Uploaded documents (auto-created)
│   └── src/
│       ├── config/               # Constants & configuration
│       ├── controllers/          # Route handlers
│       ├── middleware/           # Auth & file upload
│       ├── models/               # MongoDB schemas
│       ├── routes/               # API routes
│       ├── services/             # AI, compliance, risk logic
│       └── utils/                # Seed script
├── frontend/
│   └── src/
│       ├── components/           # Reusable UI components
│       ├── context/              # Auth context
│       ├── pages/                # Route pages
│       └── services/             # API client
└── README.md
```

## Features

1. **Authentication** – JWT login/register with Vendor and Admin roles
2. **Admin Dashboard** – Analytics cards, charts, vendor table
3. **Vendor Onboarding Form** – Company details collection
4. **Document Management** – Secure upload with status tracking
5. **AI Document Analyzer** – Gemini extracts GST, PAN, address, bank info
6. **Compliance Engine** – Scoring (0–100), missing doc/field detection
7. **Risk Scoring** – Low/Medium/High with visual indicators
8. **AI Email Generator** – Professional missing-document requests
9. **AI Chatbot** – Context-aware onboarding Q&A
10. **Onboarding Timeline** – Visual progress tracker

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Setup Instructions

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** – copy and edit `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vendorai
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

**Frontend** – copy and edit `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Users

```bash
cd backend
npm run seed
```

Creates:
- **Admin:** admin@vendorai.com / admin123
- **Vendor:** vendor@vendorai.com / vendor123

## Run Instructions

Open two terminals:

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify` | Verify JWT |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors/dashboard/stats` | Admin dashboard stats |
| GET/POST | `/api/vendors/me` | Get/save vendor profile |
| POST | `/api/vendors/me/assess` | Run full assessment |
| GET | `/api/vendors` | List all vendors (admin) |
| PATCH | `/api/vendors/:id/status` | Approve/reject (admin) |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document (multipart) |
| GET | `/api/documents/me` | Get my documents |
| DELETE | `/api/documents/:id` | Delete document |

### Compliance & Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compliance/me` | Get compliance report |
| POST | `/api/compliance/me/run` | Run compliance check |
| GET | `/api/risk/me` | Get risk assessment |
| POST | `/api/risk/me/run` | Run risk assessment |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send chatbot message |
| POST | `/api/email/generate` | Generate missing doc email |

## MongoDB Schemas

- **User** – Authentication, roles
- **Vendor** – Company profile, onboarding status, timeline
- **Document** – File metadata, AI extracted data, status
- **ComplianceReport** – Score, missing items, recommendations
- **RiskAssessment** – Risk score, level, deductions
- **ChatHistory** – Conversation sessions

## Deployment Instructions

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
```

- Set `VITE_API_URL` to your production API URL
- Deploy the `dist/` folder

### Backend (Railway / Render / Heroku)

1. Set environment variables from `.env.example`
2. Ensure `uploads/` directory is writable (use cloud storage for production)
3. Start command: `npm start`

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add your IP to Network Access (or allow 0.0.0.0/0 for dev)
3. Create a database user and copy the connection string to `MONGODB_URI`

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS `FRONTEND_URL` to your domain
- [ ] Use cloud storage (S3/GCS) instead of local `uploads/`
- [ ] Enable MongoDB Atlas IP whitelisting
- [ ] Set up HTTPS on both frontend and backend

## License

MIT
