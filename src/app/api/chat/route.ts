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

    // Deduplicate chunks by URL, keeping highest similarity per article
    const urlToChunks = new Map<string, { chunks: ChunkResult[]; bestSimilarity: number }>();
    for (const c of chunks) {
      const url = c.metadata.url;
      const existing = urlToChunks.get(url);
      if (existing) {
        existing.chunks.push(c);
        existing.bestSimilarity = Math.max(existing.bestSimilarity, c.similarity);
      } else {
        urlToChunks.set(url, { chunks: [c], bestSimilarity: c.similarity });
      }
    }

    // Build deduplicated sources list and context with matching indices
    const sources: { title: string; url: string; source: string; similarity: number }[] = [];
    const contextParts: string[] = [];

    for (const [, entry] of urlToChunks) {
      const sourceIndex = sources.length + 1;
      const representative = entry.chunks[0];
      sources.push({
        title: representative.metadata.title,
        url: representative.metadata.url,
        source: representative.metadata.source,
        similarity: Math.round(entry.bestSimilarity * 100) / 100,
      });
      // Combine all chunks from same article under one source number
      const combinedText = entry.chunks.map(c => c.chunk_text).join(' ... ');
      contextParts.push(`[${sourceIndex}] "${combinedText}" (Source: ${representative.metadata.title} - ${representative.metadata.source}, ${representative.metadata.url})`);
    }

    const context = contextParts.join('\n\n');

    // Generate answer with citations
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI news research assistant. Answer questions based on the provided article excerpts. Always cite your sources using [1], [2], etc. matching the source numbers provided. Only use source numbers that exist in the list below. If the context doesn't contain relevant information, say so honestly. Keep answers concise and informative.

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
