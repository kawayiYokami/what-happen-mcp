import { zhihu, weibo, githubTrending, baidu } from './simple-apis.js';
import platformsConfig from './config/platforms.json' with { type: 'json' };
import type { NewsItem, PlatformConfig } from './types/index.js';

export class SimpleNewsAggregator {
  getRegisteredApis(): string[] {
    return ['zhihu', 'weibo', 'githubTrending', 'baidu'];
  }

  async getNewsByPlatform(platform: string, options: { limit?: number } = {}): Promise<NewsItem[]> {
    try {
      let apiFunction;
      switch (platform) {
        case 'zhihu':
          apiFunction = zhihu;
          break;
        case 'weibo':
          apiFunction = weibo;
          break;
        case 'github':
          apiFunction = githubTrending;
          break;
        case 'baidu':
          apiFunction = baidu;
          break;
        default:
          throw new Error(`Platform ${platform} not supported`);
      }

      const news = await apiFunction();
      const limit = options.limit || news.length;
      return news.slice(0, limit) as NewsItem[];
    } catch (error) {
      throw new Error(`获取 ${platform} 数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getAvailablePlatforms(): PlatformConfig[] {
    return platformsConfig;
  }
}