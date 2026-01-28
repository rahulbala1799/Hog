# Art Business Management App

A full-stack art business management application built with Next.js 14+, Prisma, NextAuth.js v5, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure email/password authentication with NextAuth.js v5
- 👥 **Role-Based Access Control**: Admin and Staff roles with protected routes
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🚀 **Production Ready**: Optimized for Vercel deployment

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon Postgres
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (Strict mode)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ installed
- A Neon Postgres database (or any PostgreSQL database)
- npm or yarn package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key-here"
```

**Important**: Generate a secure `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

### 4. Database Setup

Push the Prisma schema to your database:

```bash
npm run db:push
```

Or create a migration:

```bash
npm run db:migrate
```

### 5. Seed the Database

Create initial admin and staff users:

```bash
npm run db:seed
```

This creates:
- **Admin User**: 
  - Email: `admin@example.com`
  - Password: `admin123`
- **Staff User**: 
  - Email: `staff@example.com`
  - Password: `staff123`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)
    /login
      page.tsx          # Login page
  /admin
    /dashboard
      page.tsx          # Admin dashboard
  /staff
    /dashboard
      page.tsx          # Staff dashboard
  /api
    /auth
      /[...nextauth]
        route.ts        # NextAuth API routes
/components
  /ui                  # Reusable UI components
/lib
  /auth.ts             # NextAuth configuration
  /db.ts               # Prisma client
/prisma
  schema.prisma        # Database schema
  seed.ts              # Database seed script
/middleware.ts         # Route protection middleware
```

## Authentication Flow

1. Users visit `/login` and enter their credentials
2. NextAuth.js validates credentials against the database
3. Upon successful login:
   - **Admin users** → Redirected to `/admin/dashboard`
   - **Staff users** → Redirected to `/staff/dashboard`
4. Middleware protects routes based on user roles
5. Unauthorized access attempts redirect to login

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     // ADMIN or STAFF
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `NEXTAUTH_SECRET`
4. Deploy!

Vercel will automatically:
- Run `prisma generate` during build
- Deploy your application
- Handle database migrations (run `db:push` or `db:migrate` manually if needed)

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens include user role for authorization
- Routes are protected by middleware
- Session tokens expire after 30 days
- Use strong `NEXTAUTH_SECRET` in production

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your database allows connections from your IP
- Check SSL mode requirements for Neon Postgres

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Build Errors

- Run `npm run db:push` to ensure Prisma client is generated
- Check that all environment variables are set
- Verify TypeScript types are correct

## Next Steps

- Add more features to admin and staff dashboards
- Implement additional user management features
- Add more database models as needed
- Enhance UI with more components
- Add error boundaries and better error handling

## License

MIT
