# Complete Vercel Deployment Guide for SR Silks

## ✅ Your Environment Variables (Save These!)

Use these exact values when setting up Vercel:

```
DATABASE_URL=postgresql://neondb_owner:npg_CX7doQUuVpK8@ep-patient-art-ahbpk2xg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=MkI5WcJ7Xv0oUbnR32BZ6edYr9KQOPjHl1aT4AGsytmDzxgfSpEuhqFwLiV8NC

JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=dqcxekzxn

CLOUDINARY_API_KEY=266427591733887

CLOUDINARY_API_SECRET=gNiiGYM8C6X273uLqaN3pEC4cDA
```

## Step-by-Step Vercel Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

#### Step 1: Sign Up / Login to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended since your code is on GitHub)
4. Authorize Vercel to access your GitHub account

#### Step 2: Import Your Project
1. After logging in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find **"RishiVykunta/SR-silks"** and click **"Import"**

#### Step 3: Configure Project Settings
1. **Project Name**: Keep default `sr-silks` or change it
2. **Framework Preset**: Vercel will auto-detect (should show "Other" or "Vercel")
3. **Root Directory**: Leave as `./` (root)
4. **Build Command**: Leave empty (handled by vercel.json)
5. **Output Directory**: Leave empty (handled by vercel.json)
6. **Install Command**: Leave as `npm install`

#### Step 4: Add Environment Variables
**IMPORTANT**: Add these BEFORE clicking "Deploy"

Click **"Environment Variables"** section and add each one:

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_CX7doQUuVpK8@ep-patient-art-ahbpk2xg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - Environments: ✅ Production ✅ Preview ✅ Development

2. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `MkI5WcJ7Xv0oUbnR32BZ6edYr9KQOPjHl1aT4AGsytmDzxgfSpEuhqFwLiV8NC`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **JWT_EXPIRES_IN**
   - Key: `JWT_EXPIRES_IN`
   - Value: `7d`
   - Environments: ✅ Production ✅ Preview ✅ Development

4. **CLOUDINARY_CLOUD_NAME**
   - Key: `CLOUDINARY_CLOUD_NAME`
   - Value: `dqcxekzxn`
   - Environments: ✅ Production ✅ Preview ✅ Development

5. **CLOUDINARY_API_KEY**
   - Key: `CLOUDINARY_API_KEY`
   - Value: `266427591733887`
   - Environments: ✅ Production ✅ Preview ✅ Development

6. **CLOUDINARY_API_SECRET**
   - Key: `CLOUDINARY_API_SECRET`
   - Value: `gNiiGYM8C6X273uLqaN3pEC4cDA`
   - Environments: ✅ Production ✅ Preview ✅ Development

#### Step 5: Deploy
1. Click **"Deploy"** button at the bottom
2. Wait for the build to complete (usually 2-5 minutes)
3. You'll see build logs in real-time
4. Once complete, you'll get a deployment URL like: `https://sr-silks.vercel.app`

#### Step 6: Initialize Database
1. After deployment completes, visit: `https://your-app.vercel.app/api/init-db`
2. You should see a success message with database initialization details
3. This creates all tables and sets up the default admin account

#### Step 7: Verify Deployment
1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
   - Should show: `"status": "OK"` and `"database": { "connected": true }`

2. **Admin Login**: Visit `https://your-app.vercel.app/admin`
   - Email: `srsilks@gmail.com`
   - Password: `admin123`
   - **⚠️ Change password immediately after first login!**

3. **Frontend**: Visit `https://your-app.vercel.app`
   - Should load the homepage

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```
- This will open a browser for authentication
- Choose "Continue with GitHub"

#### Step 3: Navigate to Project
```bash
cd "c:\Users\Mayur\OneDrive\Desktop\SR Silks\SR-silks"
```

#### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Type `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → Type `N` (first time)
- **What's your project's name?** → Type `sr-silks` or press Enter
- **In which directory is your code located?** → Press Enter (current directory)

#### Step 5: Set Environment Variables in Dashboard
After first deployment, you MUST set environment variables:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add all 6 environment variables (see Method 1, Step 4)
5. Make sure to select all environments (Production, Preview, Development)

#### Step 6: Redeploy with Environment Variables
```bash
vercel --prod
```

Or trigger redeploy from dashboard:
- Go to **Deployments** tab
- Click three dots (⋯) on latest deployment
- Click **Redeploy**

#### Step 7: Initialize Database
Visit: `https://your-app.vercel.app/api/init-db`

---

## Post-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database initialized via `/api/init-db`
- [ ] Health check shows database connected
- [ ] Admin login works
- [ ] Frontend loads correctly
- [ ] Changed default admin password
- [ ] Tested product creation
- [ ] Tested image upload

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure Node.js version is >=18.x
- Verify all dependencies are in `package.json`

### Database Connection Fails
- Verify `DATABASE_URL` is correct in Vercel
- Check Neon dashboard - database might be paused (click "Resume")
- Ensure connection string includes `?sslmode=require`

### Environment Variables Not Working
- Make sure variables are added for ALL environments
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### API Returns 500 Errors
- Check function logs in Vercel dashboard
- Verify database is initialized
- Check all environment variables are set

## Your Deployment URLs

After deployment, you'll have:
- **Production**: `https://sr-silks.vercel.app` (or your custom domain)
- **Preview**: `https://sr-silks-{hash}.vercel.app` (for each commit)

## Next Steps

1. ✅ Initialize database: `/api/init-db`
2. ✅ Change admin password
3. ✅ Add your first products
4. ✅ Configure custom domain (optional)
5. ✅ Test all features

---

**Need Help?** Check Vercel dashboard logs or contact support.
