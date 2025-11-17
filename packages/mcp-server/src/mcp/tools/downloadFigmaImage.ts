export const downloadFigmaImageTool = {
  description: "Download an image from Figma",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "The Figma file key"
      },
      nodeId: {
        type: "string",
        description: "The node ID to download"
      }
    },
    required: ["fileKey", "nodeId"]
  },
  handler: async (args: any) => {
    return {
      success: false,
      message: "Not implemented yet"
    };
  }
};
