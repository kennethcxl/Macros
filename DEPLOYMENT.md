# MacroTrack Deployment Guide

This guide explains how to deploy MacroTrack to Vercel with Supabase integration and OpenRouter AI features.

## Prerequisites

- GitHub account with the code pushed to `kennethcxl/Macros`
- Vercel account (free tier available at https://vercel.com)
- Supabase account (free tier available at https://supabase.com)
- OpenRouter account (free tier available at https://openrouter.ai)

## Step 1: Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Key** (anon key)
3. In your Supabase project:
   - Go to Settings → Database → Connection string
   - Copy the PostgreSQL connection string (use the "Pooling" version for serverless)
   - This will be your `DATABASE_URL`

## Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for and select `kennethcxl/Macros`
5. Configure the project:
   - **Framework Preset**: Other (already configured in vercel.json)
   - **Root Directory**: ./
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`

## Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Supabase |
| `JWT_SECRET` | Random secure string (min 32 chars) | Generate your own |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | OpenRouter dashboard |

### Optional Variables

| Variable | Value |
|----------|-------|
| `VITE_APP_TITLE` | MacroTrack (or your custom title) |
| `VITE_APP_LOGO` | URL to your logo |

## Step 4: Configure Supabase Integration (Optional)

Vercel has built-in Supabase integration:

1. In Vercel project settings, go to "Integrations"
2. Search for "Supabase" and connect your account
3. Select your Supabase project
4. Vercel will automatically inject `DATABASE_URL` and other Supabase variables

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `your-project.vercel.app`

## Step 6: Run Database Migrations

After deployment:

1. In your local environment, run:
   ```bash
   DATABASE_URL="your-supabase-connection-string" pnpm db:push
   ```

2. Or manually run the SQL migrations in Supabase SQL Editor:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the migration files from `drizzle/*.sql`

## Step 7: Configure OpenRouter API Keys for Users

Users can add their own OpenRouter API keys through the app:

1. After logging in, go to Settings → API Keys
2. Paste their OpenRouter API key
3. The key is stored securely and used for meal image analysis

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correct and includes the password
- Check that Supabase project is active and accessible
- Use the connection pooler version of the connection string for serverless

### Build Failures
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (18+ recommended)

### OpenRouter API Not Working
- Verify the API key is valid in OpenRouter dashboard
- Check that the user's OpenRouter account has sufficient credits
- Review API rate limits in OpenRouter settings

## Environment Variables Reference

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-random-string-min-32-chars
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
VITE_APP_TITLE=MacroTrack
VITE_APP_LOGO=/logo.svg
```

## Support

For issues with:
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs
- **OpenRouter**: https://openrouter.ai/docs
