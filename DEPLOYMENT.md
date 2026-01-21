# Alternative Deployment Guide

Your app is ready to deploy on **Railway** or **Render** - both are better alternatives to Vercel with no rate limits!

## Option 1: Railway (Recommended - Easiest)

Railway is the fastest and easiest option. It auto-detects your setup and deploys in minutes.

### Steps:

1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `dinequickly/geminihackathon`
6. **Railway will auto-detect** your frontend and backend
7. **Add Environment Variables**:
   - Click on each service (frontend/backend)
   - Add these variables:
     ```
     DATABASE_URL=your_supabase_url
     ELEVENLABS_API_KEY=your_key
     OPENAI_API_KEY=your_key
     SUPABASE_URL=your_url
     SUPABASE_ANON_KEY=your_key
     ```
8. **Click "Deploy"**

✅ That's it! Railway will give you URLs for both frontend and backend.

### Pricing:
- **$5 free credits/month** (plenty for your app)
- After credits: ~$5-10/month depending on usage

---

## Option 2: Render (Good Free Tier)

Render has a solid free tier and uses the `render.yaml` config I created.

### Steps:

1. **Go to Render**: https://render.com
2. **Sign up/Sign in**
3. **Click "New +"** → **"Blueprint"**
4. **Connect your GitHub**: `dinequickly/geminihackathon`
5. **Render will detect `render.yaml`** and auto-configure everything
6. **Add Environment Variables** in the Render dashboard:
   - Go to each service settings
   - Add the same env vars as above
7. **Click "Apply"**

✅ Render will deploy both services automatically!

### Pricing:
- **Frontend**: Free (static site)
- **Backend**: Free tier available (with limitations)
- Paid: $7/month for better performance

---

## Option 3: Netlify + Railway (Split Deployment)

If you want the fastest frontend:

1. **Deploy Frontend to Netlify**:
   ```bash
   npm install -g netlify-cli
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

2. **Deploy Backend to Railway** (follow Railway steps above, just backend)

3. **Update Frontend API URL** to point to Railway backend

---

## Quick Deploy Instructions

I've created config files for you:
- ✅ `railway.json` - Railway configuration
- ✅ `render.yaml` - Render Blueprint configuration

### For Railway:
Just connect your GitHub repo and Railway does the rest!

### For Render:
Connect repo → Render auto-detects the blueprint → Add env vars → Deploy!

---

## Recommended Choice

**Go with Railway** - it's:
- ✅ Fastest to set up
- ✅ Auto-detects everything
- ✅ Great developer experience
- ✅ No rate limits
- ✅ $5 free credits (renewable monthly)

---

## After Deployment

Once deployed, you'll get URLs like:
- Frontend: `https://your-app.up.railway.app`
- Backend: `https://your-backend.up.railway.app`

Update your frontend API calls to use the new backend URL!

---

## Need Help?

Let me know which platform you choose and I can help you through any issues!
