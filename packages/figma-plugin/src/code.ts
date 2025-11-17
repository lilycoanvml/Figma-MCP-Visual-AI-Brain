// Main Figma plugin code

// Local type definitions (duplicated from shared for plugin compatibility)
interface ColorInfo {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Violation {
  type: 'color' | 'typography' | 'spacing' | 'component';
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  nodeName?: string;
  suggestion?: string;
}

interface ComplianceResult {
  isCompliant: boolean;
  violations: Violation[];
  score: number;
}

// Show the plugin UI with larger size for chat
figma.showUI(__html__, { width: 500, height: 700 });

// Listen for selection changes and auto-extract data
figma.on('selectionchange', async () => {
  const designData = await extractFullDesignData();
  figma.ui.postMessage({ type: 'design-data-extracted', data: designData });

  const imageData = await exportSelectedAsImage();
  figma.ui.postMessage({ type: 'image-exported', data: imageData });
});

// Initial extraction on plugin load
(async () => {
  // Load saved API key
  const savedApiKey = await figma.clientStorage.getAsync('claude_api_key');
  if (savedApiKey) {
    figma.ui.postMessage({ type: 'api-key-loaded', apiKey: savedApiKey });
  }

  const designData = await extractFullDesignData();
  figma.ui.postMessage({ type: 'design-data-extracted', data: designData });

  const imageData = await exportSelectedAsImage();
  figma.ui.postMessage({ type: 'image-exported', data: imageData });
})();

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'save-api-key') {
    await figma.clientStorage.setAsync('claude_api_key', msg.apiKey);
  }

  if (msg.type === 'analyze-colors') {
    const colors = extractColorsFromSelection();
    figma.ui.postMessage({ type: 'colors-extracted', colors });
  }

  if (msg.type === 'analyze-typography') {
    const typography = extractTypographyFromSelection();
    figma.ui.postMessage({ type: 'typography-extracted', typography });
  }

  if (msg.type === 'check-compliance') {
    const result = await checkBrandCompliance(msg.guidelines);
    figma.ui.postMessage({ type: 'compliance-result', result });
  }

  if (msg.type === 'extract-full-design-data') {
    const designData = await extractFullDesignData();
    figma.ui.postMessage({ type: 'design-data-extracted', data: designData });
  }

  if (msg.type === 'export-selected-image') {
    const imageData = await exportSelectedAsImage();
    figma.ui.postMessage({ type: 'image-exported', data: imageData });
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Extract colors from selected nodes
function extractColorsFromSelection(): ColorInfo[] {
  const colors: ColorInfo[] = [];
  const selection = figma.currentPage.selection;

  function extractFromNode(node: SceneNode) {
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          colors.push({
            r: fill.color.r,
            g: fill.color.g,
            b: fill.color.b,
            a: fill.opacity ?? 1,
          });
        }
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        extractFromNode(child);
      }
    }
  }

  for (const node of selection) {
    extractFromNode(node);
  }

  return colors;
}

// Extract typography from selected nodes
function extractTypographyFromSelection() {
  const typography: any[] = [];
  const selection = figma.currentPage.selection;

  function extractFromNode(node: SceneNode) {
    if (node.type === 'TEXT') {
      typography.push({
        fontFamily: typeof node.fontName !== 'symbol' ? node.fontName.family : 'Mixed',
        fontSize: typeof node.fontSize !== 'symbol' ? node.fontSize : 0,
        fontWeight: typeof node.fontName !== 'symbol' ? node.fontName.style : 'Mixed',
        lineHeight: typeof node.lineHeight !== 'symbol' ? node.lineHeight : undefined,
        letterSpacing: typeof node.letterSpacing !== 'symbol' ? node.letterSpacing : undefined,
      });
    }

    if ('children' in node) {
      for (const child of node.children) {
        extractFromNode(child);
      }
    }
  }

  for (const node of selection) {
    extractFromNode(node);
  }

  return typography;
}

// Check brand compliance
async function checkBrandCompliance(guidelines: any): Promise<ComplianceResult> {
  const violations: Violation[] = [];
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      isCompliant: false,
      violations: [{
        type: 'component',
        severity: 'error',
        message: 'No nodes selected for analysis',
      }],
      score: 0,
    };
  }

  // Extract brand colors from guidelines
  const brandColors = extractBrandColors(guidelines);
  const brandFonts = extractBrandFonts(guidelines);

  // Analyze each selected node
  for (const node of selection) {
    await analyzeNode(node, guidelines, brandColors, brandFonts, violations);
  }

  const score = calculateComplianceScore(violations);

  return {
    isCompliant: violations.length === 0,
    violations,
    score,
  };
}

