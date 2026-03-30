import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { query } from '@/lib/db';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

interface ChunkResult {
  chunk_text: string;
  metadata: {
    title: string;
    url: string;
    source: string;
    category: string;
    published_at: string;
  };
  similarity: number;
}

async function searchChunks(questionEmbedding: number[], limit = 5): Promise<ChunkResult[]> {
  const embeddingStr = `[${questionEmbedding.join(',')}]`;
  const { rows } = await query(
    `SELECT chunk_text, metadata,
            1 - (embedding <=> $1::vector) as similarity
     FROM article_chunks
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [embeddingStr, limit]
  );
  return rows as ChunkResult[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get embedding for the question
    const questionEmbedding = await getEmbedding(message);

    // Search for relevant chunks
    const chunks = await searchChunks(questionEmbedding);

    // Build context from retrieved chunks
    const context = chunks
      .map((c, i) => `[${i + 1}] "${c.chunk_text}" (Source: ${c.metadata.title} - ${c.metadata.source}, ${c.metadata.url})`)
      .join('\n\n');

    const seen = new Set<string>();
    const sources = chunks
      .filter(c => {
        if (seen.has(c.metadata.url)) return false;
        seen.add(c.metadata.url);
        return true;
      })
      .map(c => ({
        title: c.metadata.title,
        url: c.metadata.url,
        source: c.metadata.source,
        similarity: Math.round(c.similarity * 100) / 100,
      }));

    // Generate answer with citations
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI news research assistant. Answer questions based on the provided article excerpts. Always cite your sources using [1], [2], etc. matching the source numbers. If the context doesn't contain relevant information, say so honestly. Keep answers concise and informative.

Retrieved article excerpts:
${context}`,
      },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content || 'No response generated.';

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
