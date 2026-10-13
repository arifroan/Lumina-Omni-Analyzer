import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types/analyzer';
import { Send, Loader2, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface ChatConsultationProps {
  analysis: AnalysisResult;
}

export const ChatConsultation: React.FC<ChatConsultationProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'model',
      text: `I've completed the forensic analysis of "${analysis.title}". Ask me any follow-up questions—such as deeper technical fixes, counter-proposals, unit test generation, or specific line-by-line clarifications.`,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisContext: {
            title: analysis.title,
            domain: analysis.domain,
            executiveSummary: analysis.executiveSummary,
            verdict: analysis.verdict,
            findings: analysis.findings,
          },
          messages: messages.map((m) => ({ role: m.role, text: m.text })),
          question: query,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response returned.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Error: ${err.message || 'Failed to reach AI consultant.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    `How do I fix Finding #1 step-by-step?`,
    `Generate unit tests to cover the vulnerabilities found.`,
    `Explain the risks to non-technical stakeholders.`,
    `Provide alternative implementation options.`,
  ];

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-lg flex flex-col h-[600px] overflow-hidden">
      {/* Chat header */}
      <div className="px-5 py-3 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-stone-200">
            Interactive Follow-Up Consultation
          </h4>
        </div>
        <span className="text-xs text-stone-400 font-mono">
          Context-grounded in active report
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-amber-500 text-stone-950 font-medium'
                    : 'bg-stone-950/90 border border-stone-800 text-stone-200 font-mono text-xs'
                }`}
              >
                {m.text}
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded bg-stone-800 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-stone-400 text-xs font-mono">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>Formulating technical advisory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-stone-800/80 bg-stone-950/40 flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 px-2 py-1 rounded transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a technical question about this analysis or request modifications..."
            className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-md text-xs sm:text-sm text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`p-2 rounded-md transition-colors ${
              isLoading || !inputValue.trim()
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
