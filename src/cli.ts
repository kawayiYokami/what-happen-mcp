#!/usr/bin/env node

import { program } from 'commander';
import { NewsAggregator } from './aggregator.js';
import type { NewsItem, PlatformConfig } from './types/index.js';

const aggregator = new NewsAggregator();

program
  .name('news-aggregator')
  .description('CLI tool for news aggregation from multiple platforms')
  .version('1.0.0');

program
  .command('get')
  .description('Get news from a specific platform')
  .option('-p, --platform <platform>', 'Platform name (e.g., weibo, github, zhihu, baidu)')
  .option('-c, --category <category>', 'Category name (e.g., hot, tech, finance, social, entertainment, sports, car)')
  .option('-l, --limit <limit>', 'Limit number of results', '10')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options: any) => {
    try {
      const limit = typeof options.limit === 'string' ? parseInt(options.limit) : 10;

      if (options.platform) {
        const news = await aggregator.getNewsByPlatform(options.platform, { limit });
        if (options.json) {
          console.log(JSON.stringify(news, null, 2));
        } else {
          console.log(`\n📰 ${options.platform.toUpperCase()} 新闻 (${news.length} 条):\n`);
          news.forEach((item: NewsItem, index: number) => {
            console.log(`${index + 1}. ${item.title}`);
            if (item.extra?.info) console.log(`   ℹ️ ${item.extra.info}`);
            if (item.extra?.date) console.log(`   🕒 ${item.extra.date}`);
            console.log(`   🔗 ${item.url}\n`);
          });
        }
      } else if (options.category) {
        const news = await aggregator.getNewsByCategory(options.category, { limit });
        if (options.json) {
          console.log(JSON.stringify(news, null, 2));
        } else {
          console.log(`\n📰 ${options.category.toUpperCase()} 分类新闻 (${news.length} 条):\n`);
          news.forEach((item: NewsItem, index: number) => {
            console.log(`${index + 1}. ${item.title}`);
            if (item.extra?.info) console.log(`   ℹ️ ${item.extra.info}`);
            if (item.extra?.date) console.log(`   🕒 ${item.extra.date}`);
            console.log(`   🔗 ${item.url}\n`);
          });
        }
      } else {
        console.error('❌ 请指定 --platform 或 --category 参数');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available platforms and categories')
  .action(async () => {
    try {
      const platforms = await aggregator.getAvailablePlatforms();
      console.log('\n📋 可用平台:\n');

      platforms.forEach((category: PlatformConfig) => {
        console.log(`🏷️  ${category.name} (${category.category})`);
        category.platform.forEach((platform: string) => {
          console.log(`   • ${platform}`);
        });
        console.log('');
      });
    } catch (error) {
      console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('apis')
  .description('List all registered APIs')
  .action(async () => {
    try {
      const apis = aggregator.getRegisteredApis();
      console.log('\n🔧 已注册的API:\n');
      apis.forEach((api: string, index: number) => {
        console.log(`${index + 1}. ${api}`);
      });
      console.log(`\n总计: ${apis.length} 个API\n`);
    } catch (error) {
      console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
