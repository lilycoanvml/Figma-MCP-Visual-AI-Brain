// Shared types for Figma Visual Brain

export interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
}

export interface ColorInfo {
  r: number;
  g: number;
  b: number;
  a: number;
  hex?: string;
}

export interface TypographyInfo {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface BrandGuidelines {
  colors?: {
    primary?: string[];
    secondary?: string[];
    allowed?: string[];
  };
  typography?: {
    allowedFonts?: string[];
    minFontSize?: number;
    maxFontSize?: number;
  };
  spacing?: {
    baseUnit?: number;
    allowedMultiples?: number[];
  };
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: Violation[];
  score: number;
}

export interface Violation {
  type: 'color' | 'typography' | 'spacing' | 'component';
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  nodeName?: string;
  suggestion?: string;
}

export interface DesignFeedback {
  overall: string;
  positives: string[];
  improvements: string[];
  compliance?: ComplianceResult;
}
