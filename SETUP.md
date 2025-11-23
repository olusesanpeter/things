# CMS Setup Guide

This guide will help you set up the lightweight CMS for managing things.

## Prerequisites

1. A Vercel account
2. Upstash Redis database (via Vercel Marketplace - free tier available)
3. Vercel Blob Storage (free tier available)

## Setup Steps

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Configure Vercel Services

#### Redis (Database) - via Marketplace
1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Browse Storage**
3. In the Marketplace Database Providers section, click on **Redis** (or **Upstash**)
4. Click **Continue** and follow the setup wizard
5. Click **Connect Project** to link it to your Vercel project
6. This will automatically add the environment variable:
   - `REDIS_URL` (connection string for Redis)

**Note:** The code uses the `redis` package which works with any Redis provider via `REDIS_URL`.

#### Vercel Blob Storage (Images)
1. In your Vercel project dashboard
2. Navigate to **Storage** → **Browse Storage**
3. Click on **Blob** (Fast object storage)
4. Click **Continue** and follow the setup wizard
5. This will automatically add:
   - `BLOB_READ_WRITE_TOKEN`

### 3. Set Environment Variables

Create a `.env.local` file in the root directory:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Admin Password (change this!)
ADMIN_PASSWORD=your-secure-password-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Seed Initial Data (Optional)

If you want to migrate existing things from `lib/things.ts` to KV:

```bash
# After starting the dev server, make a POST request to:
curl -X POST http://localhost:3000/api/seed
```

Or visit `http://localhost:3000/api/seed` in your browser (though POST is preferred).

### 5. Run Development Server

```bash
npm run dev
```

### 6. Access Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. You'll be redirected to `/admin` where you can:
   - Add new things (title, status, image upload)
   - View all existing things
   - Delete things

## Production Deployment

### Vercel Environment Variables

Make sure to add all environment variables in Vercel Dashboard:
- Settings → Environment Variables

Required variables:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `ADMIN_PASSWORD`
- `REDIS_URL` (automatically added when you connect Redis via Marketplace)
- `BLOB_READ_WRITE_TOKEN` (automatically added when you create the Blob store)

### Deploy

```bash
# Push to your Git repository
git push

# Vercel will automatically deploy
```

## Usage

### Adding a New Thing

1. Log in at `/admin/login`
2. Fill out the form:
   - **Title**: Name of the thing
   - **Status**: Choose "like", "have", or "want"
   - **Image**: Upload an image file (max 5MB, images only)
3. Click "Add Thing"
4. The thing will appear on the main page immediately

### Deleting a Thing

1. Go to `/admin`
2. Find the thing in the list
3. Click "Delete"
4. Confirm deletion

## API Endpoints

- `GET /api/things` - Get all things (public)
- `POST /api/things` - Create a new thing (auth required)
- `DELETE /api/things?id=xxx` - Delete a thing (auth required)
- `POST /api/upload` - Upload an image (auth required)
- `POST /api/seed` - Seed initial data from `lib/things.ts` (one-time use)

## Troubleshooting

### Images not uploading
- Check that `BLOB_READ_WRITE_TOKEN` is set correctly
- Verify Blob Storage is created in Vercel dashboard

### Authentication not working
- Ensure `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your current URL
- Verify `ADMIN_PASSWORD` is correct

### Things not saving
- Verify Redis database is created via Marketplace and connected to your project
- Check that `REDIS_URL` environment variable is set
- Look at Vercel function logs for errors
- Ensure you selected Redis (not Postgres) in the Marketplace
- Make sure you clicked "Connect Project" after creating the Redis database

