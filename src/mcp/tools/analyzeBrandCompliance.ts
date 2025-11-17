// src/mcp/tools/analyzeBrandCompliance.ts
import { FigmaClient } from "../../utils/figmaClient.js";
import { ColorExtractor } from "../../extractors/colorExtractor.js";
import { TypographyExtractor } from "../../extractors/typographyExtractor.js";
import { LayoutExtractor } from "../../extractors/layoutExtractor.js";
import { ComplianceChecker } from "../../utils/complianceChecker.js";

export const analyzeBrandComplianceTool = {
  description:
    "Analyze a Figma element for brand guideline compliance",
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
    },
    required: ["fileKey", "nodeId"],
  },
  handler: async (args: any) => {
    const { fileKey, nodeId } = args;
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

    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");

    return {
      nodeId,
      nodeName: nodeData.document.name,
      compliant: errors.length === 0,
      summary: {
        totalIssues: issues.length,
        errors: errors.length,
        warnings: warnings.length,
      },
      issues,
      extractedData: {
        colors,
        typography,
        layout,
      },
    };
  },
};