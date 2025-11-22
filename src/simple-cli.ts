#!/usr/bin/env node

import { program } from 'commander';
import { SimpleNewsAggregator } from './simple-aggregator.js';

const aggregator = new SimpleNewsAggregator();

program
  .name('simple-news')
  .description('Simple CLI tool for news aggregation')
  .version('1.0.0');

program
  .command('test')
  .description('Test simple news aggregation')
  .option('-p, --platform <platform>', 'Platform name (zhihu, weibo, github, baidu)')
  .option('-l, --limit <limit>', 'Limit number of results', '5')
  .action(async (options: any) => {
    try {
      if (!options.platform) {
        console.log('Available platforms:', aggregator.getRegisteredApis());
        return;
      }

      console.log(`Testing ${options.platform}...`);
      const news = await aggregator.getNewsByPlatform(options.platform, { limit: parseInt(options.limit) });

      console.log(`\n📰 ${options.platform.toUpperCase()} 新闻 (${news.length} 条):\n`);
      news.forEach((item: any, index: number) => {
        console.log(`${index + 1}. ${item.title}`);
        if (item.extra?.info) console.log(`   ℹ️ ${item.extra.info}`);
        console.log(`   🔗 ${item.url}\n`);
      });
    } catch (error) {
      console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
    }
  });

program.parse();