async function analyzeNode(
  node: SceneNode,
  guidelines: any,
  brandColors: string[],
  brandFonts: string[],
  violations: Violation[]
) {
  // Check fills (colors)
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const colorHex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        const colorCheck = isColorInBrandPalette(colorHex, brandColors, 15);

        if (!colorCheck.matches) {
          violations.push({
            type: 'color',
            severity: 'warning',
            message: `Color ${colorHex} not in RSF brand palette`,
            nodeId: node.id,
            nodeName: node.name,
            suggestion: colorCheck.closestColor
              ? `Closest brand color: ${colorCheck.closestColor}`
              : 'Use Skyview Blue (#066FEF), Off Black (#0F0F0F), or White (#FFFFFF)'
          });
        }
      }
    }
  }

  // Check typography
  if (node.type === 'TEXT') {
    const fontSize = typeof node.fontSize !== 'symbol' ? node.fontSize : 0;
    const fontFamily = typeof node.fontName !== 'symbol' ? node.fontName.family : '';
    const fontStyle = typeof node.fontName !== 'symbol' ? node.fontName.style : '';

    // Check font family
    if (!isBrandFont(fontFamily, brandFonts)) {
      violations.push({
        type: 'typography',
        severity: 'error',
        message: `Font "${fontFamily}" is not American Grotesk`,
        nodeId: node.id,
        nodeName: node.name,
        suggestion: 'Use American Grotesk (Compressed Black for headlines, Bold for nameplates/CTAs, Regular for body)'
      });
    }

    // Check font size on grid (RSF uses 8px grid)
    const baseUnit = guidelines.spacing?.system?.baseUnit || 8;
    if (fontSize > 0 && !isOnGrid(fontSize, baseUnit)) {
      const closestGrid = getClosestGridValue(fontSize, baseUnit);
      violations.push({
        type: 'spacing',
        severity: 'info',
        message: `Font size ${fontSize}px not on ${baseUnit}px grid`,
        nodeId: node.id,
        nodeName: node.name,
        suggestion: `Consider using ${closestGrid}px`
      });
    }
  }

  // Check spacing/padding on frames and components
  if ('paddingLeft' in node || 'itemSpacing' in node) {
    const baseUnit = guidelines.spacing?.system?.baseUnit || 8;

    if ('paddingLeft' in node && typeof node.paddingLeft === 'number') {
      if (!isOnGrid(node.paddingLeft, baseUnit)) {
        violations.push({
          type: 'spacing',
          severity: 'info',
          message: `Padding ${node.paddingLeft}px not on ${baseUnit}px grid`,
          nodeId: node.id,
          nodeName: node.name,
          suggestion: `Use ${getClosestGridValue(node.paddingLeft, baseUnit)}px`
        });
      }
    }

    if ('itemSpacing' in node && typeof node.itemSpacing === 'number') {
      if (!isOnGrid(node.itemSpacing, baseUnit)) {
        violations.push({
          type: 'spacing',
          severity: 'info',
          message: `Item spacing ${node.itemSpacing}px not on ${baseUnit}px grid`,
          nodeId: node.id,
          nodeName: node.name,
          suggestion: `Use ${getClosestGridValue(node.itemSpacing, baseUnit)}px`
        });
      }
    }
  }

  // Recursively check children
  if ('children' in node) {
    for (const child of node.children) {
      await analyzeNode(child, guidelines, brandColors, brandFonts, violations);
    }
  }
}

// ===== Comprehensive Design Extraction =====

async function extractFullDesignData() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      error: 'No elements selected',
      message: 'Please select at least one element to analyze'
    };
  }

  const data = {
    selection: selection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type
    })),
    colors: extractAllColors(selection),
    typography: extractAllTypography(selection),
    layout: extractLayoutInfo(selection),
    components: extractComponentInfo(selection),
    images: extractImageInfo(selection),
    structure: extractStructure(selection),
    spacing: extractSpacingInfo(selection)
  };

  return data;
}

