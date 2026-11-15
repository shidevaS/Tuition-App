# Tuiton — Tuition Meets the AI Studio

A learning platform that blends school-subject tuition with an AI & innovation track — live classes plus integrated content, daily challenges, and a portfolio that proves what you can build.

## Readiness

The local web app uses SQLite and seeded demo accounts. Production deployment is **not ready**: the Prisma schema still uses SQLite, while Vercel requires a persistent external database. Do not deploy the current production environment template until the schema and database migration are completed.

## 📦 Project Structure

```
tuiton/
├── apps/
│   ├── web/        # Next.js web application
│   └── mobile/     # React Native mobile app (Expo)
├── packages/
│   ├── shared/     # Shared types and constants
│   └── db/         # Prisma schema and database utils
├── tests/          # Playwright tests
└── prisma/         # Database migrations
```

## 🛠️ Development

### Prerequisites
- Node.js >= 20
- npm >= 10
- PostgreSQL (for production)

### Setup

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env

# Update DATABASE_URL for SQLite (dev) or PostgreSQL (prod)
# For SQLite: DATABASE_URL="file:./dev.db"

# Generate the Prisma client and prepare the local SQLite database
npm run db:generate
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Open `http://localhost:3000`. Local seed credentials are `shivani@tuiton.app` / `tuiton123` (admin) and `student@tuiton.app` / `tuiton123` (student). These demo passwords must never be used in a deployed environment.

### Database Seeding

The seed script creates:
- **Admin accounts**: Shivani Pal, Devendra Sharma
- **Demo student**: student@tuiton.app
- **Sample roadmaps**: Math, Science, AI Foundations, Python Coding, etc.
- **Challenges**: Daily, weekly, monthly exercises
- **Badges and certificates**

## 🚀 Production Deployment

### Environment Variables

Create `.env.production` with these variables:

```bash
# Database (PostgreSQL required for production)
DATABASE_URL="postgresql://user:password@localhost:5432/tuiton?schema=public"

# Authentication
AUTH_SECRET="<32-char-secret-from-crypto.randomBytes(32).toString('hex')>"
TUITON_ADMIN_PASSWORD="<unique password, at least 12 characters>"
TUITON_STUDENT_PASSWORD="<unique password, at least 12 characters>"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t tuiton .
docker run -p 3000:3000 -d tuiton
```

### Manual Deployment

```bash
# Install dependencies
npm ci --only=production

# Build
npm run build

# Run
npm run start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration

### Lessons
- `POST /api/lessons/[id]/complete` - Mark lesson complete
- `POST /api/lessons/[id]/quiz` - Submit quiz answers

### Live Classes
- `GET /api/live/[classId]` - Get class details
- `POST /api/live/[classId]/attend` - Mark attendance
- `GET /api/live/[classId]/chat` - Get chat messages

### Challenges
- `POST /api/challenges/[id]/submit` - Submit challenge solution

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Mobile**: React Native (Expo), TypeScript
- **Database**: Prisma ORM, PostgreSQL
- **Authentication**: JWT, Email OTP, Google OAuth
- **Real-time**: WebSockets (Jitsi for live classes)
- **Deployment**: Docker, Docker Compose

## 📚 Roadmap

See `ROADMAP.html` for the detailed build phases:
1. Foundation & access
2. Roadmaps & content
3. Live classes (Jitsi)
4. Challenges & gamification
5. Profile & portfolio
6. Polish, mobile, launch

## 👥 Contributors

- **Shivani Pal** - Host, Content Creator
- **Devendra Sharma** - Tech Track, DevOps

## 📜 License

© 2024 Tuiton Academy. All rights reserved.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
