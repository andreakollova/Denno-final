
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { DigestSection } from '../types';
import { createChatSession } from '../services/geminiService';
import { SendIcon, XIcon, UserIcon, BotIcon } from './Icons';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ChatModalProps {
  section: DigestSection;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ section, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    try {
      chatSessionRef.current = createChatSession(section);
      
      // Add initial greeting
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Ahoj! Zaujala ťa téma "${section.title}"? Rád ti o nej poviem viac alebo vysvetlím detaily.`
      }]);
    } catch (e) {
      console.error("Failed to initialize chat session", e);
      setMessages([{
        id: 'error',
        role: 'model',
        text: 'Nepodarilo sa inicializovať chat. Skontrolujte prosím pripojenie.'
      }]);
    }
  }, [section]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userText });
      
      let fullResponseText = '';
      const botMsgId = (Date.now() + 1).toString();

      // Add placeholder bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: ''
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponseText += c.text;
          
          // Update last message with new chunk
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullResponseText } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Ospravedlňujem sa, ale nastala chyba pri spracovaní odpovede. Skúste to prosím znova."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-[85vh] sm:h-[800px] sm:max-h-[90vh] sm:rounded-xl rounded-t-xl shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-out translate-y-0 relative overflow-hidden animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#6466f1] dark:text-indigo-400 uppercase tracking-widest">AI asistent</span>
            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-sm">{section.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                ${msg.role === 'user' ? 'bg-[#6466f1] text-white' : 'bg-white dark:bg-slate-900 text-[#6466f1] border border-slate-200 dark:border-slate-800'}
              `}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
              </div>
              
              <div className={`
                max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-[#6466f1] text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'}
              `}>
                {msg.text ? (
                  <div className={`markdown-content ${msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    <ReactMarkdown
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />,
                        a: ({node, ...props}) => <a className="underline hover:text-indigo-500" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="ml-1" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  isLoading && msg.id === messages[messages.length-1].id && (
                     <div className="flex items-center gap-2 text-slate-400 min-h-[1.25rem]">
                        <span className="text-xs font-bold animate-pulse">Píšem</span>
                        <span className="flex gap-1 items-center">
                           <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                           <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                        </span>
                     </div>
                  )
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 pb-8 sm:pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Opýtaj sa na detaily..."
              className="flex-1 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 border-0 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#6466f1] focus:bg-white dark:focus:bg-slate-900 transition-all outline-none shadow-inner"
              disabled={isLoading}
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`
                p-3 rounded-xl flex-shrink-0 transition-all duration-200
                ${!inputValue.trim() || isLoading 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600' 
                  : 'bg-[#6466f1] text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95'}
              `}
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatModal;
