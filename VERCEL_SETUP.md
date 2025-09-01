# Vercel Environment Variables Setup

To properly configure your Google OAuth in production, you need to set up environment variables in the Vercel dashboard.

## Required Environment Variables

Go to your Vercel project dashboard and add these environment variables:

### For Server (Backend)
- `GOOGLE_CLIENT_ID`: `YOUR_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`: `YOUR_GOOGLE_CLIENT_SECRET`
- `JWT_ACCESS_SECRET`: `5_00-0g/h_piqck_qquu_+s0re3tc0de6:f`
- `JWT_REFRESH_SECRET`: `f_00-0g/h_piqck_qquu_+s0re3tc0de6:s`
- `DATABASE_URL`: (your production database URL)
- `DIRECT_URL`: (your production database direct URL)

### For Client (Frontend)
- `VITE_GOOGLE_CLIENT_ID`: `YOUR_GOOGLE_CLIENT_ID`
- `VITE_API_URL`: `https://doctrack-phnt.vercel.app`

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (doctrack)
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set them for "Production", "Preview", and "Development" environments
6. Redeploy your application

## Alternative: Using Vercel CLI

You can also use the Vercel CLI to set environment variables:

```bash
vercel env add GOOGLE_CLIENT_ID production
vercel env add VITE_GOOGLE_CLIENT_ID production
# ... add all other variables
```

After adding all environment variables, redeploy your application for the changes to take effect.
