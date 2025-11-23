# What Happen MCP

为 [What Happen](https://github.com/LYX9527/what-happen) 项目提供后端数据服务的 MCP (Model Context Protocol) 服务器。

## 项目简介

本项目是 [What Happen](https://github.com/LYX9527/what-happen) 新闻聚合平台的官方 MCP 服务器，提供：

- 📰 **多平台新闻聚合**: 支持 70+ 新闻平台的数据获取
- 🔌 **MCP 协议支持**: 可作为 MCP 工具集成到支持 MCP 的应用中
- 🖥️ **CLI 工具**: 独立的命令行工具，支持 JSON 和友好格式输出
- 🚀 **高性能**: 基于 Cheerio + Axios 的轻量级爬虫方案

## 与 What Happen 前端的配合

本项目专为 [What Happen](https://github.com/LYX9527/what-happen) 前端项目提供后端 API 服务，支持：

- `GET /platforms` - 获取可用新闻平台配置
- `GET /news` - 获取新闻数据，支持平台过滤

### 配置 What Happen 前端

在前端项目的 `.env` 文件中配置：

```bash
VITE_API_BASE_URL=http://localhost:10010
```

## 安装

### 作为 CLI 工具使用

```bash
# 全局安装
npm install -g what-happen-mcp

# 或本地安装
npm install what-happen-mcp

# 或使用 npx 直接运行（无需安装）
npx what-happen-mcp
```

#### 使用 npx 的优势

- **无需安装**：直接运行，不占用全局空间
- **自动更新**：每次运行都使用最新版本
- **版本灵活**：可以指定特定版本 `npx what-happen-mcp@0.1.0`

### 作为 MCP 服务器使用

在 MCP 配置文件中添加：

**推荐使用 npx（无需安装）：**
```json
{
  "mcpServers": {
    "what-happen": {
      "command": "npx",
      "args": [
        "what-happen-mcp"
      ]
    }
  }
}
```

**全局安装版本：**
```json
{
  "mcpServers": {
    "what-happen": {
      "type": "stdio",
      "command": "what-happen-mcp",
      "env": {},
      "alwaysAllow": ["get_news_by_platform", "get_news_by_category", "list_platforms"]
    }
  }
}
```

**本地路径版本：**
```json
{
  "mcpServers": {
    "what-happen": {
      "type": "stdio",
      "command": "node",
      "args": [
        "path/to/what-happen-mcp/build/index.js"
      ],
      "env": {},
      "alwaysAllow": ["get_news_by_platform", "get_news_by_category", "list_platforms"]
    }
  }
}
```

**平台差异说明:**
- **Linux/macOS**: 直接使用 `node` 命令和脚本路径。Node.js 在这些系统上可作为可执行文件直接访问。
- **Windows**: 使用 `cmd /c` 前缀来通过命令处理器运行 `node`。这是因为 Windows 上 Node.js 通常作为 `.cmd` 脚本安装在 PATH 中，需要 cmd 来解析。
- **跨平台替代方案**: 如果你的环境已配置，也可在 Windows 上尝试直接使用 `node` 命令（某些 Node.js 安装方式支持），或使用 `node.cmd`。

请将 `path/to/what-happen-mcp` 替换为实际的项目路径（绝对路径推荐）。

## CLI 使用方法

### 列出所有可用平台

```bash
# 使用 npx 直接运行（推荐）
npx what-happen list

# 或使用全局安装的命令
what-happen list
```

### 获取特定平台新闻

```bash
# 获取 GitHub 热门项目
npx what-happen get --platform github --limit 5

# 获取微博热搜
npx what-happen get --platform weibo --limit 10

# JSON 格式输出
npx what-happen get --platform zhihu --json
```

### 获取分类新闻

```bash
# 获取科技资讯
npx what-happen get --category tech --limit 15

# 获取热搜榜
npx what-happen get --category hot --limit 20
```

## MCP 工具

### 可用工具

1. **get_news_by_platform** - 获取特定平台新闻
   - 参数: `platform` (必需), `limit` (可选)
   - 支持平台: weibo, github, zhihu, baidu 等 70+ 平台

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
git clone https://github.com/LYX9527/what-happen-mcp.git
cd what-happen-mcp

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

## API 接口

### 获取平台列表

```
GET /platforms
```

返回所有可用的新闻平台配置。

### 获取新闻数据

```
GET /news?platform={platform}&limit={limit}
```

参数：
- `platform`: 平台名称（可选）
- `limit`: 返回数量限制（可选）

响应格式：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "string",
      "title": "string",
      "url": "string",
      "extra": {
        "info": "string",
        "time": "string",
        "rank": 0,
        "thumbnail": { "url": "string" }
      }
    }
  ]
}
```

## 许可证

本项目采用 MIT 许可证 - 与 [What Happen](https://github.com/LYX9527/what-happen) 前端项目保持一致。

## 相关项目

- [What Happen 前端](https://github.com/LYX9527/what-happen) - 现代化的新闻聚合平台前端
- [What Happen MCP](https://github.com/LYX9527/what-happen-mcp) - 本项目，提供后端数据服务

## 贡献

欢迎贡献代码！请查看贡献指南了解详情。

- Fork 本仓库
- 创建功能分支 (`git checkout -b feature/amazing-feature`)
- 提交更改 (`git commit -m 'Add some amazing feature'`)
- 推送到分支 (`git push origin feature/amazing-feature`)
- 创建 Pull Request

## 致谢

- 感谢所有提供公开 API 的新闻平台
- 使用 Vue 3 和现代 Web 技术构建
- 为统一新闻阅读体验而生