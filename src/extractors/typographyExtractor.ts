// src/extractors/typographyExtractor.ts
export interface TypographyData {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing: number;
  textAlign: string;
  textCase: string;
}

export class TypographyExtractor {
  extract(node: any): TypographyData | null {
    if (node.type !== "TEXT") {
      return null;
    }

    const style = node.style || {};

    return {
      fontFamily: style.fontFamily || "Unknown",
      fontSize: style.fontSize || 16,
      fontWeight: style.fontWeight || 400,
      lineHeight: style.lineHeightPx || style.lineHeightPercent || "auto",
      letterSpacing: style.letterSpacing || 0,
      textAlign: style.textAlignHorizontal || "LEFT",
      textCase: style.textCase || "ORIGINAL",
    };
  }

  extractAll(node: any): TypographyData[] {
    const results: TypographyData[] = [];

    const traverse = (n: any) => {
      const typography = this.extract(n);
      if (typography) {
        results.push(typography);
      }

      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return results;
  }
}