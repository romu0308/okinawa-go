// Client-side analytics helper for GA4 event tracking

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}

export function trackPageView(path: string) {
  trackEvent('page_view', { page_path: path });
}

export function trackCTAClick(ctaName: string, articleSlug: string) {
  trackEvent('cta_click', { cta_name: ctaName, article_slug: articleSlug });
}

export function trackAffiliateClick(serviceId: string, articleSlug: string) {
  trackEvent('affiliate_click', { service_id: serviceId, article_slug: articleSlug });
}

export function trackDiagnosisComplete(toolName: string, result: string) {
  trackEvent('diagnosis_complete', { tool_name: toolName, result });
}

export function trackLineClick() {
  trackEvent('line_registration_click');
}

export function trackScrollDepth(depth: number) {
  trackEvent('scroll_depth', { depth_percent: depth });
}

export function trackArticleRead(slug: string) {
  trackEvent('article_read', { article_slug: slug });
}
