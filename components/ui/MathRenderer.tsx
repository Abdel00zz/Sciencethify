
import React, { useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    // Fallback : force MathJax to typeset when content changes (utile en production)
    if (typeof window !== 'undefined' && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise()
        .then(() => setIsTypesetting(false))
        .catch(() => setIsTypesetting(false));
    }
  }, [content]);

  // This callback is likely firing correctly, but if the content is empty,
  // nothing appears, which is the bug.
  const onDone = useCallback(() => {
    setIsTypesetting(false);
  }, []);

  return (
    <div className={`${className || ''} relative`}>
      {isTypesetting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm z-10 rounded-lg min-h-[4rem]">
          <Spinner size="sm" />
        </div>
      )}
      {/*
        - `key={content}` forces a re-mount and re-typeset when content changes.
        - `onLoad` should fire when the new instance is ready.
        - We use opacity for a smooth fade-in transition.
      */}
      <MathJax
        key={content}
        onTypeset={onDone}
        style={{ opacity: isTypesetting ? 0 : 1, transition: 'opacity 0.2s ease-in' }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="modern-lists"
        />
      </MathJax>
      <style jsx>{`
        .modern-lists ol {
          list-style: none;
          padding-left: 0;
          counter-reset: level1;
        }
        .modern-lists li {
          list-style: none;
          position: relative;
          padding-left: 2.5em;
          margin-bottom: 0.75em;
          counter-increment: level1;
        }
        .modern-lists li::before {
          content: counter(level1);
          position: absolute;
          left: 0;
          top: 0;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          text-align: center;
          border-radius: 50%;
          background-color: #e0e7ff;
          color: #4338ca;
          font-weight: 600;
          font-size: 0.75rem;
        }
        .modern-lists ol ol {
          counter-reset: level2;
          margin-top: 0.5em;
        }
        .modern-lists ol ol > li {
          counter-increment: level2;
        }
        .modern-lists ol ol > li::before {
          content: counter(level1) "." counter(level2);
          background-color: #f0f9ff;
          color: #0284c7;
        }
        .modern-lists ol ol ol {
          counter-reset: level3;
        }
        .modern-lists ol ol ol > li {
          counter-increment: level3;
        }
        .modern-lists ol ol ol > li::before {
          content: counter(level1) "." counter(level2) "." counter(level3);
          background-color: #f1f5f9;
          color: #64748b;
          font-size: 0.65rem;
        }

        :global(.dark) .modern-lists li::before {
            background-color: #3730a3;
            color: #e0e7ff;
        }
        :global(.dark) .modern-lists ol ol > li::before {
            background-color: #075985;
            color: #f0f9ff;
        }
        :global(.dark) .modern-lists ol ol ol > li::before {
            background-color: #475569;
            color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default MathRenderer;
