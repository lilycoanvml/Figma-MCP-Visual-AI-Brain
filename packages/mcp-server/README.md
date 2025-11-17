# Figma Visual Brain - MCP Server

MCP server for Figma brand compliance analysis powered by Claude.

## Installation

```bash
npm install
npm run build
```

## Configuration

Create `.env` file:
```bash
FIGMA_ACCESS_TOKEN=your_figma_token_here
```

Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "figma-visual-brain": {
      "command": "node",
      "args": ["/path/to/packages/mcp-server/build/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Available Tools

- `download_figma_image` - Download images from Figma
- `get_figma_data` - Fetch design data
- `analyze_brand_compliance` - Check brand compliance
- `generate_design_feedback` - Get design feedback

## Development

```bash
npm run dev      # Run with tsx
npm run watch    # Watch mode
npm run build    # Production build
```
