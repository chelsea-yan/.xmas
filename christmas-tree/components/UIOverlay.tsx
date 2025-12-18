import React from 'react';
import { TreeMorphState } from '../types';
import { Trees, Sparkles } from 'lucide-react';

interface UIOverlayProps {
  currentState: TreeMorphState;
  onToggleState: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggleState }) => {
  const isTree = currentState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header */}
      <header className="flex flex-col items-center mt-6 opacity-90">
        <h3 className="text-arix-gold/80 font-sans tracking-[0.4em] text-xs uppercase mb-3 drop-shadow-sm">
          Christmas Tree
        </h3>
        <h1 className="text-5xl md:text-7xl font-serif text-arix-pale text-center tracking-wide drop-shadow-xl">
          Merry Christmas
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center mb-16 pointer-events-auto">
        <button
          onClick={onToggleState}
          className={`
            group relative px-10 py-4 bg-white/5 overflow-hidden rounded-full transition-all duration-500
            border border-arix-gold/40 hover:border-arix-gold hover:bg-arix-gold/20
            backdrop-blur-md shadow-lg shadow-arix-gold/10
          `}
        >
          <div className="flex items-center gap-3">
             {isTree ? (
               <Sparkles className="w-5 h-5 text-arix-gold group-hover:animate-spin" />
             ) : (
               <Trees className="w-5 h-5 text-arix-gold" />
             )}
             <span className="font-serif text-arix-pale text-lg tracking-widest uppercase group-hover:text-white transition-colors">
               {isTree ? "Disperse Magic" : "Make a Wish"}
             </span>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </button>
      </div>
    </div>
  );
};

export default UIOverlay;