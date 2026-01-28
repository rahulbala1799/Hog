# Neon Auth Setup Guide

This guide explains how to connect your Next.js app to Neon Auth (managed Better Auth service).

## What is Neon Auth?

Neon Auth is a managed authentication service powered by Better Auth. It handles:
- User sign-up and login
- Session management
- Password hashing
- JWT token management
- All authentication endpoints

## Configuration Steps

### 1. Environment Variables

Make sure you have these environment variables set in Vercel:

#### Required:
- `NEXT_PUBLIC_NEON_AUTH_URL` - Your Neon Auth URL
  ```
  https://ep-muddy-lab-ab2r84jh.neonauth.eu-west-2.aws.neon.tech/neondb/auth
  ```

- `NEON_AUTH_BASE_URL` - Same as above (for server-side)
  ```
  https://ep-muddy-lab-ab2r84jh.neonauth.eu-west-2.aws.neon.tech/neondb/auth
  ```

#### Database (already set):
- `DATABASE_URL` - Your Neon Postgres connection string
- Other PostgreSQL connection variables

### 2. Add Trusted Domain in Neon Auth Dashboard

**IMPORTANT**: You must add your Vercel domain to Neon Auth's trusted domains:

1. Go to your Neon Auth dashboard
2. Navigate to **Configuration** → **Domains**
3. Click **Add new domain**
4. Add: `https://hog-iota.vercel.app`
5. Save

This allows Neon Auth to redirect back to your app after authentication.

### 3. How It Works

#### Client-Side (Frontend)
- The login form uses `signIn.email()` from `@/lib/auth/client`
- The client makes requests directly to your Neon Auth URL
- No local API route needed for client requests

#### Server-Side
- We keep a local Better Auth instance for server-side session checks
- The API route at `/api/auth/[...all]` is kept for compatibility
- Server-side auth instance points to Neon Auth as the base URL

### 4. Testing

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Test login**:
   - Go to `http://localhost:3000`
   - Use your Neon Auth credentials:
     - Email: `rahulbala1799@gmail.com`
     - Password: (the password you set in Neon Auth)

3. **Verify redirect**:
   - After successful login, you should be redirected to `/dashboard`
   - The session should be stored in cookies

### 5. Production Deployment

1. **Set environment variables in Vercel**:
   - `NEXT_PUBLIC_NEON_AUTH_URL` (Production, Preview, Development)
   - `NEON_AUTH_BASE_URL` (Production, Preview, Development)

2. **Add domain to Neon Auth**:
   - Add `https://hog-iota.vercel.app` to trusted domains

3. **Deploy**:
   - Push to GitHub
   - Vercel will automatically deploy

### 6. Troubleshooting

#### Login not working?
- Check that `NEXT_PUBLIC_NEON_AUTH_URL` is set correctly
- Verify the domain is added to Neon Auth's trusted domains
- Check browser console for CORS errors
- Verify the user exists in Neon Auth dashboard

#### Session not persisting?
- Check that cookies are being set (browser DevTools → Application → Cookies)
- Verify the cookie domain matches your app domain
- Check that `better-auth.session_token` cookie is present

#### Redirect issues?
- Make sure your domain is in Neon Auth's trusted domains list
- Verify the redirect URL matches your app URL

### 7. Current User

You have a user already created in Neon Auth:
- **Email**: `rahulbala1799@gmail.com`
- **Password**: (set in Neon Auth dashboard)

To create more users:
- Use the Neon Auth dashboard
- Or use the admin interface (when built)

## Notes

- Neon Auth handles all authentication logic
- Your database is still used for storing user data (via Prisma)
- The local Better Auth instance is mainly for server-side session validation
- Client requests go directly to Neon Auth URL
