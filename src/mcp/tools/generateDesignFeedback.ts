// src/mcp/tools/generateDesignFeedback.ts
import { FigmaClient } from "../../utils/figmaClient.js";
import { ColorExtractor } from "../../extractors/colorExtractor.js";
import { TypographyExtractor } from "../../extractors/typographyExtractor.js";
import { LayoutExtractor } from "../../extractors/layoutExtractor.js";
import { ComplianceChecker } from "../../utils/complianceChecker.js";

export const generateDesignFeedbackTool = {
  description:
    "Generate comprehensive design feedback and improvement suggestions",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "Figma file key",
      },
      nodeId: {
        type: "string",
        description: "Figma node ID to analyze",
      },
      focusAreas: {
        type: "array",
        items: {
          type: "string",
          enum: ["colors", "typography", "layout", "spacing", "all"],
        },
        default: ["all"],
        description: "Specific areas to focus feedback on",
      },
    },
    required: ["fileKey", "nodeId"],
  },
  handler: async (args: any) => {
    const { fileKey, nodeId, focusAreas = ["all"] } = args;
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("FIGMA_ACCESS_TOKEN not configured");
    }

    const client = new FigmaClient(accessToken);
    const nodeData = await client.getNode(fileKey, nodeId);

    const colorExtractor = new ColorExtractor();
    const typographyExtractor = new TypographyExtractor();
    const layoutExtractor = new LayoutExtractor();
    const complianceChecker = new ComplianceChecker();

    const colors = colorExtractor.extract(nodeData.document);
    const typography = typographyExtractor.extractAll(nodeData.document);
    const layout = layoutExtractor.extract(nodeData.document);

    const issues = complianceChecker.checkAll({
      colors,
      typography,
      layout,
    });

    // Generate suggestions based on issues
    const suggestions: string[] = [];
    
    issues.forEach((issue) => {
      if (issue.ruleId === "brand-colors") {
        suggestions.push(
          `Consider using brand colors: Skyview Blue (#066FF), Off Black (#0F0F0F), or White (#FFFFFF)`
        );
      }
      if (issue.ruleId === "heading-typography") {
        suggestions.push(
          `Switch to approved fonts: American Grotesk, Inter, or SF Pro Display`
        );
      }
      if (issue.ruleId === "spacing-system") {
        suggestions.push(
          `Align spacing to the 8px grid system for consistency`
        );
      }
    });

    // Positive feedback
    const strengths: string[] = [];
    if (issues.length === 0) {
      strengths.push("Design follows all brand guidelines ✓");
    }
    if (colors.length > 0 && issues.filter(i => i.ruleId === "brand-colors").length === 0) {
      strengths.push("Color usage is on-brand ✓");
    }

    return {
      nodeId,
      nodeName: nodeData.document.name,
      overallScore: Math.max(0, 100 - (issues.length * 10)),
      feedback: {
        strengths,
        issues: issues.map((i) => ({
          severity: i.severity,
          message: i.message,
          rule: i.ruleName,
        })),
        suggestions: [...new Set(suggestions)], // Remove duplicates
      },
      detailedAnalysis: {
        colors: {
          found: colors.map((c) => c.hex),
          issues: issues.filter((i) => i.ruleId === "brand-colors"),
        },
        typography: {
          fonts: [...new Set(typography.map((t) => t.fontFamily))],
          issues: issues.filter((i) => i.ruleId === "heading-typography"),
        },
        layout: {
          dimensions: layout
            ? { width: layout.width, height: layout.height }
            : null,
          issues: issues.filter((i) => i.ruleId === "spacing-system"),
        },
      },
    };
  },
};