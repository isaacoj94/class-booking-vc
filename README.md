# Ballet Class Booking Platform

A full-stack web application for managing ballet class bookings, customer credits, attendance tracking, and AI-powered engagement features.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **AI Integration**: OpenAI or Anthropic Claude
- **State Management**: Zustand, TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository (or navigate to project directory)

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` - Random secure strings
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI service API key

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations for production
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages (login/signup)
│   ├── dashboard/         # Customer dashboard
│   ├── admin/             # Admin dashboard
│   └── page.tsx           # Landing page
├── lib/                   # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth utilities
│   └── api-utils.ts       # API helper functions
├── prisma/
│   └── schema.prisma      # Database schema
└── components/            # React components (to be added)
```

## Features Implemented (Phase 1)

✅ Landing page with hero, features, and CTA  
✅ Authentication system (signup/login)  
✅ Customer dashboard shell  
✅ Admin dashboard shell  
✅ Database schema with all core tables  
✅ Design system (Lululemon/Nike style)

## Features To Be Implemented

### Phase 2: Core Booking System
- Class management (CRUD)
- Class instance generation
- Booking API and UI
- Credits deduction
- Calendar view

### Phase 3: Attendance & Checkpoints
- Attendance check-in
- Checkpoint detection
- Streak calculation

### Phase 4-12: See PROJECT_PLAN.md for full roadmap

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in

### Customer
- `GET /api/customers/me` - Get current customer data

### Admin (to be implemented)
- `GET /api/admin/customers` - List all customers
- `GET /api/admin/classes` - List all classes
- `GET /api/admin/leaderboard` - Get leaderboard data

## Database Schema

The database includes tables for:
- Users & Customers
- Classes & Class Instances
- Bookings & Attendance
- Checkpoints & Progress Reports
- AI Interactions & Notifications
- Credit Transactions

See `prisma/schema.prisma` for full schema definition.

## Development

### Database Commands
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes to DB
npm run db:migrate    # Create migration
npm run db:studio     # Open Prisma Studio (GUI)
```

### Linting
```bash
npm run lint
```

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI service API key

## Production Deployment

1. Set up production database (PostgreSQL)
2. Configure environment variables
3. Run database migrations
4. Build the application: `npm run build`
5. Start production server: `npm start`

Recommended hosting:
- Frontend: Vercel
- Backend: Vercel API routes (Next.js serverless)
- Database: Supabase, Neon, or Railway

## Documentation

See `PROJECT_PLAN.md` for comprehensive project documentation including:
- System architecture
- Feature breakdown
- AI integration points
- Implementation phases
- Security considerations

## License

Private project
