# Vercel Deployment Instructions

## Setting Up Environment Variables

Since `config.js` is in `.gitignore` and not deployed, you need to set up environment variables in Vercel and use the build script to generate the config file during deployment.

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   - **Name**: `SUPABASE_URL`
     **Value**: `https://tnfqzsobyonknccqgtds.supabase.co` (your Supabase project URL)
   
   - **Name**: `SUPABASE_ANON_KEY`
     **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnF6c29ieW9ua25jY3FndGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjEzNTEsImV4cCI6MjA4MzczNzM1MX0.vWmQqvAYLawgoeQ3pIV_1qs2EO3Lw0BKpXyi5ex1d_A` (your Supabase anon key)

4. Make sure these are set for **Production**, **Preview**, and **Development** environments
5. Click **Save**

### Step 2: Configure Build Settings

1. In your Vercel project, go to **Settings** → **Build & Development Settings**
2. Make sure the **Build Command** is set to: `npm run build`
3. The **Output Directory** should be: `.` (root directory)
4. Save the settings

### Step 3: Deploy

The build script (`build-config.js`) will automatically generate `config.js` from your environment variables during deployment. The generated file will contain your Supabase credentials and will be included in the deployment.

### Alternative: Manual Deployment

If you prefer not to use the build script, you can:

1. Create `config.js` locally with your credentials
2. Temporarily remove it from `.gitignore`
3. Commit and push the file
4. Add it back to `.gitignore` after deployment

**Note**: This is less secure as it exposes your keys in git history, but the anon key is designed to be public-facing anyway.

