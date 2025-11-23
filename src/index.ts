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

// 中英文参数映射
const categoryMapping: Record<string, string> = {
  // 中文到英文
  '热搜': 'hot',
  '科技': 'tech',
  '财经': 'finance',
  '社会': 'social',
  '娱乐': 'entertainment',
  '体育': 'sports',
  '汽车': 'car',
  // 英文到英文（保持不变）
  'hot': 'hot',
  'tech': 'tech',
  'finance': 'finance',
  'social': 'social',
  'entertainment': 'entertainment',
  'sports': 'sports',
  'car': 'car'
};

const platformMapping: Record<string, string> = {
  // 中文到英文
  '知乎': 'zhihu',
  '微博': 'weibo',
  '百度': 'baidu',
  '抖音': 'douyin',
  '头条': 'toutiao',
  'GitHub': 'github',
  'IT之家': 'ithome',
  '掘金': 'juejin',
  'CSDN': 'csdn',
  '少数派': 'sspai',
  'V2EX': 'v2exShare',
  '澎湃': 'thepaper',
  '参考': 'cankaoxiaoxi',
  '早报': 'zaobao',
  '虎扑': 'hupu',
  '豆瓣': 'douban',
  'B站': 'bHotSearch',
  '华尔街': 'wallStreetCnHot',
  '财联社': 'telegraph',
  '格隆汇': 'gelonghui',
  '懂车帝': 'dongchediHot',
  '汽车之家': 'autohome',
  // 英文到英文（保持不变）
  'zhihu': 'zhihu',
  'weibo': 'weibo',
  'baidu': 'baidu',
  'douyin': 'douyin',
  'toutiao': 'toutiao',
  'github': 'githubTrending',
  'ithome': 'ithome',
  'juejin': 'juejin',
  'csdn': 'csdn',
  'sspai': 'sspai',
  'v2exShare': 'v2exShare',
  'thepaper': 'thepaper',
  'cankaoxiaoxi': 'cankaoxiaoxi',
  'zaobao': 'zaobao',
  'hupu': 'hupu',
  'douban': 'douban',
  'bHotSearch': 'bHotSearch',
  'wallStreetCnHot': 'wallStreetCnHot',
  'telegraph': 'telegraph',
  'gelonghui': 'gelonghui',
  'dongchediHot': 'dongchediHot',
  'autohome': 'autohome'
};

// 转换函数
function normalizeCategory(category?: string): string | undefined {
  return category ? categoryMapping[category] || category : undefined;
}

function normalizePlatform(platform?: string): string | undefined {
  return platform ? platformMapping[platform] || platform : undefined;
}

// Create an MCP server
const server = new Server(
  {
    name: "what-happen-mcp",
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
        name: "get_news",
        description: `获取新闻热点 / Get news headlines and updates

支持分类 Categories:
- hot/热搜: Trending topics (微博/weibo, 知乎/zhihu, 百度/baidu, 抖音/douyin, 头条/toutiao)
- tech/科技: Technology news (GitHub, IT之家/ithome, 掘金/juejin, CSDN, 少数派/sspai, V2EX)
- finance/财经: Financial news (华尔街/wallstreetcn, 财联社/cls, 格隆汇/gelonghui, 股市/stock)
- social/社会: Social news (澎湃/thepaper, 参考/cankaoxiaoxi, 早报/zaobao, 虎扑/hupu)
- entertainment/娱乐: Entertainment (豆瓣/douban, B站/bilibili, QQ音乐/qq_music, 酷狗/kugou)
- sports/体育: Sports (虎扑NBA/hupu_nba, FIFA, CBA, LOL, Valorant)
- car/汽车: Automotive (懂车帝/dongchedi, 汽车之家/autohome)

支持平台 Platforms: 70+ platforms including 微博/weibo, 知乎/zhihu, GitHub/github, 百度/baidu, 抖音/douyin, 澎湃/thepaper, 虎扑/hupu, 华尔街/wallstreetcn, etc.`,

        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "新闻分类 / News category: hot/热搜, tech/科技, finance/财经, social/社会, entertainment/娱乐, sports/体育, car/汽车 (optional)"
            },
            platform: {
              type: "string",
              description: "平台名 / Platform name: 支持中英文，如 知乎/zhihu, 微博/weibo, GitHub/github 等 (optional)"
            },
            limit: {
              type: "number",
              description: "返回数量 / Number of items to return (default: 10)",
              default: 10,
              minimum: 1,
              maximum: 50
            }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name !== "get_news") {
      throw new Error(`Unknown tool: ${name}`);
    }

    const category = normalizeCategory(args?.category as string);
    const platform = normalizePlatform(args?.platform as string);
    const limit = args?.limit as number || 10;

    let news: any[] = [];
    let source = "";

    if (platform) {
      // 获取特定平台新闻
      news = await aggregator.getNewsByPlatform(platform, { limit });
      source = platform;
    } else if (category) {
      // 获取分类新闻
      news = await aggregator.getNewsByCategory(category, { limit });
      source = category;
    } else {
      // 默认获取热门新闻
      news = await aggregator.getNewsByCategory("hot", { limit });
      source = "热门";
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            source,
            count: news.length,
            data: news
          }, null, 2)
        }
      ]
    };
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
