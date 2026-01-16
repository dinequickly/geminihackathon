import posthog from 'posthog-js';

// Initialize PostHog
export function initPostHog() {
  const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  if (apiKey && host) {
    posthog.init(apiKey, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    });
  } else {
    console.warn('PostHog not initialized: Missing API key or host');
  }
}

export { posthog };
