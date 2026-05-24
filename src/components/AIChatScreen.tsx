import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  ArrowLeft, 
  Trash2, 
  ShieldCheck, 
  LifeBuoy, 
  CornerDownRight, 
  AlertOctagon,
  Sparkle
} from "lucide-react";
import { Message } from "../types";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "bot",
    text: "Welcome! I am SafeBot, your dedicated English-speaking consumer health and safety assistant. \n\nI am fully equipped to list out the active ingredients and chemical additives of any given substance, and provide safe medical or toxicological advice (such as analyzing paracetamol syrups, cosmetic creams, or food stabilizers). What substance or product formulation are we checking today?",
    timestamp: new Date()
  }
];

interface AIChatScreenProps {
  onBack: () => void;
}

export default function AIChatScreen({ onBack }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: "user_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend, 
          history: messages 
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: "bot_" + Date.now(),
        sender: "bot",
        text: data.reply || "I apologize, but my server failed to generate a response. Please check NAFDAC guidelines physically.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: "bot_err_" + Date.now(),
        sender: "bot",
        text: "Ouch, connection timeout. Please verify you are connected to the internet, or type standard search query in Verification screen.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const suggestions = [
    "List paracetamol syrup ingredients & advise safety",
    "What are common hazardous ingredients in cosmetics?",
    "Advice on Potassium Bromate substance risks",
    "List ingredients of suspicious cough medicine"
  ];

  return (
    <div className="w-full flex flex-col h-[80vh] justify-between relative bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-950 font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-green-600 flex items-center justify-center text-white relative">
            <Sparkles className="w-4 h-4" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-gray-900 font-heading leading-tight flex items-center gap-1">
              SafeBot
              <span className="text-[8px] bg-brand-green-50 text-brand-green-700 border border-brand-green-200 px-1 py-0.5 rounded-sm">Specialist</span>
            </h3>
            <p className="text-[9px] text-gray-500 font-medium">Safe Health Agent</p>
          </div>
        </div>

        <button 
          onClick={clearChat}
          className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          title="Reset chat stream"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4.5 space-y-4">
        
        {/* Safe AI Banner Indicator */}
        <div className="p-3 bg-brand-green-50 rounded-xl border border-brand-green-100 text-brand-green-950 text-xs flex gap-2 font-medium">
          <Sparkle className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
          <p className="leading-normal">
            VerifyNG AI matches requests using real-time toxicology models, clinical limits guidelines, and official blacklist records in Nigeria.
          </p>
        </div>

        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 text-left ${
              m.sender === "user" ? 
              "bg-brand-green-900 text-white rounded-br-xs text-xs font-medium" : 
              "bg-white border border-gray-150 text-gray-900 rounded-bl-xs text-xs shadow-3xs"
            }`}>
              
              {/* Bot icon signature inside bubble if bot */}
              {m.sender === "bot" && (
                <span className="text-[9px] font-bold text-brand-green-700 uppercase tracking-widest block mb-2 font-sans flex items-center gap-1 border-b border-gray-50 pb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-green-550" />
                  SAFEBOT AI
                </span>
              )}

              <p className="whitespace-pre-line leading-relaxed font-semibold">{m.text}</p>
              
              <span className={`block text-[9px] mt-2.5 text-right ${
                m.sender === "user" ? "text-brand-green-200" : "text-gray-400"
              }`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-150 rounded-2xl rounded-bl-xs p-4 text-left shadow-3xs">
              <span className="text-[9px] font-bold text-brand-green-700 uppercase tracking-widest block mb-1">
                SafeBot is consulting manuals...
              </span>
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 bg-brand-green-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-green-600 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-brand-green-600 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggestion list overlay if stream is fresh */}
      {messages.length <= 2 && (
        <div className="px-5 py-2.5 shrink-0 bg-slate-50 border-t border-gray-100">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Suggested Queries</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-brand-green-500 text-xs font-semibold text-gray-700 rounded-lg hover:text-brand-green-800 transition-all text-left truncate max-w-xs cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls form */}
      <div className="p-4 bg-white border-t border-gray-150 shrink-0">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask SafeBot about NAFDAC codes or contaminants..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-brand-green-600 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="w-12 h-12 bg-brand-green-600 hover:bg-brand-green-700 disabled:bg-gray-250 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5 rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
}
