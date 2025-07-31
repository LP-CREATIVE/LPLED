# LED Display Manager

A web application for managing Novastar TB Series LED displays via VNNOX cloud platform.

## Project Structure

```
led-display-manager/
├── frontend/          # Next.js TypeScript frontend
├── backend/           # Node.js Express API backend
├── shared/            # Shared types and utilities
└── package.json       # Root package.json for monorepo
```

## Features

- User authentication and management via Supabase
- LED display registration and management
- Media upload with format validation
- Template library for quick content creation
- Real-time display control (brightness, volume, content)
- Display monitoring and status updates
- VNNOX API integration

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Supabase Auth
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **LED Control**: VNNOX Cloud Platform API
- **Media Processing**: Sharp for image optimization

## Getting Started

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see below)
4. Run development servers: `npm run dev`

## Environment Variables

Create `.env.local` files in both frontend and backend directories:

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
VNNOX_AK=your_vnnox_access_key
VNNOX_AS=your_vnnox_access_secret
VNNOX_API_URL=https://api.vnnox.com
PORT=3001
```