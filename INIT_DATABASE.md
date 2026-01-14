# How to Initialize Database

## Current Issue
The `/api/init-db` endpoint is returning 405 or showing the website. This usually means:
1. The changes haven't been deployed yet, OR
2. Vercel needs to rebuild the functions

## Solution Steps

### Step 1: Verify Deployment
1. Go to your Vercel Dashboard
2. Check the latest deployment
3. Make sure it shows "Ready" status
4. If it's still building, wait for it to complete

### Step 2: Force a New Deployment
If the endpoint still doesn't work, trigger a new deployment:

**Option A: Via GitHub**
- Make a small change (add a space to README.md)
- Commit and push
- This will trigger a new Vercel deployment

**Option B: Via Vercel Dashboard**
- Go to Vercel Dashboard → Your Project
- Click "Redeploy" on the latest deployment

### Step 3: Test the Endpoint

After deployment, test with:

**Method 1: Browser (GET request)**
```
https://sr-silks.vercel.app/api/init-db
```
You should see JSON response, not the website footer.

**Method 2: Browser Console (POST request)**
```javascript
fetch('https://sr-silks.vercel.app/api/init-db', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(async response => {
  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
  try {
    const json = JSON.parse(text);
    alert('Success! Database initialized.');
    console.log(json);
  } catch (e) {
    alert('Check console - response: ' + text);
  }
})
.catch(error => {
  console.error('Error:', error);
  alert('Error: ' + error.message);
});
```

**Method 3: PowerShell**
```powershell
Invoke-WebRequest -Uri "https://sr-silks.vercel.app/api/init-db" -Method GET
```

### Step 4: Verify Initialization

After successful initialization, check:
```
https://sr-silks.vercel.app/api/health
```

Look for:
- `database.initialized: true`
- `database.connected: true`

### Step 5: Test Admin Login

After initialization, try logging in:
- Email: `srsilks@gmail.com`
- Password: `admin123`

## Troubleshooting

### If you still see 405:
1. Check Vercel Function Logs:
   - Vercel Dashboard → Your Project → Functions → Logs
   - Look for errors when calling `/api/init-db`

2. Check if other API endpoints work:
   - Try: `https://sr-silks.vercel.app/api/health`
   - If this also shows the website, there's a routing issue

3. Verify Environment Variables:
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure `DATABASE_URL` is set

### If you see the website footer:
- The API route isn't being recognized
- Try redeploying
- Check that `api/init-db.js` exists in your repository

### If initialization succeeds but login fails:
- Check that `JWT_SECRET` is set in Vercel environment variables
- Verify database tables were created (check `/api/health`)

## Alternative: Initialize via Neon Dashboard

If the API endpoint continues to fail, you can initialize the database directly in Neon:

1. Go to your Neon Dashboard
2. Open the SQL Editor
3. Run the SQL from `server/config/database.js` (the `initDatabase` function)
4. Or use the SQL script provided in the repository
