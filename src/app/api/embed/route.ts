import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { query } from '@/lib/db';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function chunkText(text: string, maxChunkSize = 800): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxChunkSize && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxChunkSize)];
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export async function POST() {
  try {
    // Get articles that haven't been embedded yet
    const { rows: articles } = await query(
      `SELECT a.id, a.title, a.content, a.summary, a.source, a.category, a.published_at, a.url
       FROM articles a
       LEFT JOIN article_chunks ac ON a.id = ac.article_id
       WHERE ac.id IS NULL AND (a.content IS NOT NULL OR a.summary IS NOT NULL)
       LIMIT 50`
    );

    let embedded = 0;

    for (const article of articles) {
      const text = article.content || article.summary || '';
      if (!text.trim()) continue;

      const fullText = `${article.title}\n\n${text}`;
      const chunks = chunkText(fullText);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i]);
        const metadata = JSON.stringify({
          article_id: article.id,
          source: article.source,
          category: article.category,
          published_at: article.published_at,
          url: article.url,
          title: article.title,
        });

        await query(
          `INSERT INTO article_chunks (article_id, chunk_text, chunk_index, embedding, metadata)
           VALUES ($1, $2, $3, $4::vector, $5::jsonb)`,
          [article.id, chunks[i], i, `[${embedding.join(',')}]`, metadata]
        );
      }
      embedded++;
    }

    return NextResponse.json({ success: true, articlesEmbedded: embedded });
  } catch (error) {
    console.error('Embedding error:', error);
    return NextResponse.json({ error: 'Embedding failed' }, { status: 500 });
  }
}
