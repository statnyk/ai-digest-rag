'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function DigestPage() {
  const [markdown, setMarkdown] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDigest() {
    setLoading(true);
    try {
      const res = await fetch('/api/digest');
      const data = await res.json();
      setMarkdown(data.markdown);
      setCount(data.articleCount);
    } catch {
      setMarkdown('Error loading digest.');
    }
    setLoading(false);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Weekly Digest</h1>
          {count !== null && <p className="text-gray-500 text-sm mt-1">{count} articles this week</p>}
        </div>
        <div className="flex gap-3">
          <a href="/" className="text-sm text-gray-500 hover:text-black">← Dashboard</a>
          <button
            onClick={loadDigest}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Generate Digest'}
          </button>
        </div>
      </div>

      {markdown ? (
        <article className="prose prose-gray max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Click &quot;Generate Digest&quot; to create this week&apos;s news summary.</p>
        </div>
      )}
    </main>
  );
}
