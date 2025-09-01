# Google Cloud Console OAuth Configuration

## The Problem
The error you're seeing: `"The given origin is not allowed for the given client ID"` means your Google OAuth client is not configured to accept requests from your current domains.

## Required Setup in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project or create one if needed

2. **Navigate to APIs & Services > Credentials**
   - Click on your OAuth 2.0 Client ID: `946516765841-0ms5bko1bdo0q67geqh8llrqu44d31fh.apps.googleusercontent.com`

3. **Configure Authorized JavaScript Origins**
   Add these origins to the "Authorized JavaScript origins" section:
   
   **For Development:**
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if you use alternative port)
   - `http://127.0.0.1:5173`
   - `http://127.0.0.1:3000`

   **For Production:**
   - `https://doctrack-phnt.vercel.app`
   - `https://doctrack-phnt.vercel.app/` (with trailing slash)

4. **Configure Authorized Redirect URIs**
   Add these redirect URIs (if needed):
   - `https://doctrack-phnt.vercel.app/auth/callback`
   - `http://localhost:5173/auth/callback`

## Important Notes

1. **No trailing slashes in JavaScript origins** - Don't add trailing slashes to the JavaScript origins
2. **Case sensitive** - Make sure the URLs match exactly
3. **Protocol matters** - Use `http://` for localhost and `https://` for production
4. **Changes take time** - Google OAuth changes can take up to 5 minutes to propagate

## Testing Your Configuration

After making changes in Google Cloud Console:

1. Wait 5-10 minutes for changes to propagate
2. Clear your browser cache
3. Try the Google sign-in button again

## Common Issues

- **Still getting origin errors?** Double-check the exact URL in your browser address bar matches what's in Google Cloud Console
- **Button not appearing in production?** Make sure environment variables are set in Vercel
- **Works locally but not in production?** Verify the production domain is added to authorized origins
