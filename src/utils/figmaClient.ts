// src/utils/figmaClient.ts
import axios from "axios";

export class FigmaClient {
  private accessToken: string;
  private baseUrl = "https://api.figma.com/v1";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getFile(fileKey: string) {
    const response = await axios.get(`${this.baseUrl}/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": this.accessToken,
      },
    });
    return response.data;
  }

  async getNode(fileKey: string, nodeId: string) {
    const response = await axios.get(
      `${this.baseUrl}/files/${fileKey}/nodes`,
      {
        params: { ids: nodeId },
        headers: {
          "X-Figma-Token": this.accessToken,
        },
      }
    );
    return response.data.nodes[nodeId];
  }

  async getImages(fileKey: string, nodeIds: string[], format = "png") {
    const response = await axios.get(`${this.baseUrl}/images/${fileKey}`, {
      params: {
        ids: nodeIds.join(","),
        format,
        scale: 2,
      },
      headers: {
        "X-Figma-Token": this.accessToken,
      },
    });
    return response.data;
  }

  async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
  }
}