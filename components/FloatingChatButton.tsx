import React, { useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

interface FloatingChatButtonProps {
  onOpenChat: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onOpenChat }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Main Button Container with animations */}
      <div className="relative animate-float">
        {/* Pulsing gradient rings - multiple for emphasis */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-75 blur-xl animate-pulse"></div>
        <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-50 blur-lg animate-ping"></div>
        
        {/* Main Floating Button */}
        <button
          onClick={onOpenChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-125 hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] flex items-center justify-center overflow-hidden z-10"
          aria-label="Open SPOT AI Chat"
        >
          {/* Animated spinning gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Icon with bounce animation */}
          <MessageCircle className="w-9 h-9 relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
          
          {/* Sparkle icon in corner */}
          <div className="absolute top-1 right-1 z-10">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse drop-shadow-lg" />
          </div>
        </button>

        {/* Extra emphasis: rotating gradient border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-60 blur-md animate-gradient-shift pointer-events-none" style={{ backgroundSize: '200% 200%' }}></div>
      </div>
    </div>
  );
};
