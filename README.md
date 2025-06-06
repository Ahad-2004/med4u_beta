# Med4U - Medical Records Management

Med4U is a comprehensive web application for managing personal medical records and health information.

## Features

- **User Authentication** - Secure sign up and login 
- **Dashboard** - Overview of your health information
- **Medical Records Management** - Upload and organize your medical documents
- **Report Summarization** - AI-powered summarization of medical reports using HuggingFace API
- **Lab Result Tracking** - Visual trend analysis of lab results over time
- **PDF Export** - Export summaries as PDF documents for sharing with providers
- **Cloud Storage** - Secure document storage with Cloudinary
- **Responsive Design** - Works on desktop and mobile devices

## Technical Stack

- **Frontend**: React with functional components and hooks
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Storage**: Cloudinary (alternative to Firebase Storage)
- **Database**: Firebase Firestore
- **AI Services**: HuggingFace API for medical report summarization
- **PDF Processing**: pdf.js for text extraction and html2pdf for generation
- **Data Visualization**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/med4u.git
cd med4u
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. Start the development server
```
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## New Features (Latest Update)

### Report Summarization
- Enhanced medical report analysis using NLP
- Automatic extraction of lab values and findings
- Context-aware summaries for different report types

### Lab Result Trends
- Interactive charts for tracking lab values over time
- Support for multiple metrics and tests
- Historical view of all lab values

### PDF Export
- Export report summaries as professional PDF documents
- Includes key findings and interpretation
- Ready to share with healthcare providers

### Performance Improvements
- Summary caching to reduce processing time
- Optimized HuggingFace API parameters
- Responsive design improvements

## Deployment

Med4U can be deployed on:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Project Structure

```
med4u/
├── public/            # Public assets
├── src/
│   ├── components/    # UI components
│   │   ├── Auth/      # Authentication components
│   │   ├── Dashboard/ # Dashboard components
│   │   ├── Medical/   # Medical-related components
│   │   ├── Profile/   # Profile components
│   │   ├── Reports/   # Report-related components
│   │   └── UI/        # Reusable UI components
│   ├── config/        # Application configuration
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # Firebase services
│   ├── App.js         # Main App component
│   ├── index.js       # Entry point
│   └── routes.js      # Application routes
└── tailwind.config.js # Tailwind CSS configuration
```

## Firebase Setup

### Authentication

- Enable Email/Password sign-in method in Firebase console

### Firestore Collections

The application uses the following collections:

- `users`: User profiles
- `medications`: Medication records
- `cases`: Medical cases
- `conditions`: Medical conditions
- `reports`: Medical reports metadata

### Storage

- Set up proper security rules for the Firebase Storage

## Acknowledgments

- Icons provided by [Heroicons](https://heroicons.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
