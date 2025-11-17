export const generateDesignFeedbackTool = {
  description: "Generate feedback for a Figma design",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "The Figma file key"
      },
      focusAreas: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Specific areas to focus feedback on"
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
