import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { PlayfulButton, PlayfulCard, MessageBubble, PlayfulTextarea, LoadingSpinner, PlayfulCharacter } from '../components/PlayfulUI';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

const CHAT_WEBHOOK_URL = 'https://maxipad.app.n8n.cloud/webhook/a0894027-a899-473b-b864-e0a2d18950d3';

const getMessageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const extractAssistantReply = (data: any): string | null => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.reply === 'string') return data.reply;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.answer === 'string') return data.answer;
  if (typeof data.output === 'string') return data.output;
  return null;
};

const extractStreamChunk = (data: any): string | null => {
  if (!data) return null;
  if (data.type === 'begin' || data.type === 'end') return null;
  if (typeof data === 'string') return data;
  if (data.type === 'item' && typeof data.content === 'string') {
    const trimmed = data.content.trim();
    if (!trimmed) return null;
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractAssistantReply(parsed) || extractStreamChunk(parsed) || trimmed;
      } catch (parseError) {
        return data.content;
      }
    }
    return data.content;
  }
  if (typeof data.content === 'string') return data.content;
  if (typeof data.delta === 'string') return data.delta;
  if (typeof data.output === 'string') return data.output;
  if (data.delta && typeof data.delta.content === 'string') return data.delta.content;
  if (data.message && typeof data.message.content === 'string') return data.message.content;
  const choice = Array.isArray(data.choices) ? data.choices[0] : null;
  if (choice?.delta?.content) return choice.delta.content;
  if (choice?.message?.content) return choice.message.content;
  return null;
};

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sessionType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const typeFromQuery = params.get('type')?.trim() || null;
    if (typeFromQuery && chatId) {
      sessionStorage.setItem(`session_type_${chatId}`, typeFromQuery);
      return typeFromQuery;
    }
    if (chatId) {
      return sessionStorage.getItem(`session_type_${chatId}`) || null;
    }
    return null;
  }, [chatId, location.search]);

  const reviewPracticeId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('review_practice_id')?.trim() || null;
    if (fromQuery && chatId) {
      sessionStorage.setItem(`review_practice_${chatId}`, fromQuery);
      return fromQuery;
    }
    if (chatId) {
      return sessionStorage.getItem(`review_practice_${chatId}`) || chatId;
    }
    return null;
  }, [chatId, location.search]);

  const sourceConversationId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('conversation_id')?.trim() || params.get('source_conversation_id')?.trim() || null;
    if (fromQuery && chatId) {
      sessionStorage.setItem(`source_conversation_${chatId}`, fromQuery);
      return fromQuery;
    }
    if (chatId) {
      return sessionStorage.getItem(`source_conversation_${chatId}`) || null;
    }
    return null;
  }, [chatId, location.search]);

  const actionMeta = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const button = params.get('button')?.trim() || null;
    const firstClickRaw = params.get('first_click');
    const firstClick = firstClickRaw === null ? null : firstClickRaw === 'true';
    if (chatId) {
      if (button) sessionStorage.setItem(`action_button_${chatId}`, button);
      if (firstClickRaw !== null) sessionStorage.setItem(`action_first_click_${chatId}`, String(firstClick));
    }
    return {
      button: button || (chatId ? sessionStorage.getItem(`action_button_${chatId}`) : null),
      firstClick: firstClickRaw !== null
        ? firstClick
        : (chatId ? sessionStorage.getItem(`action_first_click_${chatId}`) === 'true' : null)
    };
  }, [chatId, location.search]);

  const chatTitle = useMemo(() => {
    if (!chatId) return 'Practice Chat';
    return `Practice Chat • ${chatId.slice(0, 8)}`;
  }, [chatId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isSending]);


  const buildPayload = (content: string, nextMessages: ChatMessage[], isFirstMessage: boolean) => {
    const payload: Record<string, any> = {
      conversation_id: sourceConversationId || chatId,
      source_conversation_id: sourceConversationId || reviewPracticeId || chatId,
      chat_id: chatId,
      message: content,
      first_message: isFirstMessage,
      messages: nextMessages.map(item => ({
        role: item.role,
        content: item.content
      }))
    };
    if (reviewPracticeId) {
      payload.review_practice_id = reviewPracticeId;
      payload.source_conversation_id = reviewPracticeId;
    }
    if (sessionType) {
      payload.type = sessionType;
    }
    if (actionMeta.button) {
      payload.button_clicked = actionMeta.button;
    }
    if (actionMeta.firstClick !== null) {
      payload.first_click = actionMeta.firstClick;
    }
    return payload;
  };

  const sendMessage = async () => {
    if (!draft.trim() || isSending || !chatId) return;
    const trimmed = draft.trim();

    const userMessage: ChatMessage = {
      id: getMessageId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now()
    };

    const nextMessages = [...messages, userMessage];
    const isFirstMessage = messages.length === 0;
    setMessages(nextMessages);
    setDraft('');
    setIsSending(true);
    setError(null);

    const appendAssistantContent = (assistantId: string, chunk: string) => {
      if (!chunk) return;
      setMessages(prev => prev.map(message => (
        message.id === assistantId
          ? { ...message, content: `${message.content}${chunk}` }
          : message
      )));
    };

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(trimmed, nextMessages, isFirstMessage))
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Webhook error (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isEventStream = contentType.includes('text/event-stream');
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const assistantId = getMessageId();
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: Date.now()
        }
      ]);

      const decoder = new TextDecoder();
      let buffer = '';
      let hasContent = false;
      let hasStreamTokens = false;

      const appendChunk = (chunk: string, sourceNode?: string) => {
        if (!chunk) return;
        if (sourceNode && /AI Agent/i.test(sourceNode)) {
          hasStreamTokens = true;
        }
        hasContent = true;
        appendAssistantContent(assistantId, chunk);
      };

      const handleParsedObject = (parsed: any) => {
        if (!parsed) return;
        const nodeName = parsed?.metadata?.nodeName || '';
        if (hasStreamTokens && /Respond to Webhook/i.test(nodeName)) {
          return;
        }
        const chunk = extractStreamChunk(parsed) || extractAssistantReply(parsed);
        if (chunk) {
          appendChunk(chunk, nodeName);
        }
      };

      const flushEvent = (eventBlock: string) => {
        const lines = eventBlock.split('\n');
        const dataLines = lines
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trimStart());
        if (!dataLines.length) return;
        const dataString = dataLines.join('\n');
        if (dataString === '[DONE]') return;
        try {
          const parsed = JSON.parse(dataString);
          handleParsedObject(parsed);
        } catch (parseError) {
          appendChunk(dataString);
        }
      };

      const flushJsonLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          const parsed = JSON.parse(trimmed);
          handleParsedObject(parsed);
        } catch (parseError) {
          appendChunk(trimmed);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        if (isEventStream) {
          let separatorIndex = buffer.indexOf('\n\n');
          while (separatorIndex !== -1) {
            const eventBlock = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);
            flushEvent(eventBlock);
            separatorIndex = buffer.indexOf('\n\n');
          }
        } else {
          let newlineIndex = buffer.indexOf('\n');
          while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            flushJsonLine(line);
            newlineIndex = buffer.indexOf('\n');
          }
        }
      }

      if (buffer) {
        if (isEventStream) {
          flushEvent(buffer);
        } else {
          flushJsonLine(buffer);
        }
      }

      if (!hasContent) {
        appendChunk('Got it. Want to dig deeper into this turn?');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 relative">
      {/* Playful background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-64 h-64 bg-sky-200/30 rounded-blob animate-float" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-coral-200/30 rounded-blob-2 animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }} />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-primary-100 sticky top-0 z-20 shadow-soft">
        <div className="px-6 py-5 max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-primary-50 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              {chatTitle}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Refine this moment with follow-up coaching</p>
          </div>
          <PlayfulCharacter emotion="thinking" size={60} />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="px-6 py-8 max-w-5xl mx-auto relative z-10">
        <PlayfulCard variant="white" className="flex flex-col h-[75vh] overflow-hidden">
          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <PlayfulCharacter emotion="happy" size={120} className="mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Let's chat!</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Start the conversation by asking about this moment. I'm here to help you practice and improve.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.content}
                  role={message.role}
                />
              ))
            )}
            {isSending && (
              <div className="flex items-center gap-3 text-sm text-gray-500 animate-slide-up">
                <LoadingSpinner size="sm" color="primary" />
                <span className="font-medium">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-gray-100 p-5 bg-cream-50/50">
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl p-3 flex items-center gap-2 animate-slide-down">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <PlayfulTextarea
                  value={draft}
                  onChange={setDraft}
                  placeholder="Ask a follow-up, or request a redo..."
                  rows={2}
                  disabled={isSending}
                />
              </div>
              <PlayfulButton
                onClick={sendMessage}
                disabled={!draft.trim() || isSending || !chatId}
                variant="primary"
                size="md"
                icon={Send}
              >
                Send
              </PlayfulButton>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </PlayfulCard>
      </main>
    </div>
  );
}
