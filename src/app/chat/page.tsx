'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Source {
  title: string;
  url: string;
  source: string;
  similarity: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', alignSelf: 'flex-start', maxWidth: '88%', animation: 'fade-in 0.3s ease-out' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-near-black)',
        boxShadow: '0 0 0 1px rgba(178,255,0,0.15)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: '"Fragment Mono", monospace' }}>
          assistant
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', background: 'var(--color-white)',
          border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px 16px 16px 4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, background: 'var(--color-near-black)',
                borderRadius: '50%', animation: `bounce-dots 1.4s infinite ease-in-out both`,
                animationDelay: `${-0.32 + i * 0.16}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace' }}>
            Searching articles...
          </span>
        </div>
      </div>
    </div>
  );
}

function SourcesDrawer({ sources, onClose }: { sources: Source[]; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        zIndex: 100, animation: 'overlay-fade-in 0.2s ease-out',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 380, maxWidth: '90vw',
        height: '100vh', background: 'var(--color-white)', zIndex: 101,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.1)',
        animation: 'drawer-slide-in 0.25s ease-out',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-near-black)', letterSpacing: '-0.01em' }}>
            Sources ({sources.length})
          </h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: 'none', background: 'var(--color-light-gray)',
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-muted)', transition: 'all 0.15s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 12,
              textDecoration: 'none', color: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-light-gray)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{
                width: 24, height: 24, background: 'var(--color-near-black)', color: 'var(--color-accent)',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: '"Fragment Mono", monospace', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-near-black)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 3, fontFamily: '"Fragment Mono", monospace' }}>
                  {s.source} · {Math.round(s.similarity * 100)}% match
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerSources, setDrawerSources] = useState<Source[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;
    const userMessage = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  const suggestions = [
    'What are the latest AI developments?',
    'Summarize recent tech news',
    'Any news about AI regulation?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-light-gray)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--color-white)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 780, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{
              width: 36, height: 36, background: 'var(--color-near-black)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}>
              <StarIcon />
            </Link>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-near-black)', letterSpacing: '-0.02em' }}>
                RAG Chat
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Fragment Mono", monospace', marginTop: 1 }}>
                Ask questions about AI news
              </div>
            </div>
          </div>
          <Link href="/" style={{
            height: 32, padding: '0 14px',
            border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
            background: 'var(--color-white)', color: 'var(--color-near-black)',
            fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
            textDecoration: 'none', transition: 'all 0.2s ease',
          }}>
            Dashboard
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
        {messages.length === 0 && !loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flex: 1, textAlign: 'center', gap: 20, padding: '80px 24px',
            animation: 'fade-in 0.5s ease-out',
          }}>
            <div style={{
              width: 64, height: 64, background: 'var(--color-near-black)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(178,255,0,0.1)',
              animation: 'icon-float 3s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-near-black)', letterSpacing: '-0.03em' }}>
              Ask about AI News
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', maxWidth: 420, lineHeight: 1.7 }}>
              Chat with your ingested news articles. Answers are grounded in real sources with citations.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { handleSend(s); }}
                  style={{
                    padding: '10px 18px', background: 'var(--color-white)',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24,
                    fontSize: 13, color: 'var(--color-near-black)', cursor: 'pointer',
                    transition: 'all 0.2s ease', fontFamily: '"Inter", sans-serif',
                    fontWeight: 450, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget).style.borderColor = 'var(--color-accent)';
                    (e.currentTarget).style.background = 'rgba(178,255,0,0.06)';
                    (e.currentTarget).style.transform = 'translateY(-1px)';
                    (e.currentTarget).style.boxShadow = '0 3px 8px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget).style.borderColor = 'rgba(0,0,0,0.08)';
                    (e.currentTarget).style.background = 'var(--color-white)';
                    (e.currentTarget).style.transform = 'translateY(0)';
                    (e.currentTarget).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                animation: 'fade-in 0.3s ease-out',
                maxWidth: msg.role === 'user' ? '80%' : '88%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...(msg.role === 'user' ? {
                    background: 'var(--color-near-black)',
                  } : {
                    background: 'var(--color-near-black)',
                    boxShadow: '0 0 0 1px rgba(178,255,0,0.15)',
                  }),
                }}>
                  {msg.role === 'user' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6,
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: '"Fragment Mono", monospace',
                  }}>
                    {msg.role === 'user' ? 'you' : 'assistant'}
                  </div>
                  <div style={{
                    padding: '16px 20px', lineHeight: 1.7, fontSize: 14,
                    overflowWrap: 'break-word' as const, wordBreak: 'break-word' as const,
                    ...(msg.role === 'user' ? {
                      background: 'var(--color-near-black)', color: 'var(--color-white)',
                      borderRadius: '16px 16px 4px 16px',
                    } : {
                      background: 'var(--color-white)', color: 'var(--color-near-black)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '16px 16px 16px 4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }),
                  }}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ marginBottom: 10, lineHeight: 1.7 }}>{children}</p>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{
                              color: 'var(--color-near-black)', fontWeight: 500,
                              textDecoration: 'underline', textUnderlineOffset: 3,
                              textDecorationColor: 'rgba(0,0,0,0.2)',
                              transition: 'text-decoration-color 0.15s',
                            }}>{children}</a>
                          ),
                          h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 600, marginTop: 16, marginBottom: 8, letterSpacing: '-0.01em' }}>{children}</h1>,
                          h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 14, marginBottom: 6, letterSpacing: '-0.01em' }}>{children}</h2>,
                          h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>{children}</h3>,
                          code: ({ children }) => (
                            <code style={{
                              fontFamily: '"Fragment Mono", monospace',
                              background: 'var(--color-light-gray)',
                              padding: '2px 7px', borderRadius: 5, fontSize: 13,
                              border: '1px solid rgba(0,0,0,0.04)',
                            }}>{children}</code>
                          ),
                          pre: ({ children }) => (
                            <pre style={{
                              background: 'var(--color-near-black)', color: 'var(--color-white)',
                              padding: 16, borderRadius: 10, overflowX: 'auto',
                              margin: '10px 0', fontSize: 13, lineHeight: 1.5,
                            }}>{children}</pre>
                          ),
                          ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ol>,
                          li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote style={{
                              borderLeft: '3px solid var(--color-accent)',
                              margin: '10px 0', padding: '4px 14px',
                              color: 'var(--color-muted)', fontStyle: 'italic',
                            }}>{children}</blockquote>
                          ),
                          hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '14px 0' }} />,
                          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                        }}
                      >{msg.content}</ReactMarkdown>
                    ) : msg.content}
                  </div>

                  {/* Sources button */}
                  {msg.sources && msg.sources.length > 0 && (
                    <button onClick={() => setDrawerSources(msg.sources!)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10,
                      padding: '7px 14px', background: 'var(--color-white)',
                      border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20,
                      fontSize: 12, fontWeight: 500, color: 'var(--color-muted)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      fontFamily: '"Fragment Mono", monospace',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(178,255,0,0.06)';
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.color = 'var(--color-near-black)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--color-white)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                      e.currentTarget.style.color = 'var(--color-muted)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {msg.sources.length} sources
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && <LoadingDots />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', padding: '12px 24px 20px', flexShrink: 0 }}>
        <form onSubmit={sendMessage} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--color-white)', borderRadius: 24,
          padding: '6px 6px 6px 18px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about AI news..."
            disabled={loading}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontFamily: '"Inter", sans-serif', fontSize: 14, lineHeight: 1.5,
              color: 'var(--color-near-black)', padding: '8px 0', outline: 'none',
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            width: 36, height: 36, border: 'none', borderRadius: '50%',
            background: 'var(--color-near-black)', color: 'var(--color-white)',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, opacity: loading || !input.trim() ? 0.3 : 1,
            transition: 'opacity 0.15s',
          }}>
            <SendIcon />
          </button>
        </form>
      </div>

      {/* Sources Drawer */}
      {drawerSources && <SourcesDrawer sources={drawerSources} onClose={() => setDrawerSources(null)} />}
    </div>
  );
}
