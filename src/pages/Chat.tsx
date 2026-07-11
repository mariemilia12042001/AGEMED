import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { ArrowLeft, Send } from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    chatMessages,
    userChatInput,
    setUserChatInput,
    isAiLoading,
    handleSendMessage,
    playSoundEffect,
    setHasNewNotifications
  } = useAppState();

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  // Mark all messages as read on entry
  useEffect(() => {
    setHasNewNotifications(false);
  }, [setHasNewNotifications]);

  // Autoscroll chat messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiLoading]);

  const handleQuickQuestion = (qn: string) => {
    handleSendMessage(undefined, qn);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-100/40 text-neutral-900 text-left">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handleBack}
            className="p-1 hover:bg-stone-50 rounded-full cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center font-bold text-xs ring-2 ring-stone-900/10 text-white relative">
              AG
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-white"></span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 leading-tight">Asistente AGEMED</h4>
              <p className="text-[9px] text-[#58735F] italic font-semibold mt-0.5">Asistente de Salud Inteligente</p>
            </div>
          </div>
        </div>
        <div className="w-5 h-5"></div>
      </div>

      {/* CHAT MESSAGES STREAM CONTAINER */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[82%] text-left ${isUser ? "ml-auto items-end" : "mr-auto items-start animate-fade-in"}`}
            >
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? "bg-stone-950 text-white font-medium rounded-tr-sm shadow-xs" 
                  : "bg-white text-stone-850 rounded-tl-sm border border-stone-200 shadow-2xs font-medium"
              }`}>
                {msg.text.split("\n").map((line, li) => (
                  <p key={li} className={li > 0 ? "mt-1.5" : ""}>{line}</p>
                ))}
              </div>
              <span className="text-[9px] text-stone-400 font-bold font-mono tracking-wide mt-1 px-1">
                {msg.timestamp || "10:30 AM"}
              </span>
            </div>
          );
        })}

        {/* Typing dynamic indicator state */}
        {isAiLoading && (
          <div className="mr-auto flex flex-col max-w-[80%] items-start animate-pulse">
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-stone-200 text-stone-450 text-xs flex items-center gap-2 py-2.5">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">AGEMED escribe</span>
              <div className="flex gap-1 items-center h-2">
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION BUTTONS */}
      {chatMessages.length < 10 && (
        <div className="px-5 py-2.5 bg-white/95 border-t border-stone-200 shrink-0 select-none overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
          {[
            { prompt: "¿Dónde es mi cita?", label: "📍 Ubicación" },
            { prompt: "¿Qué debo llevar mañana?", label: "📋 Indicaciones" },
            { prompt: "¿Es indispensable el ayuno?", label: "🍽️ Ayuno" },
            { prompt: "Ver mis recetas médicas anteriores", label: "💊 Recetas" }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickQuestion(item.prompt)}
              className="py-1.5 px-3 bg-stone-50 border border-stone-200 hover:border-stone-400 text-stone-800 text-[10px] font-bold rounded-lg transition active:scale-97 cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* CHAT INPUT FORM */}
      <form 
        onSubmit={(e) => handleSendMessage(e)}
        className="p-3.5 bg-white border-t border-stone-200 flex gap-2 items-center shrink-0"
      >
        <input 
          type="text"
          value={userChatInput}
          onChange={(e) => setUserChatInput(e.target.value)}
          placeholder="Escriba su consulta médica..."
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-semibold focus:ring-1 focus:ring-stone-400 focus:outline-none placeholder-stone-400 text-stone-850"
          disabled={isAiLoading}
        />
        <button
          type="submit"
          disabled={!userChatInput.trim() || isAiLoading}
          className="w-11 h-11 bg-stone-950 hover:bg-stone-900 text-white rounded-xl flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Send className="w-4.5 h-4.5 text-white stroke-[2]" />
        </button>
      </form>

    </div>
  );
}
