# Render Deployment Guide - PUP-SINAG

This guide explains how to deploy PUP-SINAG on Render.com with both backend and frontend on a single hosting provider.

## Architecture

```
Render.com (Single Server)
├── Backend: Node.js + Express (port 5000)
├── Frontend: React (served by Express from dist/)
├── Database: MySQL
└── Single domain: https://pup-sinag.onrender.com
```

## Prerequisites

- GitHub account with repo: https://github.com/galitsachinese/SINAG_PUP.git
- Render.com account (free)
- MySQL database (local or online)

## Step 1: Setup Render.com Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize the repository

## Step 2: Create New Web Service

1. In Render dashboard, click **New +** → **Web Service**
2. Select **galitsachinese/SINAG_PUP** repository
3. Configure settings:

| Field             | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Name**          | `pup-sinag`                                            |
| **Environment**   | `Node`                                                 |
| **Build Command** | `cd back-end && npm install && cd .. && npm run build` |
| **Start Command** | `cd back-end && npm start`                             |
| **Plan**          | Free (or Paid if needed)                               |

## Step 3: Environment Variables

Add these in Render dashboard under **Environment**:

```
JWT_SECRET=your-super-secret-key-here
MYSQL_HOST=your-database-host
MYSQL_PORT=3306
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=pup_sinag
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

## Step 4: Verify Code Changes

The following code changes are already made:

### ✅ back-end/app.js

- Added static file serving: `app.use(express.static(path.join(__dirname, '../dist')))`
- Added catch-all route for React Router

### ✅ vite.config.js

- Changed base from `/pup-sinag/` to `/`
- Frontend will be built and served from root

### ✅ build process

- `npm run build` creates React optimized build in `/dist`
- `npm start` (in back-end) starts Express server
- Express serves `/dist` files + API routes

## Step 5: Deploy

1. **Render auto-deploys** when you push to GitHub main branch
2. Wait for build to complete (3-5 minutes)
3. Your app is live at: `https://pup-sinag.onrender.com`

## Step 6: First-Time Checks

After deployment:

1. **Visit your URL**: https://pup-sinag.onrender.com
2. **Login**: Use your credentials
3. **Check console**: Open DevTools → Console for any errors
4. **API calls**: Should work without CORS issues (same domain!)
5. **File uploads**: Should work (`/uploads` endpoint)

## Database Setup

Your MySQL database needs to be accessible from Render:

### Option A: PlanetScale (Recommended - Free Tier)

1. Go to [planetscale.com](https://planetscale.com)
2. Create free MySQL database
3. Get connection string from "Connect" section
4. Use in Render environment variables

### Option B: Local MySQL with Port Forwarding

1. Use ngrok: `ngrok tcp 3306` to expose local MySQL
2. Use ngrok URL in Render environment

## Troubleshooting

### Build Fails

- Check: `npm run build` works locally first
- Ensure dist/ is not in .gitignore (it's created during build)

### White Screen / 404 on Page Reload

- ✅ Already fixed by catch-all route in app.js
- Express now serves index.html for all unknown routes

### API Calls Fail

- Check CORS is not blocking (shouldn't be, same domain)
- Verify MYSQL\_\* environment variables in Render
- Check logs: Render Dashboard → Service → Logs

### Database Connection Fails

- Verify MYSQL_HOST is publicly accessible
- Check firewall/security groups allow Render IPs
- Test connection string locally first

## Local Testing Before Deploy

Test production-like build locally:

```powershell
# Build frontend
npm run build

# Start backend (from back-end folder)
npm start

# Visit http://localhost:5000
```

## File Structure After Build

```
PUP_SINAG/
├── dist/                    (Created by npm run build)
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/
├── back-end/
│   ├── app.js              (Serves dist/ + API routes)
│   ├── package.json
│   └── ...
└── vite.config.js          (base: '/')
```

## Important Notes

- **Single server**: Both frontend and backend on same Render instance
- **No CORS issues**: Everything served from same domain
- **Database**: Must be MySQL (supports Render connection)
- **Uploads**: Files stored in back-end/uploads (persists on Render)

## Next Steps

1. Push these changes to GitHub
2. Create Render web service (steps 1-3 above)
3. Add environment variables (step 3)
4. Deploy and test!

---

**Questions?** Check Render docs: https://docs.render.com
