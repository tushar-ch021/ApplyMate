# ApplyMate - AI Resume Builder & ATS Analyzer

ApplyMate is a production-grade, AI-powered SaaS platform that helps job seekers audit, optimize, and edit their resumes for modern Applicant Tracking Systems (ATS). Using advanced deep analysis powered by Gemini AI, ApplyMate evaluates resume alignment with any target Job Description (JD), identifies critical keyword gaps, suggests context-aware improvements, rewrites specific sections on-demand, generates custom cover letters, and provides behavioral and technical interview preparation.

## Features

- **Double-Method Resume Input**: Secure file upload supporting PDF, DOCX, and TXT with server-side extraction, or raw text input with live character/word counters.
- **Deep ATS Analyzer**: AI-driven analysis yielding a detailed ATS score (0-100) presented via a dynamic circular score ring, section-by-section breakdown, keyword gap indicators (green/yellow/red badges), and an interactive gap analysis table.
- **AI Resume Optimizer**: Automatic structured resume refinement that aligns with target JD language without fabricating metrics, credentials, or skills.
- **Inline Resume Editor**: Side-by-side comparison of original and optimized resumes with rich interactive inline editing for professional summaries, experience bullet points, projects, and skills.
- **Section-Specific AI Rewrites**: One-click targeted AI editing with customizable user prompts (e.g., "Make it more action-oriented") and instant diff accept/reject mechanisms.
- **ATS Keyword Gap Analyzer**: Separate workspace highlighting high-impact missing keywords with exact context, nice-to-have terms, and strategic placement guidance.
- **Targeted Cover Letter Generator**: Custom cover letters matching company name, role, and tone selection (Professional, Friendly, Concise) based strictly on verified resume facts.
- **Comprehensive Interview Preparation Hub**: Multi-tab module covering role-specific technical Q&As, STAR framework templates for behavioral questions, smart candidate questions, and potential resume red flags.
- **Double-Format Export**: Professional, clean, and ATS-safe PDF (using `pdfkit`) and Word Document (using `docx` npm package) exports.
- **Session Workspace Management**: Persistent historical user dashboard tracking past session status, average score progression, and easy deletion.
- **Unified Full-Stack Architecture**: Single port (3000) React + Vite + Express container, supporting dark mode persistence, request rate limiting, and robust MongoDB Atlas synchronization.

---

## Tech Stack

### Frontend
- **React 19** & **Vite**
- **TailwindCSS** (Modern v4 utility-first CSS)
- **React Router v6** (Secure app navigation)
- **Axios** (API requests)
- **React Dropzone** (Drag-and-drop resume upload)
- **React Hook Form** (Form validation)
- **React Hot Toast** (Micro-animations and notifications)
- **Recharts** (Visual ATS section scores)
- **Framer Motion** (Staggered transition animations)

### Backend
- **Node.js** & **Express.js**
- **MongoDB Atlas** & **Mongoose** (Data persistence)
- **Multer** (File upload middleware)
- **pdf-parse** (PDF text extraction)
- **mammoth** (DOCX text extraction)
- **pdfkit** (High-quality PDF compilation)
- **docx** (Strict, parser-safe Word Document generation)
- **jsonwebtoken (JWT)** & **bcryptjs** (Stateless authentication)
- **Helmet, CORS, Rate Limiters** (SaaS security posture)

### AI Core
- **@google/genai** (Google Gemini API using model `gemini-3.5-flash` on the FREE tier)

---

## Prerequisites

1. **Node.js**: v18.x or above installed.
2. **MongoDB Atlas Account**: Database connection URI.
3. **Google AI Studio API Key**: Free API key from [Google AI Studio](https://aistudio.google.com).

---

## Installation & Local Setup

### 1. Set Up Environment Variables

Create a `.env` file in the root directory. You can copy the template below:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/applymate?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

### 2. Install Dependencies

Install all root dependencies (client and server are integrated into a single unified directory structure):

```bash
npm install
```

### 3. Run Locally

To start the integrated full-stack development server:

```bash
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

- **Backend**: Serves REST endpoints at `/api/*`
- **Frontend**: Vite runs hot-reload client-side assets concurrently on the same port

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create user account
- `POST /api/auth/login` — Sign in and receive secure JWT
- `GET /api/auth/me` — Retrieve active user details (Protected)

### Resume & Sessions
- `POST /api/resume/upload` — Parse PDF/DOCX; returns extracted text & session (Protected)
- `POST /api/resume/paste` — Create a session from pasted text (Protected)
- `GET /api/resume/sessions` — List last 20 user sessions (Protected)
- `GET /api/resume/sessions/:id` — Load full session with analysis (Protected)
- `DELETE /api/resume/sessions/:id` — Delete a session (Protected)
- `PATCH /api/resume/sessions/:id/resume` — Save edited resume JSON (Protected)
- `POST /api/resume/download/pdf` — Compile & stream professional PDF (Protected)
- `POST /api/resume/download/docx` — Compile & stream professional DOCX (Protected)

### AI Analysis (All Protected)
- `POST /api/analysis/ats` — Perform full ATS score and gap assessment
- `POST /api/analysis/optimize` — Run AI-powered resume content optimizer
- `POST /api/analysis/edit-section` — Rewrite a specific section via custom instructions
- `POST /api/analysis/keywords` — Extract critical vs nice-to-have keywords with context
- `POST /api/analysis/cover-letter` — Generate custom cover letter
- `POST /api/analysis/interview-prep` — Generate interview preparation Q&A and red flags

---

## MongoDB Database Setup

1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. In **Database Access**, create a user with read/write permissions.
4. In **Network Access**, whitelist `0.0.0.0/0` (or your IP).
5. Obtain your database connection string and replace `<username>` and `<password>` with your database user credentials inside your `.env` file.

---

## Deployment

### Full-Stack Container (e.g. Cloud Run, Render)
Since this repository features a unified backend that serves Vite assets static-build in production, it is ready to be compiled and deployed as a single service.
1. Configure build commands:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

## License

This project is licensed under the Apache 2.0 License.
