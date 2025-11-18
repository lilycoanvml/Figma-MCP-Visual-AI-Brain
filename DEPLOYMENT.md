# Deployment Guide - Figma Visual Brain Plugin

This guide will help you deploy the proxy server to Railway (free tier) so others can use your Figma plugin.

## Prerequisites

- GitHub account (to connect with Railway)
- Railway account (sign up at https://railway.app)
- Your code pushed to a GitHub repository

## Step 1: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Recommended)

1. **Sign up/Login to Railway**
   - Go to https://railway.app
   - Sign up or login with your GitHub account

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select your `figma-visual-brain` repository

3. **Configure the Deployment**
   - Railway will auto-detect your Node.js project
   - Set the root directory to: `packages/proxy-server`
   - Railway will automatically use the `start` script from package.json

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete (usually 1-2 minutes)

5. **Get Your Public URL**
   - Once deployed, go to Settings → Networking
   - Click "Generate Domain"
   - You'll get a URL like: `https://your-app-name.up.railway.app`
   - **Copy this URL** - you'll need it in the next steps

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to proxy server
cd packages/proxy-server

# Initialize and deploy
railway init
railway up
```

## Step 2: Update Your Plugin Configuration

### 2.1 Update manifest.json

1. Open `packages/figma-plugin/manifest.json`
2. Update the `allowedDomains` field with your Railway URL:

```json
{
  "networkAccess": {
    "allowedDomains": ["https://your-app-name.up.railway.app"],
    "devAllowedDomains": ["http://localhost:3000"]
  }
}
```

Replace `https://your-app-name.up.railway.app` with your actual Railway URL.

### 2.2 Rebuild the Plugin

```bash
npm run build:plugin
```

## Step 3: Configure the Plugin for Users

When someone installs your plugin, they need to:

1. **Open the plugin settings** (click "Hide" to expand if collapsed)
2. **Enter their Claude API Key**
   - Get one from https://console.anthropic.com
3. **Enter the Proxy Server URL**
   - Use your Railway URL: `https://your-app-name.up.railway.app`
   - Or `http://localhost:3000` if running locally

## Step 4: Publish Your Plugin

1. **In Figma Desktop:**
   - Go to Plugins → Development → Import plugin from manifest
   - Select `packages/figma-plugin/dist/manifest.json`
   - Test that everything works with your deployed proxy

2. **Publish to Figma Community:**
   - In Figma, go to Plugins → Development → Manage plugins
   - Find your plugin and click "Publish"
   - Choose "Private to [Your Organization]" for internal use
   - Fill in the required information
   - Submit for review

## Important Notes

### Security
- **Never commit API keys** to your repository
- The proxy server accepts any API key from the client
- Each user provides their own Anthropic API key
- Consider adding rate limiting in production

### Railway Free Tier Limits
- 500 hours/month execution time
- $5 credit/month
- Should be sufficient for small team usage
- Monitor usage at https://railway.app/dashboard

### Alternative Hosting Options

If you outgrow Railway's free tier or want alternatives:

- **Render**: https://render.com (free tier available)
- **Fly.io**: https://fly.io (generous free tier)
- **Vercel**: https://vercel.com (serverless, free tier)
- **AWS Lambda**: Via AWS Free Tier

## Troubleshooting

### Plugin can't connect to proxy
- Check that the proxy URL in plugin settings is correct
- Verify Railway deployment is running (check dashboard)
- Check browser console for CORS errors
- Ensure manifest.json has the correct allowedDomains

### Railway deployment fails
- Check that package.json has correct dependencies
- Verify PORT environment variable is used (already configured)
- Check Railway logs for specific errors

### API requests fail
- Verify the Claude API key is valid
- Check Railway logs for error messages
- Ensure you haven't exceeded Anthropic API rate limits

## Cost Estimation

**For 10 active users:**
- Railway: Free (under 500 hrs/month)
- Anthropic API: ~$20-50/month (depends on usage)
  - Each user pays for their own API usage with their key

**For 50+ users:**
- Consider paid Railway plan ($5/month)
- Or migrate to more scalable hosting (AWS, GCP)

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Figma plugin console
3. Verify all configuration steps above

---

**Ready to deploy?** Start with Step 1 above and follow through each step carefully.
