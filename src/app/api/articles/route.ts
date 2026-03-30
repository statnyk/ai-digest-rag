import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, title, url, source, published_at, category, summary
       FROM articles
       ORDER BY published_at DESC
       LIMIT 100`
    );
    return NextResponse.json({ articles: rows });
  } catch (error) {
    console.error('Articles error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
