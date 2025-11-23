#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SimpleNewsAggregator } from "./simple-aggregator.js";

const SERVER_NAME = "simple-what-happen-mcp";
const aggregator = new SimpleNewsAggregator();

// Create an MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_news_by_platform",
        description: "Get news from a specific platform",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Platform name",
              enum: aggregator.getRegisteredApis()
            },
            limit: {
              type: "number",
              description: "Maximum number of news items to return",
              default: 5,
              minimum: 1,
              maximum: 20
            }
          },
          required: ["platform"]
        }
      },
      {
        name: "list_platforms",
        description: "List all available platforms",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_news_by_platform": {
        const platform = args?.platform as string;
        const limit = args?.limit as number || 5;

        if (!platform) {
          throw new Error("Platform parameter is required");
        }

        const news = await aggregator.getNewsByPlatform(platform, { limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                platform,
                count: news.length,
                data: news
              }, null, 2)
            }
          ]
        };
      }

      case "list_platforms": {
        const platforms = aggregator.getAvailablePlatforms();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                categories: platforms.length,
                data: platforms
              }, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: errorMessage,
            tool: name,
            arguments: args
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} server running on stdio`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});