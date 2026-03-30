'use client';

import { useState } from 'react';
import Link from 'next/link';

function StarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

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
      setIngestStatus(`Ingested ${data.ingested} articles, skipped ${data.skipped}.`);
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
      setEmbedStatus(`Embedded ${data.articlesEmbedded} articles.`);
    } catch {
      setEmbedStatus('Error: Embedding failed.');
    }
    setLoading('');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-light-gray)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--color-white)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 780,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'var(--color-near-black)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <StarIcon />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-near-black)', letterSpacing: '-0.02em' }}>
                AI News Digest
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace', marginTop: 1 }}>
                RAG-Powered News Intelligence
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        maxWidth: 780,
        margin: '0 auto',
        padding: '40px 24px',
        animation: 'fade-in 0.5s ease-out',
      }}>
        {/* Welcome section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'var(--color-near-black)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(178,255,0,0.1)',
            animation: 'icon-float 3s ease-in-out infinite',
          }}>
            <StarIcon />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-near-black)', marginBottom: 8 }}>
            AI News Digest
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Ingest RSS feeds, generate embeddings, create weekly digests, and chat with your news using RAG.
          </p>
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 24 }}>
          <ActionCard
            step="01"
            title="Ingest RSS Feeds"
            description="Fetch articles from TechCrunch, Ars Technica, and The Verge"
            buttonText={loading === 'ingest' ? 'Ingesting...' : 'Run Ingestion'}
            onClick={triggerIngest}
            disabled={loading === 'ingest'}
            status={ingestStatus}
          />
          <ActionCard
            step="02"
            title="Generate Embeddings"
            description="Chunk articles and create vector embeddings for RAG search"
            buttonText={loading === 'embed' ? 'Embedding...' : 'Run Embeddings'}
            onClick={triggerEmbed}
            disabled={loading === 'embed'}
            status={embedStatus}
          />
        </div>

        {/* Navigation cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          <Link href="/digest" style={{ textDecoration: 'none', color: 'inherit' }}>
            <NavCard
              step="03"
              title="Weekly Digest"
              description="View the AI-curated weekly news digest in Markdown format"
            />
          </Link>
          <Link href="/chat" style={{ textDecoration: 'none', color: 'inherit' }}>
            <NavCard
              step="04"
              title="RAG Chat"
              description="Ask questions about recent AI news with cited sources"
            />
          </Link>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ step, title, description, buttonText, onClick, disabled, status }: {
  step: string; title: string; description: string; buttonText: string;
  onClick: () => void; disabled: boolean; status: string;
}) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '20px 22px',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(178,255,0,0.3)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.06)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: 11, fontFamily: '"Fragment Mono", monospace', color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>
        Step {step}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-near-black)', marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 16 }}>{description}</p>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          height: 32,
          padding: '0 14px',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          background: 'var(--color-near-black)',
          color: 'var(--color-white)',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: '"Inter", sans-serif',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {buttonText}
      </button>
      {status && (
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace' }}>
          {status}
        </p>
      )}
    </div>
  );
}

function NavCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '20px 22px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(178,255,0,0.3)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.06)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: 11, fontFamily: '"Fragment Mono", monospace', color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>
        Step {step}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-near-black)', marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>{description}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
