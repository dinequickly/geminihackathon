import { useState, useRef, useCallback, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface UseElevenLabsOptions {
  signedUrl: string;
  dynamicVariables?: Record<string, string | number | boolean>;
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onConversationEnd?: (conversationId: string) => void;
  onError?: (error: string) => void;
}

export function useElevenLabs(options: UseElevenLabsOptions) {
  const { signedUrl, dynamicVariables, onMessage, onStatusChange, onConversationEnd, onError } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversationRef = useRef<any>(null);

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const connect = useCallback(async () => {
    if (status === 'connected' || status === 'connecting') return;

    updateStatus('connecting');

    try {
      // Build session config with dynamic variables for personalization
      const sessionConfig: any = {
        signedUrl,
        onConnect: () => {
          updateStatus('connected');
        },
        onDisconnect: () => {
          updateStatus('disconnected');
          if (conversationId) {
             onConversationEnd?.(conversationId);
          }
        },
        onError: (err: any) => {
          console.error('ElevenLabs error:', err);
          updateStatus('error');
          onError?.(typeof err === 'string' ? err : err.message || 'Unknown error');
        },
        onModeChange: (mode: { mode: string }) => {
          setIsAgentSpeaking(mode.mode === 'speaking');
        },
        onMessage: (message: any) => {
          // Handle transcript messages
          if (message.source === 'user' || message.source === 'ai') {
             const newMessage: Message = {
               role: message.source === 'user' ? 'user' : 'assistant',
               text: message.message,
               timestamp: new Date()
             };
             setMessages(prev => [...prev, newMessage]);
             onMessage?.(newMessage);
          }
        }
      };

      // Add dynamic variables if provided (for user context like resume, job description, etc.)
      if (dynamicVariables && Object.keys(dynamicVariables).length > 0) {
        sessionConfig.dynamicVariables = dynamicVariables;
        console.log('Starting ElevenLabs session with dynamic variables:', Object.keys(dynamicVariables));
      }

      const conversation = await Conversation.startSession(sessionConfig);

      conversationRef.current = conversation;
      
      // Try to get the real conversation ID if available on the instance
      // The SDK might not expose it synchronously, but usually it's there or accessible via getId()
      const realId = (conversation as any).id || (conversation as any).conversationId;
      if (realId) {
          setConversationId(realId);
      } else {
          // Fallback if SDK doesn't expose it directly (older versions)
          // We'll rely on the webhook to update the DB with the correct ID later
          setConversationId(null); 
      }

    } catch (err) {
      console.error('Failed to connect to ElevenLabs:', err);
      updateStatus('error');
      onError?.(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [signedUrl, updateStatus, onMessage, onError, onConversationEnd, conversationId]);

  const disconnect = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    updateStatus('disconnected');
  }, [updateStatus]);

  const sendMessage = useCallback((text: string) => {
    // The SDK typically handles voice input, text input might be supported via sendText?
    // Checking SDK capabilities... for now assume voice-primary.
    console.warn('sendMessage not implemented in SDK wrapper yet', text);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  return {
    status,
    messages,
    isAgentSpeaking,
    conversationId,
    connect,
    disconnect,
    sendMessage
  };
}
