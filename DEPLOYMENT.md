# Vercel Deployment Guide

## Environment Variables Setup

Add the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_YzMuD8KTpx3Q@ep-muddy-lab-ab2r84jh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

2. **NEXTAUTH_URL**
   ```
   https://your-vercel-app.vercel.app
   ```
   Replace `your-vercel-app` with your actual Vercel deployment URL.

3. **NEXTAUTH_SECRET**
   ```
   QFX6N1eTqn6cvpiUDeVbfUnGZJp+GLIU0bPUgg5OVhI=
   ```
   Or generate a new one using: `openssl rand -base64 32`

### How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Click **Add New**
   - Enter the variable name (e.g., `DATABASE_URL`)
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

## Database Setup

The database schema has already been pushed to your Neon Postgres database. If you need to run migrations again:

```bash
npm run db:push
```

To seed the database with initial users (if needed):

```bash
npm run db:seed
```

## Test Credentials

After seeding, you can use these credentials to test the application:

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `admin123`

- **Staff User**:
  - Email: `staff@example.com`
  - Password: `staff123`

## Deployment Steps

1. **Push your code to GitHub** (already done ✅)

2. **Import project in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import your GitHub repository: `rahulbala1799/Hog`

3. **Configure Environment Variables** (see above)

4. **Deploy**:
   - Vercel will automatically detect Next.js
   - Build command: `npm run build` (default)
   - Output directory: `.next` (default)
   - Click **Deploy**

5. **Verify Deployment**:
   - Visit your deployment URL
   - Test login with the credentials above
   - Verify role-based routing works correctly

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set in Vercel
- Ensure SSL mode is set to `require` in the connection string
- Check that your Neon database allows connections from Vercel's IPs

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your Vercel deployment URL exactly
- Ensure `NEXTAUTH_SECRET` is set and is the same across all environments
- Clear browser cookies if experiencing session issues

### Build Failures

- Check that all environment variables are set
- Verify Prisma Client is generated (happens automatically during build)
- Check build logs in Vercel dashboard for specific errors

## Post-Deployment

After successful deployment:

1. Test the login flow
2. Verify admin and staff dashboards are accessible
3. Test role-based route protection
4. Update `NEXTAUTH_URL` if you change your domain

## Additional Neon Database URLs

If you need to use the unpooled connection for migrations or other operations:

```
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_YzMuD8KTpx3Q@ep-muddy-lab-ab2r84jh.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

Use the pooled connection (`DATABASE_URL`) for regular application use, and the unpooled connection for migrations if needed.
