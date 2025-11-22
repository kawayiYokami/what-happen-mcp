#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { NewsAggregator } from "./aggregator.js";
import type { NewsItem, PlatformConfig } from "./types/index.js";

const aggregator = new NewsAggregator();

// Create an MCP server
const server = new Server(
  {
    name: "news-aggregator-mcp",
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
  const registeredApis = aggregator.getRegisteredApis();

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
              enum: registeredApis
            },
            limit: {
              type: "number",
              description: "Maximum number of news items to return",
              default: 10,
              minimum: 1,
              maximum: 50
            }
          },
          required: ["platform"]
        }
      },
      {
        name: "get_news_by_category",
        description: "Get news from a specific category",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Category name",
              enum: ["hot", "tech", "finance", "social", "entertainment", "sports", "car"]
            },
            limit: {
              type: "number",
              description: "Maximum number of news items to return",
              default: 20,
              minimum: 1,
              maximum: 100
            }
          },
          required: ["category"]
        }
      },
      {
        name: "list_platforms",
        description: "List all available platforms and categories",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "list_apis",
        description: "List all registered APIs",
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
        const limit = args?.limit as number || 10;

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

      case "get_news_by_category": {
        const category = args?.category as string;
        const limit = args?.limit as number || 20;

        if (!category) {
          throw new Error("Category parameter is required");
        }

        const news = await aggregator.getNewsByCategory(category, { limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                category,
                count: news.length,
                data: news
              }, null, 2)
            }
          ]
        };
      }

      case "list_platforms": {
        const platforms = await aggregator.getAvailablePlatforms();

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

      case "list_apis": {
        const apis = aggregator.getRegisteredApis();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: apis.length,
                data: apis
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
  console.error("News Aggregator MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
