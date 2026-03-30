import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  /** Provide FAQ items directly */
  items?: FAQItem[];
  /** Or provide HTML content to extract H2s as questions and following paragraphs as answers */
  htmlContent?: string;
}

function extractFAQFromHtml(html: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  // Match H2 headings followed by paragraph content
  const regex = /<h2[^>]*>(.*?)<\/h2>\s*<p[^>]*>(.*?)<\/p>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, '').trim();
    const answer = match[2].replace(/<[^>]*>/g, '').trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

export default function FAQJsonLd({ items, htmlContent }: FAQJsonLdProps) {
  const faqItems = items || (htmlContent ? extractFAQFromHtml(htmlContent) : []);

  if (faqItems.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
