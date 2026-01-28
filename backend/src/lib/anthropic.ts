import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Client Configuration
 *
 * This module provides a configured Claude Haiku client for generating
 * interview configuration components using json-render format.
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Configuration constants
export const CLAUDE_CONFIG = {
  model: 'anthropic/claude-haiku-4.5', // Claude Haiku - fast and cost-effective
  temperature: 0.7, // Balanced between consistency and creativity
  max_tokens: 2048, // Sufficient for component generation
  max_retries: 3, // Retry failed requests
};

/**
 * Stream component generation from Claude
 *
 * @param systemPrompt - The system prompt with catalog definition
 * @param userIntent - User's interview intent/goal
 * @param onChunk - Callback for each streamed chunk
 * @returns Promise that resolves when streaming completes
 */
export async function streamComponentGeneration(
  systemPrompt: string,
  userIntent: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const stream = await anthropic.messages.stream({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.max_tokens,
      temperature: CLAUDE_CONFIG.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userIntent,
        },
      ],
    });

    // Process each chunk as it arrives
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text);
      }
    }

    // Wait for the stream to complete
    await stream.finalMessage();
  } catch (error: any) {
    // Enhanced error handling with retry logic
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error?.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your configuration.');
    } else if (error?.status === 500) {
      throw new Error('Anthropic service error. Please try again later.');
    } else {
      throw new Error(`Failed to generate components: ${error?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Generate personality description from Claude
 *
 * @param systemPrompt - The system prompt for personality generation
 * @param userIntent - User's interview intent/goal
 * @param onChunk - Callback for each streamed chunk
 * @returns Promise that resolves when streaming completes
 */
export async function streamPersonalityGeneration(
  systemPrompt: string,
  userIntent: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const stream = await anthropic.messages.stream({
      model: CLAUDE_CONFIG.model,
      max_tokens: 1024, // Shorter for personality descriptions
      temperature: 0.8, // Slightly higher for more creative personalities
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userIntent,
        },
      ],
    });

    // Process each chunk as it arrives
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text);
      }
    }

    await stream.finalMessage();
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error?.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your configuration.');
    } else {
      throw new Error(`Failed to generate personality: ${error?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Simple non-streaming completion for validation or testing
 *
 * @param systemPrompt - System prompt
 * @param userMessage - User message
 * @returns Promise resolving to the complete response text
 */
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.max_tokens,
      temperature: CLAUDE_CONFIG.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text from the first content block
    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text : '';
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error?.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your configuration.');
    } else {
      throw new Error(`Failed to generate completion: ${error?.message || 'Unknown error'}`);
    }
  }
}

export default anthropic;
