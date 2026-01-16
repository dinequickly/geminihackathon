import { PostHog } from 'posthog-node';

// Singleton PostHog client
let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  // Return existing client if already initialized
  if (posthogClient) {
    return posthogClient;
  }

  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST;

  if (!apiKey || !host) {
    console.warn('PostHog not initialized: Missing POSTHOG_API_KEY or POSTHOG_HOST');
    return null;
  }

  // Initialize PostHog client
  posthogClient = new PostHog(apiKey, {
    host,
  });

  console.log('PostHog initialized for backend analytics');
  return posthogClient;
}

// Helper function to track backend events
export async function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
): Promise<void> {
  const client = getPostHogClient();

  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
}

// Graceful shutdown function
export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
