import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  id: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsVisible(!isVisible);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <div className="relative inline-block ml-2 align-middle">
      <button
        type="button"
        id={`btn-${id}`}
        aria-label={`Aide pour ${id}`}
        aria-describedby={id}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={toggle}
        className="text-slate-400 hover:text-accent focus:text-accent transition-colors rounded-full p-0.5"
      >
        <HelpCircle size={18} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-50 w-64 p-3 mt-2 text-sm text-white bg-slate-800 rounded-lg shadow-xl left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
