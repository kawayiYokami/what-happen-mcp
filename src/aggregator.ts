import { apiManager } from './manager/index.js';
import * as apis from './apis/index.js';
import platformsConfig from './config/platforms.json' with { type: 'json' };
import type { NewsItem, PlatformConfig } from './types/index.js';

export class NewsAggregator {
  constructor() {
    this.initializeApis();
  }

  private initializeApis() {
    // 动态注册所有API
    for (const key in apis) {
      const apiFunction = (apis as any)[key];
      if (typeof apiFunction === 'function') {
        apiManager.registerApi(key, apiFunction);
      }
    }
  }

  async getNewsByPlatform(platform: string, options: { limit?: number } = {}): Promise<NewsItem[]> {
    try {
      const apiFunction = apiManager.getApi(platform);
      const news = await apiFunction(options);
      const limit = options.limit || news.length;
      return news.slice(0, limit) as NewsItem[];
    } catch (error) {
      throw new Error(`获取 ${platform} 数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNewsByCategory(category: string, options: { limit?: number } = {}): Promise<NewsItem[]> {
    try {
      const categoryConfig = platformsConfig.find((p: any) => p.category === category);
      if (!categoryConfig) {
        throw new Error(`分类 ${category} 不存在`);
      }

      const allNews: NewsItem[] = [];
      const limit = options.limit || 50;

      for (const platform of categoryConfig.platform) {
        try {
          const news = await this.getNewsByPlatform(platform, { limit: Math.ceil(limit / categoryConfig.platform.length) });
          allNews.push(...news);
        } catch (error) {
          console.warn(`跳过平台 ${platform}:`, error instanceof Error ? error.message : String(error));
        }
      }

      return allNews.slice(0, limit);
    } catch (error) {
      throw new Error(`获取 ${category} 分类数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getAvailablePlatforms(): PlatformConfig[] {
    return platformsConfig;
  }

  getRegisteredApis(): string[] {
    return apiManager.getRegisteredApis();
  }
}
