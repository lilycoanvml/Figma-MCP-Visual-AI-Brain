// Utility functions for brand compliance checking

/**
 * Convert RGB (0-1) to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert hex to RGB (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate color distance (simple Euclidean distance in RGB space)
 * Returns a value between 0 (identical) and ~441 (complete opposite)
 */
export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return Infinity;

  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Check if a color matches any brand color within tolerance
 * tolerance: typically 10-20 for similar colors, 5 for exact matches
 */
export function isColorInBrandPalette(
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

/**
 * Extract brand colors from RSF brand guidelines
 */
export function extractBrandColors(brandGuidelines: any): string[] {
  const colors: string[] = [];

  if (brandGuidelines.color?.palette) {
    const palette = brandGuidelines.color.palette;
    if (palette.skyviewBlue?.hex) colors.push(palette.skyviewBlue.hex);
    if (palette.offBlack?.hex) colors.push(palette.offBlack.hex);
    if (palette.white?.hex) colors.push(palette.white.hex);
  }

  return colors;
}

/**
 * Extract allowed fonts from brand guidelines
 */
export function extractBrandFonts(brandGuidelines: any): string[] {
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

/**
 * Check if font size follows 8px grid system
 */
export function isOnGrid(value: number, baseUnit: number = 8): boolean {
  return value % baseUnit === 0 || value % (baseUnit / 2) === 0;
}

/**
 * Get closest grid value
 */
export function getClosestGridValue(value: number, baseUnit: number = 8): number {
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

/**
 * Calculate compliance score based on violations
 */
export function calculateComplianceScore(violations: {severity: string}[]): number {
  if (violations.length === 0) return 100;

  // Weight violations by severity
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

/**
 * Normalize font family name for comparison
 */
export function normalizeFontName(fontName: string): string {
  return fontName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

/**
 * Check if font is in brand family
 */
export function isBrandFont(fontFamily: string, brandFonts: string[]): boolean {
  const normalized = normalizeFontName(fontFamily);
  return brandFonts.some(brandFont =>
    normalized.includes(normalizeFontName(brandFont)) ||
    normalizeFontName(brandFont).includes(normalized)
  );
}
