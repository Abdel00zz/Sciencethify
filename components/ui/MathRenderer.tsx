
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MathJax } from 'better-react-mathjax';
import Spinner from './Spinner';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * A robust component to render a string containing HTML and LaTeX.
 * It shows a loading spinner while MathJax is typesetting the content,
 * preventing any "flash of un-compiled content" and providing clear visual feedback.
 */
const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  // If content is empty or just whitespace, return null
  if (!content || content.trim() === '') {
    return null;
  }
  
  const [isTypesetting, setIsTypesetting] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Pre-process content to ensure proper delimiters are recognized
  const processedContent = content
    .replace(/\$\$([^$]+?)\$\$/g, '\\[$1\\]') // Convert $$ to \[ \]
    .replace(/(?<!\\)\$([^$\n]+?)\$/g, '\\($1\\)'); // Convert $ to \( \) but avoid already escaped

  const onDone = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Add a small delay to ensure rendering is complete
    timeoutRef.current = setTimeout(() => {
      setIsTypesetting(false);
    }, 100);
  }, []);

  // Force re-typesetting when content changes
  useEffect(() => {
    setIsTypesetting(true);
    
    // Fallback timeout in case onTypeset doesn't fire
    const fallbackTimeout = setTimeout(() => {
      setIsTypesetting(false);
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content]);

  // Additional effect to handle MathJax re-processing
  useEffect(() => {
    const processWithMathJax = async () => {
      if (containerRef.current && window.MathJax && window.MathJax.typesetPromise) {
        try {
          await window.MathJax.typesetPromise([containerRef.current]);
        } catch (error) {
          console.warn('MathJax typesetting error:', error);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(processWithMathJax, 50);
    return () => clearTimeout(timer);
  }, [processedContent]);

  return (
    <div ref={containerRef} className={`${className || ''} relative`}>
      {isTypesetting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm z-10 rounded-lg min-h-[4rem]">
          <Spinner size="sm" />
        </div>
      )}
      {/*
        - `key={processedContent}` forces a re-mount and re-typeset when content changes.
        - `onTypeset` should fire when the new instance is ready.
        - We use opacity for a smooth fade-in transition.
      */}
      <MathJax
        key={processedContent}
        onTypeset={onDone}
        style={{ opacity: isTypesetting ? 0 : 1, transition: 'opacity 0.2s ease-in' }}
      >
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </MathJax>
    </div>
  );
};

export default MathRenderer;
