// src/mcp/tools/getFigmaData.ts
import { FigmaClient } from "../../utils/figmaClient.js";
import { DesignExtractor } from "../../extractors/designExtractor.js";
import { ColorExtractor } from "../../extractors/colorExtractor.js";
import { TypographyExtractor } from "../../extractors/typographyExtractor.js";
import { LayoutExtractor } from "../../extractors/layoutExtractor.js";

export const getFigmaDataTool = {
  description: "Extract design data from a Figma node",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "Figma file key",
      },
      nodeId: {
        type: "string",
        description: "Figma node ID to extract data from",
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

    const designExtractor = new DesignExtractor();
    const colorExtractor = new ColorExtractor();
    const typographyExtractor = new TypographyExtractor();
    const layoutExtractor = new LayoutExtractor();

    const element = designExtractor.extractElement(nodeData.document);
    const colors = colorExtractor.extract(nodeData.document);
    const typography = typographyExtractor.extractAll(nodeData.document);
    const layout = layoutExtractor.extract(nodeData.document);

    return {
      element,
      colors,
      typography,
      layout,
      rawNode: nodeData.document,
    };
  },
};