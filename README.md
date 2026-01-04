# CalorieCounter PWA

An AI-powered Progressive Web App for calorie tracking and nutritional analysis using Claude AI, Firebase, and Netlify.

## Features

- **AI Food Recognition**: Take photos of your meals and get instant nutritional analysis powered by Claude
- **Interactive Clarification**: AI asks clarifying questions for accurate portion sizes
- **Manual Entry**: Add foods manually with AI assistance or direct input
- **Daily Tracking**: Monitor calories, protein, carbs, and fat intake
- **Historical Analytics**: View trends and averages over time with charts
- **PWA Support**: Install on mobile devices, works offline
- **Firebase Authentication**: Secure user accounts
- **Cloud Storage**: Food images stored in Firebase Storage

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Zustand (state management)
- Chart.js (data visualization)
- Firebase Auth & Storage
- PWA with service worker

### Backend
- Netlify Functions (serverless)
- Firebase Firestore (database)
- Firebase Authentication
- Firebase Storage
- Anthropic Claude API (AI vision & analysis)

## Setup

### Prerequisites
- Node.js 18+
- Firebase account
- Anthropic API key
- Netlify account

### 1. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (click Google → Enable → Save)

3. Create Firestore database:
   - Go to Firestore Database
   - Create database in production mode
   - Deploy security rules later

4. Enable Storage:
   - Go to Storage
   - Get started
   - Deploy security rules later

5. Get your Firebase config:
   - Project Settings > General
   - Add a web app
   - Copy the config values

6. Get service account key:
   - Project Settings > Service accounts
   - Generate new private key
   - Download JSON file

### 2. Local Development

1. Clone the repository
```bash
git clone <repo-url>
cd caloriecounter
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create `client/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

4. Deploy Firebase rules
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select Firestore and Storage
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

5. Run development server
```bash
npm run dev
```

The app will be available at http://localhost:8888 (Netlify Dev)

### 3. Deploy to Netlify

#### Option A: Deploy via Netlify CLI

1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

2. Login to Netlify
```bash
netlify login
```

3. Deploy
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify:
```bash
netlify env:set ANTHROPIC_API_KEY "your_key"
netlify env:set FIREBASE_PROJECT_ID "your_project_id"
netlify env:set FIREBASE_CLIENT_EMAIL "your_client_email"
netlify env:set FIREBASE_PRIVATE_KEY "your_private_key"
netlify env:set FIREBASE_STORAGE_BUCKET "your_bucket"
```

#### Option B: Deploy via Git

1. Push code to GitHub/GitLab/Bitbucket

2. Go to [Netlify](https://app.netlify.com)

3. Click "New site from Git"

4. Select your repository

5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - Functions directory: `netlify/functions`

6. Add environment variables in Site Settings > Environment Variables:
   - `ANTHROPIC_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_STORAGE_BUCKET`

7. Deploy!

### 4. Environment Variables Reference

#### Client Variables (Vite - prefix with VITE_)
These go in `client/.env` for local dev and are built into the app:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

#### Server Variables (Netlify Functions)
These go in root `.env` for local dev and Netlify dashboard for production:
```
ANTHROPIC_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_STORAGE_BUCKET
```

## Usage

1. **Register/Login**: Create an account using email/password
2. **Add Food via Photo**:
   - Click "+ Photo" on any meal
   - Take a photo or choose from gallery
   - Review AI-detected foods and nutrition
   - Adjust portions or add/remove items
   - Confirm and save
3. **Manual Entry**:
   - Click "Manual" button
   - Use AI mode: describe your meal ("2 eggs and toast")
   - Or use direct mode: enter nutrition values manually
4. **View History**: Check the History tab for trends and charts
5. **Profile**: Manage your account and logout

## API Endpoints (Netlify Functions)

- `/.netlify/functions/analyze-image` - Analyze food photo with Claude
- `/.netlify/functions/manual-entry` - Parse manual food description
- `/.netlify/functions/food-entries` - CRUD operations for food entries
  - `POST /food-entries` - Create entry
  - `PUT /food-entries/:id` - Update entry
  - `DELETE /food-entries/:id` - Delete entry
  - `GET /food-entries/daily/:date` - Get daily summary
  - `GET /food-entries/history?startDate=...&endDate=...` - Get history

## Project Structure

```
/
├── client/              # React PWA frontend
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client & Firebase
│   │   └── store/       # Zustand stores
│   └── vite.config.ts
├── netlify/
│   └── functions/       # Serverless functions
│       ├── src/
│       │   ├── services/   # Claude AI service
│       │   └── utils/      # Firebase admin
│       ├── analyze-image.ts
│       ├── manual-entry.ts
│       └── food-entries.ts
├── shared/              # Shared TypeScript types
│   └── types/
├── firestore.rules      # Firestore security rules
├── storage.rules        # Storage security rules
└── netlify.toml         # Netlify configuration
```

## Firebase Security Rules

### Firestore Rules
Users can only access their own food entries.

### Storage Rules
Users can only upload images to their own folder (`food-images/{userId}/`).

## Cost Estimation

- **Firebase**: Free tier supports ~50K reads, 20K writes, 1GB storage per day
- **Netlify**: Free tier supports 100GB bandwidth, 300 build minutes per month
- **Anthropic Claude API**: Pay per use (~$3 per 1M input tokens)

For a typical user (3 meals/day):
- ~90 API calls/month
- ~500MB storage/year
- Should stay within free tiers

## Troubleshooting

### Build fails on Netlify
- Check environment variables are set correctly
- Ensure Firebase private key is properly escaped with `\n`

### Firebase authentication errors
- Verify Firebase config in `client/.env`
- Check Firebase Authentication is enabled in console

### Images not uploading
- Verify Storage rules are deployed
- Check Storage bucket name matches environment variable

### Claude API errors
- Verify ANTHROPIC_API_KEY is set
- Check API key has sufficient credits

## License

MIT
