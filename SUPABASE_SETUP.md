# Supabase Setup Guide for MacroTrack

## Prerequisites

You've been migrated from Manus OAuth to Supabase Auth! This guide will help you set up Supabase.

## Setup Steps

### 1. Create a Superman project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: MacroTrack (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Wait for the project to be created (~2 minutes)

### 2. Get your credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API Key** (anon/public): `eyJhbGc...` (long string)

3. Go to **Project Settings** → **Database** → **Connection string**
   - Select **Transaction** mode (for local development)
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password

### 3. Update your .env file

Open `/Users/SG3801/Documents/MacroApp/Macros/.env` and update:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

### 4. Generate a JWT Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env`:

```bash
JWT_SECRET=the-generated-secret-here
```

### 5. Run database migrations

Once your `.env` is configured, run:

```bash
pnpm db:push
```

This will create all the necessary database tables.

### 6. Start the app

```bash
pnpm dev
```

## What Changed?

✅ **Removed**: Manus OAuth Portal integration  
✅ **Added**: Supabase Auth with email/password  
✅ **Updated**: Auth page now has working login/signup forms  
✅ **Database**: Now uses Supabase PostgreSQL  

## Testing

1. Go to `http://localhost:3000/auth`
2. Create an account with email/password
3. Login and start using the app!

## Troubleshooting

**Error: "Invalid Supabase URL"**
- Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in `.env`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correct
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Check that your Supabase project is running

**Auth not working**
- Clear your browser cookies/localStorage
- Make sure you're using the correct email/password
- Check browser console for errors
