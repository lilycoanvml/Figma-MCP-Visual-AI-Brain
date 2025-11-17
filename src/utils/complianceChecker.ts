// src/utils/complianceChecker.ts
import brandGuidelines from "../data/brandGuidelines.json" assert { type: "json" };
import { ColorData } from "../extractors/colorExtractor.js";
import { TypographyData } from "../extractors/typographyExtractor.js";
import { LayoutData } from "../extractors/layoutExtractor.js";

export interface ComplianceIssue {
  ruleId: string;
  ruleName: string;
  severity: "error" | "warning";
  message: string;
  element?: string;
}

export class ComplianceChecker {
  checkColors(colors: ColorData[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const colorRule = brandGuidelines.colorRules.find(
      (r) => r.id === "brand-colors"
    );

    if (!colorRule) return issues;

    colors.forEach((color) => {
      const isApproved = colorRule.colors.some(
        (brandColor) => brandColor.toLowerCase() === color.hex.toLowerCase()
      );

      if (!isApproved) {
        issues.push({
          ruleId: colorRule.id,
          ruleName: colorRule.name,
          severity: colorRule.severity as "error" | "warning",
          message: `Color ${color.hex} is not in the approved brand palette. Approved colors: ${colorRule.colors.join(", ")}`,
        });
      }
    });

    return issues;
  }

  checkTypography(typography: TypographyData[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const typoRule = brandGuidelines.typographyRules.find(
      (r) => r.id === "heading-typography"
    );

    if (!typoRule) return issues;

    typography.forEach((typo) => {
      // Check font family
      const isFontApproved = typoRule.allowedFonts.includes(typo.fontFamily);
      if (!isFontApproved) {
        issues.push({
          ruleId: typoRule.id,
          ruleName: typoRule.name,
          severity: typoRule.severity as "error" | "warning",
          message: `Font "${typo.fontFamily}" is not approved. Use: ${typoRule.allowedFonts.join(", ")}`,
        });
      }

      // Check font size
      if (typo.fontSize < typoRule.minSize || typo.fontSize > typoRule.maxSize) {
        issues.push({
          ruleId: typoRule.id,
          ruleName: typoRule.name,
          severity: typoRule.severity as "error" | "warning",
          message: `Font size ${typo.fontSize}px is outside the allowed range (${typoRule.minSize}-${typoRule.maxSize}px)`,
        });
      }
    });

    return issues;
  }

  checkSpacing(layout: LayoutData): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const spacingRule = brandGuidelines.spacingRules.find(
      (r) => r.id === "spacing-system"
    );

    if (!spacingRule) return issues;

    if (layout.spacing !== undefined) {
      const isValidSpacing = spacingRule.allowedMultiples.some(
        (multiple) => layout.spacing === spacingRule.baseUnit * multiple
      );

      if (!isValidSpacing) {
        issues.push({
          ruleId: spacingRule.id,
          ruleName: spacingRule.name,
          severity: spacingRule.severity as "error" | "warning",
          message: `Spacing ${layout.spacing}px doesn't follow the 8px grid system. Use multiples of 8: ${spacingRule.allowedMultiples.map((m) => m * spacingRule.baseUnit).join(", ")}`,
        });
      }
    }

    return issues;
  }

  checkAll(data: {
    colors: ColorData[];
    typography: TypographyData[];
    layout: LayoutData | null;
  }): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    issues.push(...this.checkColors(data.colors));
    issues.push(...this.checkTypography(data.typography));
    
    if (data.layout) {
      issues.push(...this.checkSpacing(data.layout));
    }

    return issues;
  }
}