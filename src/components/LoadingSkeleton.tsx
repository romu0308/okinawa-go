import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'image';
  count?: number;
  className?: string;
}

const pulseStyle: React.CSSProperties = {
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  backgroundColor: '#e7e5e4',
  borderRadius: '8px',
};

const CardSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div
      style={{
        ...pulseStyle,
        width: '100%',
        height: '180px',
        borderRadius: '12px',
      }}
    />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
      <div style={{ ...pulseStyle, width: '40%', height: '12px' }} />
      <div style={{ ...pulseStyle, width: '100%', height: '20px' }} />
      <div style={{ ...pulseStyle, width: '80%', height: '20px' }} />
      <div style={{ ...pulseStyle, width: '60%', height: '14px' }} />
    </div>
  </div>
);

const TextSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ ...pulseStyle, width: '100%', height: '16px' }} />
    <div style={{ ...pulseStyle, width: '90%', height: '16px' }} />
    <div style={{ ...pulseStyle, width: '75%', height: '16px' }} />
  </div>
);

const ImageSkeleton: React.FC = () => (
  <div
    style={{
      ...pulseStyle,
      width: '100%',
      height: '200px',
      borderRadius: '12px',
    }}
  />
);

const skeletonMap = {
  card: CardSkeleton,
  text: TextSkeleton,
  image: ImageSkeleton,
};

export default function LoadingSkeleton({
  type = 'card',
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const Component = skeletonMap[type];

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div className={className}>
        {Array.from({ length: count }, (_, i) => (
          <Component key={i} />
        ))}
      </div>
    </>
  );
}
