// A/B test utility for client-side variant assignment

export function getVariant(testId: string): string {
  if (typeof window === 'undefined') return 'A';
  const key = `ab_${testId}`;
  let variant = localStorage.getItem(key);
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(key, variant);
  }
  return variant;
}

export function getABTestConfig() {
  return {
    tests: [
      {
        id: 'cta-color',
        variants: [
          { id: 'A', value: '#dc2626' },
          { id: 'B', value: '#ea580c' },
        ],
      },
      {
        id: 'cta-text',
        variants: [
          { id: 'A', value: '無料で市場価値を診断する' },
          { id: 'B', value: 'あなたの適正年収をチェック' },
        ],
      },
    ],
  };
}
