// src/extractors/layoutExtractor.ts
export interface LayoutData {
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  constraints: any;
  layoutMode?: string;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  spacing?: number;
}

export class LayoutExtractor {
  extract(node: any): LayoutData | null {
    if (!node.absoluteBoundingBox) {
      return null;
    }

    const layout: LayoutData = {
      type: node.type,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
      x: node.absoluteBoundingBox.x,
      y: node.absoluteBoundingBox.y,
      constraints: node.constraints,
    };

    // Auto layout properties
    if (node.layoutMode) {
      layout.layoutMode = node.layoutMode;
    }

    if (node.paddingTop !== undefined) {
      layout.padding = {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0,
      };
    }

    if (node.itemSpacing !== undefined) {
      layout.spacing = node.itemSpacing;
    }

    return layout;
  }
}