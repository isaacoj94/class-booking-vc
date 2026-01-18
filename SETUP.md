# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A random secure string (generate with `openssl rand -hex 32`)
   - `JWT_REFRESH_SECRET` - Another random secure string
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - Your AI service API key

3. **Set up the database:**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create tables in database
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   - Navigate to http://localhost:3000
   - Sign up for a new account
   - You'll be logged in as a CUSTOMER by default

## Creating Admin Accounts

To create an admin account, you can use Prisma Studio or directly update the database:

```bash
npm run db:studio
```

In Prisma Studio:
1. Go to the `User` table
2. Find your user
3. Change the `role` field from `CUSTOMER` to `ADMIN`
4. Save

Or use SQL:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## First Steps After Setup

1. **Create some classes** (as admin):
   - Log in as admin
   - Go to `/admin/classes`
   - Click "Create Class"
   - Fill in class details
   - Click "Generate Instances" to create class sessions for the next 4 weeks

2. **Book a class** (as customer):
   - Log in as customer
   - Go to `/dashboard/classes/book`
   - Select a class and book a session

3. **Mark attendance** (as admin):
   - This would typically be done via an admin interface (to be built)
   - Or via API: `POST /api/attendance` with `bookingId`

## Database Schema

All tables are defined in `prisma/schema.prisma`. Key tables:
- `users` - All users (customers, admins, teachers)
- `customers` - Customer-specific data (credits, membership, streaks)
- `classes` - Class definitions
- `class_instances` - Individual class sessions
- `bookings` - Customer bookings
- `attendance` - Attendance records
- `checkpoints` - Milestones achieved by customers
- `credit_transactions` - Credit history
- `progress_reports` - Teacher progress reports
- `ai_interactions` - AI-generated messages

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

### Customer
- `GET /api/customers/me` - Get current customer data
- `GET /api/classes` - List all classes
- `GET /api/classes/[id]` - Get single class
- `GET /api/class-instances` - Get available class instances
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Admin
- `POST /api/classes` - Create class
- `PATCH /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Deactivate class
- `POST /api/class-instances/generate` - Generate class instances
- `POST /api/attendance` - Mark attendance

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` to install dependencies

**Database connection errors:**
- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running
- Verify database exists

**JWT errors:**
- Make sure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `.env`

**Prisma errors:**
- Run `npm run db:generate` to regenerate Prisma client
- Run `npm run db:push` to sync schema to database

## Next Features to Build

See `PROJECT_PLAN.md` for the full roadmap. Priority next steps:

1. ✅ Phase 1 & 2: Foundation + Booking System (COMPLETE)
2. ⏳ Phase 3: Attendance & Checkpoints (IN PROGRESS)
3. ⏳ Phase 4: Customer Dashboard Enhancement
4. ⏳ Phase 5-12: Admin features, AI integration, polish
