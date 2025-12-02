# Google Cloud Deployment Guide - Figma Visual Brain Plugin

This guide will help you deploy the proxy server to Google Cloud Run.

## Prerequisites

- Google Cloud account (free tier available with $300 credit)
- Google Cloud CLI installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
- Your project code ready

## Step 1: Set Up Google Cloud Project

### 1.1 Create a New Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (replace PROJECT_ID with your desired ID)
gcloud projects create figma-visual-brain --name="Figma Visual Brain"

# Set as active project
gcloud config set project figma-visual-brain
```

### 1.2 Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com
```

### 1.3 Set Up Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to Billing → Link a billing account
4. Note: Free tier includes 2 million requests/month for Cloud Run

## Step 2: Deploy to Google Cloud Run

### Option A: Deploy Using gcloud CLI (Recommended)

```bash
# Navigate to proxy server directory
cd packages/proxy-server

# Deploy to Cloud Run (this will build and deploy automatically)
gcloud run deploy figma-proxy-server \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

# Wait for deployment to complete (2-5 minutes)
```

The command will output your service URL like:
```
Service [figma-proxy-server] revision [figma-proxy-server-00001] has been deployed and is serving 100 percent of traffic.
Service URL: https://figma-proxy-server-XXXXXXXX-uc.a.run.app
```

**Copy this URL** - you'll need it for your Figma plugin configuration.

### Option B: Deploy Using Cloud Build (Automated CI/CD)

If you want automatic deployments from GitHub:

```bash
# Navigate to proxy server directory
cd packages/proxy-server

# Submit build using cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml
```

Set up automatic builds from GitHub:
1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Connect Repository"
3. Select GitHub and authorize
4. Choose your repository
5. Create trigger with these settings:
   - Event: Push to branch
   - Branch: `main`
   - Build configuration: Cloud Build configuration file
   - File location: `packages/proxy-server/cloudbuild.yaml`

### Option C: Deploy Using Console

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click "Create Service"
3. Choose "Continuously deploy from a repository" or "Deploy one revision from source"
4. Select your source (GitHub repository)
5. Configure:
   - Region: us-central1
   - Authentication: Allow unauthenticated invocations
   - Container port: 8080
6. Click "Create"

## Step 3: Update Figma Plugin Configuration

### 3.1 Update manifest.json

```bash
# Navigate to plugin directory
cd packages/figma-plugin
```

Edit `manifest.json` and update `allowedDomains`:

```json
{
  "networkAccess": {
    "allowedDomains": [
      "https://figma-proxy-server-XXXXXXXX-uc.a.run.app"
    ],
    "devAllowedDomains": [
      "http://localhost:3000"
    ]
  }
}
```

Replace with your actual Cloud Run URL.

### 3.2 Rebuild the Plugin

```bash
# From project root
npm run build:plugin
```

## Step 4: Configure Environment Variables (Optional)

If you need environment variables:

```bash
gcloud run services update figma-proxy-server \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production"
```

## Step 5: Monitor and Manage

### View Logs

```bash
# View real-time logs
gcloud run services logs read figma-proxy-server \
  --region us-central1 \
  --follow

# Or view in console
# https://console.cloud.google.com/run/detail/us-central1/figma-proxy-server/logs
```

### Check Service Status

```bash
gcloud run services describe figma-proxy-server \
  --region us-central1
```

### Update Service

When you make code changes:

```bash
# Navigate to proxy server
cd packages/proxy-server

# Redeploy
gcloud run deploy figma-proxy-server \
  --source . \
  --region us-central1
```

## Pricing Estimates

**Google Cloud Run Pricing:**
- First 2 million requests/month: FREE
- First 360,000 GB-seconds/month: FREE
- After free tier: ~$0.40 per million requests

**For typical usage (10-50 users):**
- Cost: $0-5/month (usually stays in free tier)
- Plus Gemini API costs (paid by users with their keys)

## Troubleshooting

### Error: "build step 0 failed"

This was your original error. It's now fixed with the Dockerfile we created.

### Error: "Permission denied"

```bash
# Make sure you're authenticated
gcloud auth login

# Ensure proper permissions
gcloud projects add-iam-policy-binding figma-visual-brain \
  --member="user:YOUR_EMAIL@gmail.com" \
  --role="roles/owner"
```

### Error: "APIs not enabled"

```bash
# Enable all required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com
```

### Plugin can't connect to proxy

1. Verify Cloud Run service is deployed:
   ```bash
   gcloud run services list
   ```

2. Check if service allows unauthenticated requests:
   ```bash
   gcloud run services describe figma-proxy-server --region us-central1
   ```

   Look for `allowUnauthenticated: true`

3. Test the endpoint:
   ```bash
   curl https://YOUR-CLOUD-RUN-URL.run.app
   ```

4. Check CORS is working:
   ```bash
   curl -H "Origin: https://www.figma.com" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://YOUR-CLOUD-RUN-URL.run.app/api/claude
   ```

### Build fails with "not found" errors

Make sure all dependencies are in package.json:

```bash
cd packages/proxy-server
npm install
```

## Security Best Practices

### 1. Add Rate Limiting (Recommended)

Update server.js to add rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

Then redeploy.

### 2. Set Up Monitoring

```bash
# Create uptime check
gcloud monitoring uptime-configs create figma-proxy-check \
  --resource-type=uptime-url \
  --host=YOUR-CLOUD-RUN-URL.run.app \
  --path=/
```

### 3. Enable Cloud Armor (Optional)

For DDoS protection:
1. Go to [Cloud Armor](https://console.cloud.google.com/security/cloud-armor)
2. Create a security policy
3. Add rules for rate limiting and geo-restrictions

## Cost Optimization

### 1. Set Request Timeout

```bash
gcloud run services update figma-proxy-server \
  --region us-central1 \
  --timeout 30s
```

### 2. Set Memory Limits

```bash
gcloud run services update figma-proxy-server \
  --region us-central1 \
  --memory 256Mi
```

### 3. Set Concurrency

```bash
gcloud run services update figma-proxy-server \
  --region us-central1 \
  --concurrency 80
```

## Alternative: Cloud Run with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main
    paths:
      - 'packages/proxy-server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        run: |
          cd packages/proxy-server
          gcloud run deploy figma-proxy-server \
            --source . \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated
```

## Support

For issues:
1. Check Cloud Run logs: `gcloud run services logs read figma-proxy-server --region us-central1`
2. Verify Dockerfile builds locally: `docker build -t test .`
3. Test server locally: `npm start`

## Quick Reference

```bash
# Deploy
gcloud run deploy figma-proxy-server --source . --region us-central1

# View logs
gcloud run services logs read figma-proxy-server --region us-central1 --follow

# Get URL
gcloud run services describe figma-proxy-server --region us-central1 --format='value(status.url)'

# Delete service
gcloud run services delete figma-proxy-server --region us-central1
```

---

**Ready to deploy?** Start with Step 1 and follow through each step carefully.
