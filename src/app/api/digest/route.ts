import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  category: string;
  summary: string;
}

function generateMarkdown(articles: Article[]): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const header = `# AI News Digest\n## Week of ${weekAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;

  // Group by category
  const grouped: Record<string, Article[]> = {};
  for (const article of articles) {
    const cat = article.category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(article);
  }

  let md = header;
  const categoryLabels: Record<string, string> = {
    ai: '🤖 Artificial Intelligence',
    tech: '💻 Technology',
    general: '📰 General',
  };

  for (const [category, items] of Object.entries(grouped)) {
    md += `### ${categoryLabels[category] || category}\n\n`;
    for (const item of items) {
      const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      md += `- **[${item.title}](${item.url})**\n`;
      md += `  ${item.summary ? item.summary.slice(0, 200) + (item.summary.length > 200 ? '...' : '') : 'No summary available.'}\n`;
      md += `  *${item.source} — ${date}*\n\n`;
    }
  }

  if (articles.length === 0) {
    md += '*No articles found for this period. Try running the RSS ingestion first.*\n';
  }

  md += `\n---\n*Generated on ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} by AI News Digest*\n`;
  return md;
}

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, title, url, source, published_at, category, summary
       FROM articles
       WHERE published_at >= NOW() - INTERVAL '7 days'
       ORDER BY category, published_at DESC`
    );

    const markdown = generateMarkdown(rows as Article[]);
    return NextResponse.json({ markdown, articleCount: rows.length });
  } catch (error) {
    console.error('Digest error:', error);
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 });
  }
}
