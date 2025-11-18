# Deploy to Render - Quick Guide

**Render Free Tier:** 750 hours/month, automatic HTTPS, easy setup

## Step 1: Deploy to Render

**✨ Good news!** Your project includes a `render.yaml` file, so deployment is automatic!

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Deploy from Repository**
   - Click "New +" → "Blueprint"
   - Connect your GitHub account if not already connected
   - Select your `figma-visual-brain` repository
   - Render will automatically detect the `render.yaml` file

3. **Confirm Settings**
   - Review the auto-detected settings:
     - Service Name: `figma-visual-brain-proxy`
     - Region: `oregon` (you can change this)
     - Plan: `free`
   - Click "Apply"

4. **Deploy**
   - Render will automatically deploy using the configuration
   - Wait 2-3 minutes for deployment to complete

5. **Get Your URL**
   - Once deployed, you'll see your service URL at the top
   - Format: `https://figma-visual-brain-proxy.onrender.com`
   - **Copy this URL** - you'll need it next

### Manual Setup (if you prefer)

If you want to set it up manually instead of using the Blueprint:

1. Click "New +" → "Web Service"
2. Select your repository
3. Configure:
   - **Root Directory:** `packages/proxy-server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

## Step 2: Update Your Plugin

1. **Update manifest.json**

   Open `packages/figma-plugin/manifest.json` and update:

   ```json
   {
     "networkAccess": {
       "allowedDomains": ["https://your-service.onrender.com"],
       "devAllowedDomains": ["http://localhost:3000"]
     }
   }
   ```

   Replace with your actual Render URL.

2. **Rebuild the plugin**

   ```bash
   npm run build:plugin
   ```

3. **Reload plugin in Figma**
   - Close and reopen the plugin in Figma

## Step 3: Configure Plugin Settings

In the Figma plugin:

1. Open settings (click "Hide" to expand)
2. **Claude API Key:** Enter your Anthropic API key
3. **Proxy Server URL:** Enter your Render URL (e.g., `https://your-service.onrender.com`)

Done! The plugin should now work.

## Important Notes

### Free Tier Limitations
- **750 hours/month** (31 days × 24 hours = 744 hours, so basically always-on)
- Services spin down after 15 minutes of inactivity
- **Cold starts:** First request after spin-down takes 30-60 seconds
- No timeout limits on requests ✓

### Cold Start Handling
Users might experience slow first requests. To minimize:
- Use the plugin regularly (keeps it warm)
- Consider upgrading to paid plan ($7/month) to eliminate cold starts
- Or accept the trade-off for free hosting

### Monitoring
- View logs: Render Dashboard → Your Service → Logs
- Check deployments: Dashboard → Deployments tab
- Monitor usage: Dashboard → Metrics tab

## Troubleshooting

**Service won't start:**
- Check logs in Render dashboard
- Verify `packages/proxy-server` has `package.json` with `start` script
- Ensure Node.js version compatibility (v18+ recommended)

**Plugin can't connect:**
- Verify Render service is running (not suspended)
- Check proxy URL is correct in plugin settings
- Check manifest.json has correct allowedDomains
- Test URL directly: `https://your-service.onrender.com/api/claude` (should return 400 or CORS error, not 404)

**Slow responses:**
- Cold start after inactivity (normal on free tier)
- First request warms up the service
- Subsequent requests will be fast

**Build fails:**
- Check Node.js version in Render settings
- Verify all dependencies are in package.json
- Check build logs for specific errors

## Upgrading (Optional)

If you need better performance:

**Render Starter Plan ($7/month):**
- No cold starts (always-on)
- Faster response times
- More memory and CPU

To upgrade:
1. Go to your service settings
2. Click "Upgrade Plan"
3. Select "Starter"

## Alternative: Keep It Running (Free Tier Hack)

To avoid cold starts on free tier, you can ping your service every 10 minutes:

Use a free service like **UptimeRobot** or **cron-job.org** to ping your Render URL every 10 minutes. This keeps it warm.

**Note:** This uses more of your 750 hours but keeps responses fast.

---

**That's it!** Your proxy is now deployed on Render and your plugin is ready to share.

## Quick Reference

**Your Render URL:** `https://your-service.onrender.com`
**Update in:**
- `packages/figma-plugin/manifest.json` → `allowedDomains`
- Plugin settings → "Proxy Server URL"

**Need help?** Check Render logs or test the URL directly in your browser.
