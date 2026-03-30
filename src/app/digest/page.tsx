'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

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
            <Link href="/" style={{
              width: 36,
              height: 36,
              background: 'var(--color-near-black)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}>
              <StarIcon />
            </Link>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-near-black)', letterSpacing: '-0.02em' }}>
                Weekly Digest
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace', marginTop: 1 }}>
                {count !== null ? `${count} articles this week` : 'AI News Summary'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/" style={{
              height: 32,
              padding: '0 14px',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 8,
              background: 'var(--color-white)',
              color: 'var(--color-near-black)',
              fontSize: 12,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}>
              Dashboard
            </Link>
            <button
              onClick={loadDigest}
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Loading...' : 'Generate Digest'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: 780,
        margin: '0 auto',
        padding: '32px 24px',
        animation: 'fade-in 0.5s ease-out',
      }}>
        {markdown ? (
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 16,
            padding: '32px 28px',
          }}>
            <div className="digest-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--color-near-black)' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 16, marginTop: 8 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 12, color: 'var(--color-near-black)', letterSpacing: '-0.01em' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-near-black)', marginBottom: 4 }}>{children}</p>,
                  li: ({ children }) => <li style={{ marginBottom: 16 }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{children}</ul>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-near-black)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 2, transition: 'opacity 0.15s' }}>{children}</a>,
                  em: ({ children }) => <em style={{ fontStyle: 'normal', fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace', display: 'block', marginTop: 2 }}>{children}</em>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '24px 0' }} />,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                }}
              >{markdown}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 56,
              height: 56,
              background: 'var(--color-near-black)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'icon-float 3s ease-in-out infinite',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-near-black)', letterSpacing: '-0.03em' }}>
              Weekly Digest
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', maxWidth: 360, lineHeight: 1.7 }}>
              Click &quot;Generate Digest&quot; to create this week&apos;s AI news summary.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
