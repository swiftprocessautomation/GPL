
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader, Paperclip, FileText } from 'lucide-react';
import { ChatService, AppActions } from '../services/geminiService';
import { Estate } from '../types';
import { extractTextFromPdf } from '../utils/pdfUtils';

interface ChatbotProps {
  estates: Estate[];
  actions: AppActions;
}

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ estates, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'model', text: 'Hello! I am the Gabinas Assistant. I can help you navigate, generate reports, or process tenant documents. Upload a PDF to get started!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estates.length > 0 && !chatServiceRef.current) {
      chatServiceRef.current = new ChatService(estates);
    }
  }, [estates]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatServiceRef.current) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatServiceRef.current.sendMessage(textToSend, actions);
      const botMsg: Message = { id: Date.now() + 1, role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { id: Date.now() + 1, role: 'model', text: "Sorry, something went wrong." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsLoading(true);
      const loadingMsg: Message = { id: Date.now(), role: 'model', text: "Processing PDF..." };
      setMessages(prev => [...prev, loadingMsg]);
      
      try {
         const text = await extractTextFromPdf(file);
         const prompt = `I have uploaded a document. Please extract the tenant details from this text and draft a tenant form: \n\n${text}`;
         
         // Remove loading message
         setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
         
         // Trigger send with extracted text
         handleSend(prompt);
      } catch (error) {
        setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
        setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: "Error reading PDF file." }]);
        setIsLoading(false);
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-500 hover:bg-brand-600'
        }`}
      >
        {isOpen ? <X className="text-white" size={24} /> : <MessageCircle className="text-white" size={28} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 origin-bottom-right z-40 flex flex-col ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        }`}
        style={{ height: '500px' }}
      >
        {/* Header */}
        <div className="bg-brand-900 p-4 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-full">
            <Bot className="text-brand-500" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold font-display">Gabinas Assistant</h3>
            <p className="text-brand-500 text-xs">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text.length > 300 && msg.text.includes("extract") ? (
                   <div className="flex items-center gap-2 text-xs italic opacity-80">
                     <FileText size={14} /> Document Content Processed
                   </div>
                ) : msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader className="animate-spin text-slate-400" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Upload PDF"
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleFileUpload}
            />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-white"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
