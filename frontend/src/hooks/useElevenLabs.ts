import { useState, useRef, useCallback, useEffect } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface UseElevenLabsOptions {
  signedUrl: string;
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onConversationEnd?: (conversationId: string) => void;
  onError?: (error: string) => void;
}

export function useElevenLabs(options: UseElevenLabsOptions) {
  const { signedUrl, onMessage, onStatusChange, onConversationEnd, onError } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    onMessage?.(message);
  }, [onMessage]);

  // Play audio from agent
  const playAudioChunk = useCallback(async (base64Audio: string) => {
    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      const ctx = playbackContextRef.current;

      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to 16-bit PCM samples
      const pcmData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768;
      }

      // Create audio buffer
      const audioBuffer = ctx.createBuffer(1, floatData.length, 16000);
      audioBuffer.getChannelData(0).set(floatData);

      // Schedule playback
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      setIsAgentSpeaking(true);

      source.onended = () => {
        if (ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
          setIsAgentSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateStatus('connecting');

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      mediaStreamRef.current = stream;

      // Create audio context for recording
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create processor for audio data
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      // Connect WebSocket
      const ws = new WebSocket(signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        updateStatus('connected');

        // Start sending audio
        processorRef.current!.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert to 16-bit PCM
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }
            // Send as base64
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
            ws.send(JSON.stringify({
              type: 'audio',
              audio: base64
            }));
          }
        };

        source.connect(processorRef.current!);
        processorRef.current!.connect(audioContextRef.current!.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'conversation_initiation_metadata':
              setConversationId(data.conversation_id);
              break;

            case 'agent_response':
              if (data.text) {
                addMessage({
                  role: 'assistant',
                  text: data.text,
                  timestamp: new Date()
                });
              }
              break;

            case 'user_transcript':
              if (data.text) {
                addMessage({
                  role: 'user',
                  text: data.text,
                  timestamp: new Date()
                });
              }
              break;

            case 'audio':
              // Play the audio from agent
              if (data.audio) {
                playAudioChunk(data.audio);
              }
              break;

            case 'audio_end':
              setIsAgentSpeaking(false);
              break;

            case 'conversation_end':
              if (data.conversation_id) {
                onConversationEnd?.(data.conversation_id);
              }
              break;

            case 'error':
              onError?.(data.message || 'Unknown error');
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        updateStatus('error');
        onError?.('WebSocket connection error');
      };

      ws.onclose = () => {
        updateStatus('disconnected');
        cleanup();
      };

    } catch (err) {
      updateStatus('error');
      onError?.(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [signedUrl, updateStatus, addMessage, onConversationEnd, onError, playAudioChunk]);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    nextPlayTimeRef.current = 0;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cleanup();
    updateStatus('disconnected');
  }, [cleanup, updateStatus]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