function extractAllColors(nodes: readonly SceneNode[]) {
  const colorSet = new Map<string, { hex: string; count: number; usage: string[] }>();

  function processNode(node: SceneNode) {
    // Fills
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
          const existing = colorSet.get(hex) || { hex, count: 0, usage: [] };
          existing.count++;
          if (!existing.usage.includes('fill')) existing.usage.push('fill');
          colorSet.set(hex, existing);
        }
      }
    }

    // Strokes
    if ('strokes' in node && Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        if (stroke.type === 'SOLID' && stroke.visible !== false) {
          const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
          const existing = colorSet.get(hex) || { hex, count: 0, usage: [] };
          existing.count++;
          if (!existing.usage.includes('stroke')) existing.usage.push('stroke');
          colorSet.set(hex, existing);
        }
      }
    }

    // Text colors
    if (node.type === 'TEXT' && 'fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID') {
          const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
          const existing = colorSet.get(hex) || { hex, count: 0, usage: [] };
          existing.count++;
          if (!existing.usage.includes('text')) existing.usage.push('text');
          colorSet.set(hex, existing);
        }
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }

  nodes.forEach(processNode);
  return Array.from(colorSet.values()).sort((a, b) => b.count - a.count);
}

function extractAllTypography(nodes: readonly SceneNode[]) {
  const typography: any[] = [];

  function processNode(node: SceneNode) {
    if (node.type === 'TEXT') {
      const fontName = typeof node.fontName !== 'symbol' ? node.fontName : null;
      const fontSize = typeof node.fontSize !== 'symbol' ? node.fontSize : null;

      typography.push({
        nodeName: node.name,
        nodeId: node.id,
        fontFamily: fontName ? fontName.family : 'Mixed',
        fontStyle: fontName ? fontName.style : 'Mixed',
        fontSize: fontSize || 'Mixed',
        lineHeight: typeof node.lineHeight !== 'symbol' ? node.lineHeight : 'Auto',
        letterSpacing: typeof node.letterSpacing !== 'symbol' ? node.letterSpacing : 0,
        textCase: node.textCase || 'ORIGINAL',
        textAlignHorizontal: node.textAlignHorizontal,
        characters: node.characters.substring(0, 100) // First 100 chars
      });
    }

    if ('children' in node) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }

  nodes.forEach(processNode);
  return typography;
}

function extractLayoutInfo(nodes: readonly SceneNode[]) {
  return nodes.map(node => {
    const layout: any = {
      name: node.name,
      type: node.type,
      width: 'width' in node ? node.width : null,
      height: 'height' in node ? node.height : null,
      x: 'x' in node ? node.x : null,
      y: 'y' in node ? node.y : null
    };

    if ('layoutMode' in node) {
      layout.layoutMode = node.layoutMode;
      layout.primaryAxisAlignItems = node.primaryAxisAlignItems;
      layout.counterAxisAlignItems = node.counterAxisAlignItems;
      layout.paddingLeft = node.paddingLeft;
      layout.paddingRight = node.paddingRight;
      layout.paddingTop = node.paddingTop;
      layout.paddingBottom = node.paddingBottom;
      layout.itemSpacing = node.itemSpacing;
    }

    return layout;
  });
}

function extractComponentInfo(nodes: readonly SceneNode[]) {
  const components: any[] = [];

  function processNode(node: SceneNode) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE') {
      components.push({
        name: node.name,
        type: node.type,
        id: node.id,
        description: 'description' in node ? node.description : null
      });
    }

    if ('children' in node) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }

  nodes.forEach(processNode);
  return components;
}

function extractImageInfo(nodes: readonly SceneNode[]) {
  const images: any[] = [];

  function processNode(node: SceneNode) {
    // Check for image fills
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'IMAGE') {
          images.push({
            nodeName: node.name,
            nodeId: node.id,
            nodeType: node.type,
            scaleMode: fill.scaleMode,
            imageHash: fill.imageHash
          });
        }
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }

  nodes.forEach(processNode);
  return images;
}

function extractStructure(nodes: readonly SceneNode[]) {
  function buildTree(node: SceneNode, depth: number = 0): any {
    const tree: any = {
      name: node.name,
      type: node.type,
      id: node.id,
      depth
    };

    if ('children' in node && node.children.length > 0) {
      tree.children = node.children.map(child => buildTree(child, depth + 1));
      tree.childCount = node.children.length;
    }

    return tree;
  }

  return nodes.map(node => buildTree(node));
}

