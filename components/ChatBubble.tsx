"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ChatBubbleProps {
  children: ReactNode;
  delay?: number;
}

export function ChatBubble({ children, delay = 0 }: ChatBubbleProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="animate-fade-up max-w-[85%] self-start">
      <div className="bg-white border-2 border-slate-200 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-sm">
        {children}
      </div>
    </div>
  );
}
