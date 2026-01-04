# CalorieCounter PWA

An AI-powered Progressive Web App for calorie tracking and nutritional analysis using Claude AI.

## Features

- **AI Food Recognition**: Take photos of your meals and get instant nutritional analysis
- **Interactive Confirmation**: AI asks clarifying questions for accurate portion sizes
- **Manual Entry**: Add foods manually with AI assistance or direct input
- **Daily Tracking**: Monitor calories, protein, carbs, and fat intake
- **Historical Analytics**: View trends and averages over time with charts
- **PWA Support**: Install on mobile devices, works offline
- **User Authentication**: Secure account system with JWT tokens

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Zustand (state management)
- Chart.js (data visualization)
- PWA with service worker

### Backend
- Node.js + Express
- TypeScript
- SQLite (database)
- Anthropic Claude API (AI vision & analysis)
- JWT authentication
- bcrypt (password hashing)

## Setup

### Prerequisites
- Node.js 18+
- Anthropic API key

### Installation

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

Create `server/.env`:
```env
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

4. Run the development server
```bash
npm run dev
```

This will start both the client (port 5173) and server (port 3001).

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Register/Login**: Create an account or log in
2. **Add Food**:
   - Take a photo of your meal
   - Review AI-detected foods and nutrition
   - Adjust portions or add/remove items
   - Confirm and save
3. **Manual Entry**:
   - Use AI to parse text descriptions ("2 eggs and toast")
   - Or enter nutrition values directly
4. **View History**: Check your trends and averages over time

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Food Tracking
- `POST /api/food/analyze-image` - Analyze food photo
- `POST /api/food/manual-entry` - Parse manual entry
- `POST /api/food/entries` - Create food entry
- `PUT /api/food/entries/:id` - Update entry
- `DELETE /api/food/entries/:id` - Delete entry
- `GET /api/food/daily/:date` - Get daily summary
- `GET /api/food/history` - Get history range

## Project Structure

```
/
├── client/              # React PWA frontend
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   ├── store/       # Zustand stores
│   │   └── types/       # TypeScript types
│   └── vite.config.ts
├── server/              # Express backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Claude AI service
│   │   └── middleware/  # Auth middleware
│   └── tsconfig.json
├── shared/              # Shared types
│   └── types/
└── package.json
```

## License

MIT
