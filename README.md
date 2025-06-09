# Med4U – Medical Records & Lab Report Summarizer

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/frontend-React-blue?logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/styling-TailwindCSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/deployed%20on-Render-46b1b7?logo=render)](https://render.com/)

Med4U is a modern web app for managing personal medical records, uploading and summarizing lab reports, and visualizing health trends. It features secure authentication, AI-powered OCR and summarization, and a beautiful, responsive UI.

---

## ✨ Features

- **User Authentication** – Secure sign up and login (Firebase)
- **Dashboard** – Overview of your health and recent activity
- **Medical Records Management** – Upload, organize, and view medical documents (PDF)
- **OCR & Report Summarization** – AI-powered OCR (Tesseract.js) and medical report summarization (HuggingFace API)
- **Lab Result Tracking** – Visual trend analysis of lab results over time
- **PDF Export** – Export summaries as PDF documents for sharing
- **Cloud Storage** – Secure document storage (Cloudinary)
- **Responsive Design** – Works on desktop and mobile
- **Dark Mode** – Beautiful in both light and dark themes

---

## 🛠️ Technical Stack

- **Frontend:** React (functional components, hooks), Tailwind CSS
- **Backend:** Node.js, Express, Tesseract.js (OCR), Deployed on Render
- **State Management:** React Context API
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Cloudinary
- **AI Services:** HuggingFace API (summarization)
- **PDF Processing:** pdf.js, html2pdf.js
- **Data Visualization:** Chart.js (react-chartjs-2)

---

## 🚀 Live Demo

- **Frontend:** [med4u-frontend on Render](https://your-frontend-url.onrender.com)
- **Backend (OCR API):** [med4u-backend on Render](https://your-backend-url.onrender.com)

---

## 🏗️ Project Structure

```
med4u_beta/
├── public/            # Public assets
├── src/
│   ├── components/    # UI components
│   ├── pages/         # Main pages (Dashboard, Reports, etc.)
│   ├── services/      # API, OCR, summarizer logic
│   ├── hooks/         # Custom React hooks
│   ├── context/       # React context providers
│   └── ...            # Other app logic
├── ocr-summary-api/   # Express backend for OCR (Tesseract.js)
├── package.json       # Project metadata
└── tailwind.config.js # Tailwind CSS config
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```powershell
   git clone https://github.com/yourusername/med4u.git
   cd med4u_beta
   ```
2. **Install dependencies**
   ```powershell
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root and add:
     ```env
     REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
     REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_api_key
     REACT_APP_OCR_API_URL=https://your-backend-url.onrender.com/api/ocr
     ```
4. **Start the frontend**
   ```powershell
   npm start
   ```
5. **Start the backend (OCR API)**
   ```powershell
   cd ocr-summary-api
   npm install
   npm start
   ```
6. **Open your browser** and go to `http://localhost:3000`

---

## ☁️ Deployment

Med4U can be deployed for free on [Render](https://render.com/):

- **Frontend:** Deploy as a Static Site (build command: `npm run build`, publish directory: `build`)
- **Backend:** Deploy as a Web Service (start command: `node app.js` in `ocr-summary-api/`)
- Set environment variables in the Render dashboard for both services
- See the [Render deployment guide](https://render.com/docs/deploy-create-react-app) for more details

Other supported platforms: Netlify, Vercel, Firebase Hosting, GitHub Pages (frontend only)

---

## 📝 Firebase Setup

- Enable Email/Password sign-in in Firebase Auth
- Set up Firestore collections: `users`, `medications`, `cases`, `conditions`, `reports`
- Configure Firebase Storage security rules

---

## 📁 Example .env

```env
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_HUGGINGFACE_API_KEY=xxx
REACT_APP_OCR_API_URL=https://your-backend-url.onrender.com/api/ocr
```

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Heroicons](https://heroicons.com/) for icons
- [Tailwind UI](https://tailwindui.com/) for UI inspiration
- [Render](https://render.com/) for free hosting
