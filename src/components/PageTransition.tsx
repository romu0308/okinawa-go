import React, { useState, useEffect, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  return (
    <>
      <style>{`
        .page-transition {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .page-transition.mounted {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <div className={`page-transition ${mounted ? 'mounted' : ''} ${className}`}>
        {children}
      </div>
    </>
  );
}
