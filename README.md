# News Aggregator MCP

一个基于 Model Context Protocol (MCP) 的新闻聚合工具，提供 CLI 和 MCP 服务器两种使用方式。

## 功能特性

- 📰 **多平台聚合**: 支持微博、GitHub、知乎、百度等 70+ 新闻平台
- 🏷️ **智能分类**: 按热搜、科技、财经、社会、娱乐、体育、汽车等类别组织
- 🖥️ **CLI 工具**: 命令行界面，支持 JSON 和友好格式输出
- 🔌 **MCP 服务器**: 可作为 MCP 工具集成到支持 MCP 的应用中
- 🚀 **高性能**: 基于 Cheerio + Axios 的轻量级爬虫方案

## 安装

### 作为 CLI 工具使用

```bash
# 全局安装
npm install -g news-aggregator-mcp

# 或本地安装
npm install news-aggregator-mcp
```

### 作为 MCP 服务器使用

在 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "news-aggregator": {
      "type": "stdio",
      "command": "cmd",
      "args": [
        "/c",
        "node",
        "path/to/news-aggregator-mcp/build/index.js"
      ],
      "env": {},
      "alwaysAllow": ["get_news_by_platform", "get_news_by_category", "list_platforms"]
    }
  }
}
```

## CLI 使用方法

### 列出所有可用平台

```bash
news-aggregator list
```

### 获取特定平台新闻

```bash
# 获取 GitHub 热门项目
news-aggregator get --platform github --limit 5

# 获取微博热搜
news-aggregator get --platform weibo --limit 10

# JSON 格式输出
news-aggregator get --platform zhihu --json
```

### 获取分类新闻

```bash
# 获取科技资讯
news-aggregator get --category tech --limit 15

# 获取热搜榜
news-aggregator get --category hot --limit 20
```

## MCP 工具

### 可用工具

1. **get_news_by_platform** - 获取特定平台新闻
   - 参数: `platform` (必需), `limit` (可选)
   - 支持平台: weibo, github, zhihu, baidu

2. **get_news_by_category** - 获取分类新闻
   - 参数: `category` (必需), `limit` (可选)
   - 支持分类: hot, tech, finance, social, entertainment, sports, car

3. **list_platforms** - 列出所有平台和分类
   - 参数: 无

### MCP 使用示例

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_news_by_platform",
    "arguments": {
      "platform": "github",
      "limit": 5
    }
  }
}
```

## 支持的平台

### 热搜榜
- 微博热搜、百度热搜、抖音热点、知乎热榜、快手热门、今日头条

### 科技资讯
- GitHub趋势、36氪、IT之家、Solidot、V2EX、掘金、CSDN、少数派等

### 社会新闻
- 澎湃新闻、参考消息、联合早报、贴吧、靠谱新闻、虎扑

### 娱乐资讯
- B站热门、豆瓣电影、百度电视剧、酷狗音乐、QQ音乐等

### 体育赛事
- 虎扑LOL、FIFA、NBA、CBA、中超、Valorant等

### 汽车资讯
- 懂车帝、汽车之家等

### 财经新闻
- 华尔街见闻、集思录、财联社、格隆汇、股票市场等

## 开发

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>
cd news-aggregator-mcp

# 安装依赖
npm install

# 构建
npm run build

# 运行 CLI
npm run cli -- list

# 运行 MCP 服务器
npm start
```

### 添加新平台

1. 在 `src/aggregator.ts` 中添加新的 API 函数
2. 在 `initializeApis()` 方法中注册新平台
3. 更新 `initializePlatforms()` 中的平台配置
4. 重新构建项目

## 许可证

MIT License
