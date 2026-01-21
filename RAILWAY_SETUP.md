# Railway Deployment Guide (Monorepo)

Your app has frontend and backend in separate folders. Railway needs you to deploy them as **2 separate services**.

## Step-by-Step Guide:

### 1. Create a New Project
1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Click **"Empty Project"** (give it a name like "InterviewPro")

### 2. Deploy Frontend Service

1. **Add the frontend service**:
   - In your project, click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose `dinequickly/geminihackathon`
   - Railway will create a service

2. **Configure Frontend Root Directory**:
   - Click on the service card
   - Go to **"Settings"** tab
   - Scroll to **"Service"** section
   - Find **"Root Directory"**
   - Enter: `frontend`
   - Click checkmark to save

3. **Add Frontend Environment Variables** (if needed):
   - Click **"Variables"** tab
   - Add any `VITE_` prefixed variables your frontend needs
   - Example: `VITE_API_URL=https://your-backend-url.railway.app`

4. **Deploy**: Railway will automatically detect `nixpacks.toml` and deploy!

### 3. Deploy Backend Service

1. **Add the backend service**:
   - In the same project, click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose `dinequickly/geminihackathon` again
   - Railway will create another service

2. **Configure Backend Root Directory**:
   - Click on the new service card
   - Go to **"Settings"** tab
   - Scroll to **"Service"** section
   - Find **"Root Directory"**
   - Enter: `backend`
   - Click checkmark to save

3. **Add Backend Environment Variables**:
   - Click **"Variables"** tab
   - Click **"Raw Editor"** button
   - Paste your environment variables:
     ```
     DATABASE_URL=postgresql://...your_supabase_connection_string
     SUPABASE_URL=https://xxxxx.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ELEVENLABS_API_KEY=sk_...
     OPENAI_API_KEY=sk-...
     NODE_ENV=production
     ```
   - Railway will auto-redeploy with these variables

4. **Get the Backend URL**:
   - Click on backend service
   - Go to **"Settings"** tab
   - Under **"Networking"** → Click **"Generate Domain"**
   - Copy this URL (you'll need it for frontend)

### 4. Update Frontend to Use Backend URL

1. **Update frontend environment variables**:
   - Go back to frontend service
   - Click **"Variables"** tab
   - Add: `VITE_API_URL=https://your-backend-url.railway.app`
   - Frontend will redeploy automatically

2. **Get the Frontend URL**:
   - Click on frontend service
   - Go to **"Settings"** tab
   - Under **"Networking"** → Click **"Generate Domain"**
   - This is your live app URL! 🎉

## Troubleshooting

### "No start command found" error:
- Make sure you set the **Root Directory** correctly for each service
- Frontend: `frontend`
- Backend: `backend`

### "npm: command not found":
- Railway should auto-detect Node.js from package.json
- The `nixpacks.toml` files in each directory help with this

### Build failures:
- Check the build logs in Railway
- Make sure all dependencies are in package.json
- Check environment variables are set correctly

## After Deployment

You'll have 2 URLs:
- **Frontend**: `https://interviewpro-frontend.up.railway.app` (or similar)
- **Backend**: `https://interviewpro-backend.up.railway.app` (or similar)

## Cost
- **$5 free credits/month** (renewable)
- Typical usage: ~$3-8/month for both services
- No rate limits like Vercel!

---

**Important**: Both services must be in the SAME Railway project so they can communicate with each other!