function extractSpacingInfo(nodes: readonly SceneNode[]) {
  const spacing: any[] = [];

  function processNode(node: SceneNode) {
    const info: any = {
      name: node.name,
      type: node.type
    };

    if ('paddingLeft' in node) {
      info.padding = {
        left: node.paddingLeft,
        right: node.paddingRight,
        top: node.paddingTop,
        bottom: node.paddingBottom
      };
    }

    if ('itemSpacing' in node) {
      info.itemSpacing = node.itemSpacing;
    }

    if ('cornerRadius' in node && typeof node.cornerRadius !== 'symbol') {
      info.cornerRadius = node.cornerRadius;
    }

    // Only add if has spacing info
    if (Object.keys(info).length > 2) {
      spacing.push(info);
    }

    if ('children' in node) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }

  nodes.forEach(processNode);
  return spacing;
}

async function exportSelectedAsImage() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return { error: 'No selection' };
  }

  try {
    const node = selection[0];
    if (!('exportAsync' in node)) {
      return { error: 'Selected node cannot be exported as image' };
    }

    // Export as PNG
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }
    });

    // Convert to base64
    const base64 = figma.base64Encode(bytes);

    return {
      base64: `data:image/png;base64,${base64}`,
      width: 'width' in node ? node.width : 0,
      height: 'height' in node ? node.height : 0,
      name: node.name
    };
  } catch (error) {
    return { error: String(error) };
  }
}

// ===== Utility Functions =====

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return Infinity;

  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function isColorInBrandPalette(
  colorHex: string,
  brandColors: string[],
  tolerance: number = 15
): { matches: boolean; closestColor?: string; distance?: number } {
  let closestColor = '';
  let minDistance = Infinity;

  for (const brandColor of brandColors) {
    const distance = colorDistance(colorHex, brandColor);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = brandColor;
    }
  }

  return {
    matches: minDistance <= tolerance,
    closestColor,
    distance: minDistance
  };
}

function extractBrandColors(brandGuidelines: any): string[] {
  const colors: string[] = [];

  if (brandGuidelines.color?.palette) {
    const palette = brandGuidelines.color.palette;
    if (palette.skyviewBlue?.hex) colors.push(palette.skyviewBlue.hex);
    if (palette.offBlack?.hex) colors.push(palette.offBlack.hex);
    if (palette.white?.hex) colors.push(palette.white.hex);
  }

  return colors;
}

function extractBrandFonts(brandGuidelines: any): string[] {
  const fonts: string[] = [];

  if (brandGuidelines.typography?.primaryFont?.name) {
    fonts.push(brandGuidelines.typography.primaryFont.name);
  }

  // Add "American Grotesk" explicitly for RSF
  if (!fonts.includes('American Grotesk')) {
    fonts.push('American Grotesk');
  }

  return fonts;
}

function isOnGrid(value: number, baseUnit: number = 8): boolean {
  return value % baseUnit === 0 || value % (baseUnit / 2) === 0;
}

function getClosestGridValue(value: number, baseUnit: number = 8): number {
  const allowedMultiples = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
  let closest = baseUnit;
  let minDiff = Math.abs(value - baseUnit);

  for (const multiple of allowedMultiples) {
    const gridValue = baseUnit * multiple;
    const diff = Math.abs(value - gridValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = gridValue;
    }
  }

  return closest;
}

function calculateComplianceScore(violations: {severity: string}[]): number {
  if (violations.length === 0) return 100;

  let totalDeduction = 0;
  for (const violation of violations) {
    switch (violation.severity) {
      case 'error':
        totalDeduction += 15;
        break;
      case 'warning':
        totalDeduction += 8;
        break;
      case 'info':
        totalDeduction += 3;
        break;
    }
  }

  return Math.max(0, 100 - totalDeduction);
}

function normalizeFontName(fontName: string): string {
  return fontName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

function isBrandFont(fontFamily: string, brandFonts: string[]): boolean {
  const normalized = normalizeFontName(fontFamily);
  return brandFonts.some(brandFont =>
    normalized.includes(normalizeFontName(brandFont)) ||
    normalizeFontName(brandFont).includes(normalized)
  );
}
