# Visual Brain - AI-Powered Figma Plugin

> AI brand compliance assistant for Ford's Ready Set Ford (RSF) campaign

## Features

### 🤖 AI Chat Interface
- **Claude 3.5 Sonnet Vision** (Anthropic) for comprehensive design analysis
- Ask open-ended questions about your designs
- Get contextual feedback based on selected elements
- Conversational Q&A about RSF brand guidelines

### 🎨 Comprehensive Design Extraction
The plugin automatically extracts from selected elements:
- **Colors**: All fills, strokes, and text colors with usage counts
- **Typography**: Font families, sizes, weights, line height, letter spacing
- **Layout**: Dimensions, positioning, auto-layout properties
- **Components**: Component instances and variants
- **Images**: Image fills with metadata
- **Structure**: Complete element hierarchy
- **Spacing**: Padding, item spacing, corner radius

### 📸 Visual Analysis
- Exports selected elements as high-res images
- Sends images to Claude 3.5 Sonnet Vision for visual compliance checking
- Analyzes imagery style, tone, composition
- Checks photography against RSF guidelines (customer-centric, action-oriented, high-impact)

### ✅ Brand Compliance Checking
Validates designs against Ford RSF brand guidelines:
- **Colors**: Skyview Blue (#066FEF), Off Black (#0F0F0F), White (#FFFFFF)
- **Typography**: American Grotesk family (Compressed Black, Bold, Regular)
- **Spacing**: 8px grid system compliance
- **Layout**: Lockup sizing, margins, gutters
- **Imagery**: Style, tone, and emotional impact
- **Tone of Voice**: Inspiring, determined, impassioned (not aggro or braggy)

## Installation

### 1. Start the Proxy Server (Required)

Due to Figma's CORS restrictions, you need to run a local proxy server:

```bash
cd packages/proxy-server
npm install
npm start
```

Keep this running in a separate terminal. The proxy forwards requests from the plugin to Anthropic.

### 2. Build the Plugin

```bash
cd packages/figma-plugin
npm install
npm run build
```

### 3. Import into Figma

- **Fully quit and reopen Figma Desktop** (required for network permissions)
- Menu → Plugins → Development → Import plugin from manifest
- Select `packages/figma-plugin/manifest.json`

### 4. Get a Claude API Key

- Go to [https://console.anthropic.com/](https://console.anthropic.com/)
- Create a new API key
- Copy it for use in the plugin

## Usage

### Setup

1. **Run the plugin**: Menu → Plugins → Development → Visual Brain
2. **Enter your Claude API key** in the settings panel at the top
3. **Select elements** in your Figma design

### Quick Actions

The plugin provides 4 quick action buttons:

- **🔍 Full Analysis**: Complete brand compliance check (colors, typography, layout, spacing, imagery, tone)
- **🎨 Check Colors**: Verify brand palette compliance
- **📝 Check Typography**: Validate American Grotesk usage and hierarchy
- **📐 Check Layout**: Check 8px grid and spacing

### Chat Interface

Ask any questions about your design:

```
"Are these colors RSF-compliant?"
"Is my typography hierarchy correct?"
"Does this layout follow the brand guidelines?"
"What's wrong with the spacing in this frame?"
"Is this image appropriate for RSF?"
"Give me a full compliance score for this design"
```

The AI assistant will:
- Analyze the selected element(s)
- Extract all design properties
- Export visual snapshots
- Compare against RSF guidelines
- Provide specific, actionable feedback
- Give compliance scores when requested

### Advanced Features

**Contextual Awareness**: The AI knows what elements you've selected and can reference them specifically.

**Visual Analysis**: When images are present, Claude 3.5 Sonnet Vision analyzes:
- Image composition and framing
- Subject matter and focus
- Emotional tone and energy
- Alignment with RSF photography principles

**Conversation Memory**: The plugin remembers the last 20 messages, so you can have multi-turn conversations.

**Auto-extraction**: Design data is automatically extracted when you change your selection.

## What Gets Analyzed

### Element Data
```json
{
  "selection": [...],           // Selected element names/types
  "colors": [...],             // All colors with usage counts
  "typography": [...],         // All text styles
  "layout": [...],            // Dimensions, positioning
  "components": [...],        // Components used
  "images": [...],           // Image fills
  "structure": [...],        // Element hierarchy
  "spacing": [...]          // Padding, gaps, radii
}
```

### Visual Data
- PNG export at 2x resolution
- Sent to Claude 3.5 Sonnet Vision for image analysis
- Used for photography and imagery compliance

## RSF Brand Guidelines Summary

The AI assistant is trained on the complete RSF brand guidelines including:

**Colors**:
- Skyview Blue: #066FEF
- Off Black: #0F0F0F
- White: #FFFFFF

**Typography**:
- American Grotesk Compressed Black (headlines)
- American Grotesk Bold (nameplates, CTAs)
- American Grotesk Regular (body copy, subheads)

**Spacing**:
- 8px base unit
- Multiples: 0.5x, 1x, 1.5x, 2x, 3x, 4x, 6x, 8x

**Lockups**:
- Horizontal: 65% layout width
- Vertical stacked: 75% layout width
- Always white on imagery

**Photography**:
- Customer-centric, not just vehicle-centric
- Action-oriented (9/10 should feel active)
- High-impact, extreme close-ups and wides
- Bold, rich, crisp, energetic

**Tone**:
- Inspiring, determined, impassioned
- Not aggro, braggy, or intimidating

## Tips

1. **Select specific elements** for focused analysis
2. **Use quick actions** for common checks
3. **Ask follow-up questions** to dive deeper
4. **Request compliance scores** for measurable results
5. **API costs**: Claude 3.5 Sonnet with vision is used (~$0.01-0.03 per analysis with image)

## Troubleshooting

**"Please enter your Claude API key"**
- Click "Show API Key" and enter your key
- Get one at [https://console.anthropic.com/](https://console.anthropic.com/)

**"Please select elements in Figma first"**
- Select at least one element in your Figma canvas
- The plugin auto-extracts data when selection changes

**API errors**
- Check your API key is valid
- Ensure you have Anthropic API credits
- Check network connection

**Slow responses**
- Claude 3.5 Sonnet with images takes 3-10 seconds
- Text-only queries are faster (1-3 seconds)

## Privacy & Data

- Your API key is stored locally in browser localStorage
- Design data is sent to Anthropic (Claude) for analysis
- No data is stored on external servers
- Images are exported temporarily for analysis

## Development

```bash
# Watch mode for development
npm run watch

# Rebuild
npm run build

# Bundle files
npm run bundle
```

## License

MIT
