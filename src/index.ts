#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { downloadFigmaImageTool } from "./mcp/tools/downloadFigmaImage.js";
import { getFigmaDataTool } from "./mcp/tools/getFigmaData.js";
import { analyzeBrandComplianceTool } from "./mcp/tools/analyzeBrandCompliance.js";
import { generateDesignFeedbackTool } from "./mcp/tools/generateDesignFeedback.js";

dotenv.config();

const server = new Server(
  {
    name: "figma-visual-brain-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool registry
const tools = {
  download_figma_image: downloadFigmaImageTool,
  get_figma_data: getFigmaDataTool,
  analyze_brand_compliance: analyzeBrandComplianceTool,
  generate_design_feedback: generateDesignFeedbackTool,
};

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools[request.params.name as keyof typeof tools];
  
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    const result = await tool.handler(request.params.arguments);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Figma Visual Brain MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});