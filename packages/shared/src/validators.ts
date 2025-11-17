import { z } from 'zod';

// Figma API validation schemas
export const FigmaFileKeySchema = z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid Figma file key');

export const FigmaNodeIdSchema = z.string().min(1, 'Node ID required');

export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).optional().default(1),
});

export const BrandGuidelinesSchema = z.object({
  colors: z.object({
    primary: z.array(z.string()).optional(),
    secondary: z.array(z.string()).optional(),
    allowed: z.array(z.string()).optional(),
  }).optional(),
  typography: z.object({
    allowedFonts: z.array(z.string()).optional(),
    minFontSize: z.number().optional(),
    maxFontSize: z.number().optional(),
  }).optional(),
  spacing: z.object({
    baseUnit: z.number().optional(),
    allowedMultiples: z.array(z.number()).optional(),
  }).optional(),
});

// Helper functions
export function isValidFigmaUrl(url: string): boolean {
  return /^https:\/\/(www\.)?figma\.com\/(file|design)\/[a-zA-Z0-9]+/.test(url);
}

export function extractFileKeyFromUrl(url: string): string | null {
  const match = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

export function extractNodeIdFromUrl(url: string): string | null {
  const match = url.match(/node-id=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
