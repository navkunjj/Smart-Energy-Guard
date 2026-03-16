import React, { useState } from 'react';
import { Send, MessageSquareText } from 'lucide-react';

const LCDMessageSender = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
          <MessageSquareText size={18} />
        </div>
        <h3 className="text-[10px] md:text-sm font-bold opacity-40 uppercase tracking-widest">LCD Interface</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message for ESP32 LCD..."
            maxLength={32}
            rows={2}
            className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm placeholder:opacity-30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
          />
          <div className="absolute bottom-3 right-3 text-[9px] md:text-[10px] font-bold opacity-30">
            {message.length}/32
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="w-full py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Send size={14} className="md:w-[16px] md:h-[16px]" />
          <span>Broadcast to LCD</span>
        </button>
      </form>
      
      <p className="mt-4 text-[9px] opacity-30 text-center italic">
        Limited to 32 chars for 16x2 LCD.
      </p>
    </div>
  );
};

export default LCDMessageSender;
