# BloodLink - Blood Bank Management System

A modern, full-stack blood bank management platform connecting blood donors with those in need.

## Features

- Real-time blood donor search
- Emergency blood request system
- User authentication with Supabase
- Donor registration and profile management
- Responsive dark theme UI with premium animations
- Row Level Security (RLS) for data protection

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React
- **Routing**: React Router v7

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Wait for the project to be provisioned (~2 minutes)
4. Go to Project Settings > API

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- `VITE_SUPABASE_URL`: Found in Project Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY`: Found in Project Settings > API > Project API keys (anon public)

### 3. Database Setup

The database schema is automatically created via Supabase migrations. The schema includes:

- `profiles` - User profiles linked to auth.users
- `donors` - Blood donor information
- `blood_requests` - Emergency blood requests

All tables have Row Level Security (RLS) enabled.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## User Roles

| Role | Description |
|------|-------------|
| `donor` | Can register as blood donor, update availability |
| `seeker` | Can submit emergency blood requests |

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/            # React contexts (Auth, Toast)
├── hooks/               # Custom hooks (useAnimations)
├── lib/                 # Supabase client
├── pages/               # Page components
└── index.css            # Global styles with animations
```

## Troubleshooting

### "supabaseUrl is required" error

Make sure your `.env` file contains valid Supabase credentials.

### Authentication not persisting

Check that cookies are enabled and the Supabase URL is correct.

## License

MIT
