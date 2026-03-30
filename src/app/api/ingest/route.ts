import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { query } from '@/lib/db';

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica', category: 'tech' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', category: 'ai' },
];

const parser = new Parser();

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function normalizeArticle(item: Parser.Item, source: string, category: string) {
  return {
    title: decodeHtmlEntities(item.title || 'Untitled'),
    url: item.link || '',
    source,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    category,
    summary: decodeHtmlEntities(item.contentSnippet?.slice(0, 500) || ''),
    content: decodeHtmlEntities(item.content || item.contentSnippet || ''),
  };
}

export async function POST() {
  try {
    let ingested = 0;
    let skipped = 0;

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items) {
          const article = normalizeArticle(item, feed.source, feed.category);
          if (!article.url) continue;

          try {
            await query(
              `INSERT INTO articles (title, url, source, published_at, category, summary, content)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (url) DO NOTHING`,
              [article.title, article.url, article.source, article.published_at, article.category, article.summary, article.content]
            );
            ingested++;
          } catch {
            skipped++;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch feed ${feed.source}:`, err);
      }
    }

    return NextResponse.json({ success: true, ingested, skipped });
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to trigger RSS ingestion' });
}
