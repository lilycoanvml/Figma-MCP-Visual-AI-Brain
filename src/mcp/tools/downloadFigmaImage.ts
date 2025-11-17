// src/mcp/tools/downloadFigmaImage.ts
import { FigmaClient } from "../../utils/figmaClient.js";
import fs from "fs/promises";
import path from "path";

export const downloadFigmaImageTool = {
  description: "Download an image of a Figma node",
  inputSchema: {
    type: "object",
    properties: {
      fileKey: {
        type: "string",
        description: "Figma file key",
      },
      nodeId: {
        type: "string",
        description: "Figma node ID to capture",
      },
      format: {
        type: "string",
        enum: ["png", "jpg", "svg"],
        default: "png",
        description: "Image format",
      },
      outputPath: {
        type: "string",
        description: "Path to save the image",
      },
    },
    required: ["fileKey", "nodeId"],
  },
  handler: async (args: any) => {
    const { fileKey, nodeId, format = "png", outputPath } = args;
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("FIGMA_ACCESS_TOKEN not configured");
    }

    const client = new FigmaClient(accessToken);
    const imageData = await client.getImages(fileKey, [nodeId], format);

    if (!imageData.images[nodeId]) {
      throw new Error("Failed to generate image");
    }

    const imageUrl = imageData.images[nodeId];
    const imageBuffer = await client.downloadImage(imageUrl);

    if (outputPath) {
      await fs.writeFile(outputPath, imageBuffer);
      return {
        success: true,
        path: outputPath,
        size: imageBuffer.length,
      };
    }

    return {
      success: true,
      base64: imageBuffer.toString("base64"),
      size: imageBuffer.length,
    };
  },
};