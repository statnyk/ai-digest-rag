'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ingestStatus, setIngestStatus] = useState<string>('');
  const [embedStatus, setEmbedStatus] = useState<string>('');
  const [loading, setLoading] = useState<string>('');

  async function triggerIngest() {
    setLoading('ingest');
    setIngestStatus('Fetching RSS feeds...');
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const data = await res.json();
      setIngestStatus(`Done! Ingested ${data.ingested} articles, skipped ${data.skipped}.`);
    } catch {
      setIngestStatus('Error: Ingestion failed.');
    }
    setLoading('');
  }

  async function triggerEmbed() {
    setLoading('embed');
    setEmbedStatus('Generating embeddings...');
    try {
      const res = await fetch('/api/embed', { method: 'POST' });
      const data = await res.json();
      setEmbedStatus(`Done! Embedded ${data.articlesEmbedded} articles.`);
    } catch {
      setEmbedStatus('Error: Embedding failed.');
    }
    setLoading('');
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">AI News Digest</h1>
      <p className="text-gray-500 mb-10">RSS ingestion, weekly digest, and RAG-powered chat — all in one place.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border rounded-xl p-6 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">1. Ingest RSS Feeds</h2>
          <p className="text-gray-500 text-sm mb-4">Fetch articles from TechCrunch, Ars Technica, and The Verge.</p>
          <button
            onClick={triggerIngest}
            disabled={loading === 'ingest'}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading === 'ingest' ? 'Ingesting...' : 'Run Ingestion'}
          </button>
          {ingestStatus && <p className="mt-3 text-sm text-gray-600">{ingestStatus}</p>}
        </div>

        <div className="border rounded-xl p-6 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">2. Generate Embeddings</h2>
          <p className="text-gray-500 text-sm mb-4">Chunk articles and create vector embeddings for RAG search.</p>
          <button
            onClick={triggerEmbed}
            disabled={loading === 'embed'}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading === 'embed' ? 'Embedding...' : 'Run Embeddings'}
          </button>
          {embedStatus && <p className="mt-3 text-sm text-gray-600">{embedStatus}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/digest" className="border rounded-xl p-6 hover:shadow-md transition block">
          <h2 className="text-xl font-semibold mb-2">Weekly Digest</h2>
          <p className="text-gray-500 text-sm">View the AI-curated weekly news digest in Markdown format.</p>
        </Link>

        <Link href="/chat" className="border rounded-xl p-6 hover:shadow-md transition block">
          <h2 className="text-xl font-semibold mb-2">RAG Chat</h2>
          <p className="text-gray-500 text-sm">Ask questions about recent AI news with cited sources.</p>
        </Link>
      </div>
    </main>
  );
}
