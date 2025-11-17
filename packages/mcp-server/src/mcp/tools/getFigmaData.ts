export const getFigmaDataTool = {
  description: "Get data from a Figma file",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "The Figma file key"
      }
    },
    required: ["fileKey"]
  },
  handler: async (args: any) => {
    return {
      success: false,
      message: "Not implemented yet"
    };
  }
};
