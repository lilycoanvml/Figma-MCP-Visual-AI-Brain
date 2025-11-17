// src/extractors/colorExtractor.ts
export interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  usage: "fill" | "stroke" | "background";
  opacity: number;
}

export class ColorExtractor {
  extract(node: any): ColorData[] {
    const colors: ColorData[] = [];

    // Extract fills
    if (node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.type === "SOLID" && fill.visible !== false) {
          colors.push({
            hex: this.rgbToHex(fill.color),
            rgb: fill.color,
            usage: "fill",
            opacity: fill.opacity || 1,
          });
        }
      });
    }

    // Extract strokes
    if (node.strokes) {
      node.strokes.forEach((stroke: any) => {
        if (stroke.type === "SOLID" && stroke.visible !== false) {
          colors.push({
            hex: this.rgbToHex(stroke.color),
            rgb: stroke.color,
            usage: "stroke",
            opacity: stroke.opacity || 1,
          });
        }
      });
    }

    // Extract background
    if (node.backgroundColor) {
      colors.push({
        hex: this.rgbToHex(node.backgroundColor),
        rgb: node.backgroundColor,
        usage: "background",
        opacity: 1,
      });
    }

    return colors;
  }

  extractAll(node: any): ColorData[] {
    const colors: ColorData[] = [];

    const traverse = (n: any) => {
      colors.push(...this.extract(n));

      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return colors;
  }

  private rgbToHex(color: { r: number; g: number; b: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  }
}