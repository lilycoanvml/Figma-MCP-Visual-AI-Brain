# Figma Plugin Proxy Server

This is a simple local proxy server that forwards requests from the Figma plugin to the Anthropic API. It's required because Figma plugins run in a sandboxed iframe with `origin: null`, which is blocked by Anthropic's CORS policy.

## Why is this needed?

- Figma plugin UI runs with origin `null` (data: URL)
- Anthropic API has strict CORS policy
- Direct API calls from the plugin are blocked
- This proxy accepts requests from the plugin and forwards them to Anthropic

## Setup

The dependencies are already installed. Just start the server:

```bash
npm start
```

The server will run on `http://localhost:3000`

## Usage

1. **Start the proxy server** (run this in a separate terminal):
   ```bash
   cd packages/proxy-server
   npm start
   ```

2. **Restart Figma Desktop completely** (Quit and reopen)
   - This is required for the `networkAccess` permissions to take effect

3. **Import the plugin** in Figma:
   - Menu → Plugins → Development → Import plugin from manifest
   - Select: `/packages/figma-plugin/manifest.json`

4. **Run the plugin** and use it normally
   - The plugin will now make requests to `localhost:3000`
   - The proxy forwards them to Anthropic

## How it works

```
Figma Plugin UI → http://localhost:3000/api/claude → Anthropic API
                  ↓
            Proxy adds CORS headers
                  ↓
Figma Plugin UI ← Response ← Anthropic API
```

## Security Note

- The proxy runs locally on your machine
- Your API key is sent from the plugin to the proxy to Anthropic
- Nothing is logged or stored
- The proxy simply forwards requests

## Endpoints

- `POST /api/claude` - Forwards requests to Anthropic's Messages API

## Troubleshooting

**"Failed to fetch"**
- Make sure the proxy server is running (`npm start`)
- Check that it shows "running on http://localhost:3000"

**CORS errors still appear**
- Fully quit and reopen Figma Desktop (not just reload the plugin)
- The `networkAccess` permissions require a full restart

**Connection refused**
- Verify the proxy is running on port 3000
- Check no other service is using port 3000
