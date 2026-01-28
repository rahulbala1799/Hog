# Environment Variables Setup for Vercel

## Required Environment Variables

You already have these database variables ✅:
- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL_NON_POOLING`
- And other PostgreSQL connection variables

## Additional Variables Needed for Better Auth

Add these to your Vercel project:

### 1. AUTH_URL (Required)
**For server-side Better Auth configuration**

```
AUTH_URL=https://your-vercel-app.vercel.app
```

Replace `your-vercel-app` with your actual Vercel deployment URL.

**OR** you can use:
```
VERCEL_URL=your-vercel-app.vercel.app
```

### 2. NEXT_PUBLIC_AUTH_URL (Required)
**For client-side Better Auth**

```
NEXT_PUBLIC_AUTH_URL=https://your-vercel-app.vercel.app
```

This must be the same as your `AUTH_URL` and must start with `https://` in production.

### 3. NEON_AUTH_BASE_URL (Optional - if using Neon Auth service)
**If you want to use Neon's managed auth service**

```
NEON_AUTH_BASE_URL=https://ep-muddy-lab-ab2r84jh.neonauth.eu-west-2.aws.neon.tech/neondb/auth
```

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Click **Add New**
   - Enter variable name (e.g., `AUTH_URL`)
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

## Quick Setup

After your first deployment, Vercel will provide you with a URL. Use that URL for:
- `AUTH_URL` = `https://your-app.vercel.app`
- `NEXT_PUBLIC_AUTH_URL` = `https://your-app.vercel.app`

## Notes

- `AUTH_URL` is used by the server-side Better Auth configuration
- `NEXT_PUBLIC_AUTH_URL` is used by the client-side React hooks
- Both should point to your Vercel deployment URL
- The `NEON_AUTH_BASE_URL` is only needed if you're using Neon's managed auth service (separate from Better Auth)
