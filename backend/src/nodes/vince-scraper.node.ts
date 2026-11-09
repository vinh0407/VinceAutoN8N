import axios from 'axios';
import * as cheerio from 'cheerio';
import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';
import { globalAIRouter } from '../ai/router.js';

export class VinceScraperNode implements INodeType {
  description = {
    name: 'vince.scraper',
    displayName: 'VinceAuto Web Scraper & AI Extractor',
    icon: 'Search',
    category: 'vince' as const,
    description: 'Cào nội dung trang web bằng CSS selector hoặc trích xuất tự động bằng AI',
    version: 1,
    properties: [
      {
        name: 'url',
        displayName: 'Target URL',
        type: 'string' as const,
        default: 'https://news.ycombinator.com',
        placeholder: 'https://example.com/page',
        required: true,
      },
      {
        name: 'mode',
        displayName: 'Scrape Mode',
        type: 'options' as const,
        default: 'selector',
        options: [
          { name: 'CSS Selector (Nhanh & chuẩn xác)', value: 'selector' },
          { name: 'AI Smart Extraction (Tự động nhận diện cấu trúc)', value: 'ai' },
        ],
      },
      {
        name: 'selector',
        displayName: 'CSS Selector',
        type: 'string' as const,
        default: '.titleline > a',
        placeholder: 'h1, .article-title, .price',
      },
      {
        name: 'aiInstruction',
        displayName: 'AI Extraction Instruction',
        type: 'string' as const,
        default: 'Trích xuất danh sách các tiêu đề tin tức và đường dẫn tương ứng dưới dạng mảng JSON',
      },
    ],
    inputs: ['main'],
    outputs: ['main'],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    const results: INodeExecutionData[] = [];
    const items = inputData.length > 0 ? inputData : [{ json: {} }];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const targetUrl = ExpressionEvaluator.evaluate(node.parameters.url, item, context, i);
      const mode = node.parameters.mode || 'selector';

      context.log(`[VinceScraper] Fetching URL: ${targetUrl}`);
      const res = await axios.get(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VinceAuto/1.0',
        },
        timeout: 30000,
      });

      const html = res.data;
      const $ = cheerio.load(html);

      if (mode === 'selector') {
        const selector = node.parameters.selector || 'body';
        const extracted: Array<{ text: string; href?: string }> = [];

        $(selector).each((_, el) => {
          const text = $(el).text().trim();
          const href = $(el).attr('href');
          if (text) {
            extracted.push({ text, ...(href ? { href } : {}) });
          }
        });

        results.push({
          json: {
            url: targetUrl,
            totalItems: extracted.length,
            items: extracted.slice(0, 50),
          },
        });
      } else {
        // AI extraction mode: clean HTML tags, keep text body
        $('script, style, noscript, svg, nav, footer').remove();
        const cleanText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);

        const prompt = `Trang web: ${targetUrl}\nNội dung văn bản:\n${cleanText}\n\nYêu cầu trích xuất: ${node.parameters.aiInstruction}\nTrả về kết quả dưới dạng JSON hợp lệ.`;
        const aiRes = await globalAIRouter.routeAndExecute([{ role: 'user', content: prompt }], 'fastest');

        let data = aiRes.text;
        try {
          let cleanJson = aiRes.text.trim();
          if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
          data = JSON.parse(cleanJson);
        } catch {
          // keep as text
        }

        results.push({
          json: {
            url: targetUrl,
            mode: 'ai_extraction',
            extractedData: data,
          },
        });
      }
    }

    return results;
  }
}
