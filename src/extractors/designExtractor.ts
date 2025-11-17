// src/extractors/designExtractor.ts
export interface DesignElement {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

export class DesignExtractor {
  extractElement(node: any): DesignElement {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      properties: this.extractProperties(node),
    };
  }

  private extractProperties(node: any): Record<string, any> {
    const properties: Record<string, any> = {};

    // Extract common properties
    if (node.absoluteBoundingBox) {
      properties.boundingBox = node.absoluteBoundingBox;
      properties.width = node.absoluteBoundingBox.width;
      properties.height = node.absoluteBoundingBox.height;
    }

    if (node.backgroundColor) {
      properties.backgroundColor = this.rgbToHex(node.backgroundColor);
    }

    if (node.fills) {
      properties.fills = node.fills.map((fill: any) => this.processFill(fill));
    }

    if (node.strokes) {
      properties.strokes = node.strokes.map((stroke: any) =>
        this.processStroke(stroke)
      );
    }

    if (node.effects) {
      properties.effects = node.effects;
    }

    if (node.constraints) {
      properties.constraints = node.constraints;
    }

    return properties;
  }

  private processFill(fill: any) {
    if (fill.type === "SOLID") {
      return {
        type: "SOLID",
        color: this.rgbToHex(fill.color),
        opacity: fill.opacity || 1,
      };
    }
    return fill;
  }

  private processStroke(stroke: any) {
    if (stroke.type === "SOLID") {
      return {
        type: "SOLID",
        color: this.rgbToHex(stroke.color),
        opacity: stroke.opacity || 1,
      };
    }
    return stroke;
  }

  private rgbToHex(color: { r: number; g: number; b: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}