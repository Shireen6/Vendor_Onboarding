# VendorAI – Autonomous Vendor Onboarding & Compliance Agent

A production-quality vendor onboarding system that validates documents, checks compliance, and creates missing-data requests using AI.

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS
- Responsive modern SaaS UI

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MongoDB Atlas

### AI & File Handling
- Google Gemini API
- Multer for file uploads

## Features

1. **Authentication System**
   - Login/Register pages
   - Vendor and Admin roles
   - JWT-based authentication

2. **Admin Dashboard**
   - Total vendors analytics
   - Pending/Approved/Rejected vendor counts
   - Professional SaaS design

3. **Vendor Onboarding Form**
   - Company information collection
   - Secure document upload
   - Multiple document types support

4. **Document Management**
   - Document status tracking
   - File storage and organization
   - Status: Uploaded, Missing, Under Review, Approved, Rejected

5. **AI Document Analyzer**
   - Google Gemini integration
   - Automatic information extraction
   - Structured JSON output

6. **Compliance Engine**
   - Document validation
   - Compliance scoring (0-100)
   - Missing document detection

7. **Risk Scoring**
   - Low/Medium/High risk levels
   - Visual score indicators
   - Intelligent scoring logic

8. **AI Email Generator**
   - Professional missing document requests
   - Automated communication
   - Customizable templates

9. **AI Chatbot**
   - Vendor query assistance
   - Real-time responses
   - Context-aware answers

10. **Onboarding Timeline**
    - Visual progress tracking
    - Status updates
    - Process transparency

## Project Structure

```
vendorai/
├── frontend/          # React application
├── backend/           # Node.js API server
├── uploads/           # File storage directory
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. Clone the repository
2. Install frontend dependencies
3. Install backend dependencies
4. Configure environment variables
5. Start the development servers

### Environment Variables

Create `.env` files in both frontend and backend directories with the required configurations.

## Deployment

### Frontend
- Build for production
- Deploy to Vercel/Netlify

### Backend
- Deploy to Railway/Heroku
- Configure MongoDB Atlas
- Set up environment variables

## License

MIT License
