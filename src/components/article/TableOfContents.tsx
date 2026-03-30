import { useState, useEffect, useCallback, useMemo } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`\[\]]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\u3000-\u9fff\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]+/g, '-')
        .replace(/^-|-$/g, '');
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    let currentId = '';
    for (const el of headingElements) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120) {
        currentId = el.id;
      }
    }
    setActiveId(currentId);
  }, [headings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-3 px-4 border border-[#eee] rounded text-left bg-[#fafafa]"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          <span className="text-[13px] font-medium text-[#333]">目次</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="M2 4L6 8L10 4" stroke="#999" strokeWidth="1.5" />
          </svg>
        </button>
        {isOpen && (
          <nav className="mt-2 pl-4 border-l border-[#eee]">
            <ul className="space-y-2 py-2">
              {headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: h.level === 3 ? '16px' : '0' }}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`text-left text-[13px] leading-[1.7] transition-colors duration-200 bg-transparent border-none cursor-pointer p-0 ${
                      activeId === h.id ? 'text-[#e74c3c] font-medium' : 'text-[#999] hover:text-[#333]'
                    }`}
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <nav
        className="hidden lg:block sticky top-24"
        style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        <p
          className="mb-4"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: '#bbb',
          }}
        >
          Contents
        </p>
        <ul className="space-y-2" style={{ borderLeft: '1px solid #eee', paddingLeft: '16px' }}>
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? '12px' : '0' }}>
              <button
                onClick={() => scrollTo(h.id)}
                className={`text-left text-[13px] leading-[1.7] transition-colors duration-200 bg-transparent border-none cursor-pointer p-0 ${
                  activeId === h.id ? 'text-[#e74c3c] font-medium' : 'text-[#999] hover:text-[#333]'
                }`}
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
