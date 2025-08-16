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
  const [isMathJaxReady, setIsMathJaxReady] = useState(false);

  useEffect(() => {
    // Vérifier si MathJax est déjà prêt
    if ((window as any).MathJaxReady) {
      setIsMathJaxReady(true);
      return;
    }

    // Attendre que MathJax soit prêt
    const checkMathJax = setInterval(() => {
      if ((window as any).MathJax && (window as any).MathJax.startup) {
        setIsMathJaxReady(true);
        clearInterval(checkMathJax);
      }
    }, 100);

    return () => clearInterval(checkMathJax);
  }, []);

  useEffect(() => {
    if (!isMathJaxReady) return;

    const MathJax = (window as any).MathJax;
    if (!MathJax || !MathJax.typesetPromise) return;

    // Retarder légèrement pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      setIsTypesetting(true);
      MathJax.typesetPromise()
        .then(() => {
          setIsTypesetting(false);
        })
        .catch((err: any) => {
          console.warn('MathJax typeset error:', err);
          setIsTypesetting(false);
        });
    }, 50);

    return () => clearTimeout(timer);
  }, [content, isMathJaxReady]);

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
          className="modern-lists math-content"
        />
      </MathJax>
      <style jsx>{`
        .math-content {
          font-size: calc(1em - 1.5px);
        }
        .math-content .MathJax {
          font-size: inherit !important;
        }
        .math-content .MathJax_Display {
          font-size: inherit !important;
        }
        .modern-lists ol {
          list-style: none;
          padding-left: 0;
          counter-reset: level1;
        }
        .modern-lists li {
          list-style: none;
          position: relative;
          padding-left: 2.2em;
          margin-bottom: 0.75em;
          counter-increment: level1;
        }
        .modern-lists li::before {
          content: counter(level1);
          position: absolute;
          left: 0;
          top: 0.1em;
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
        
        /* Niveau 2 : a, b, c... */
        .modern-lists ol ol {
          counter-reset: level2;
          margin-top: 0.5em;
          padding-left: 0;
        }
        .modern-lists ol ol > li {
          counter-increment: level2;
          padding-left: 2.2em;
          margin-left: 0;
        }
        .modern-lists ol ol > li::before {
          content: counter(level2, lower-alpha);
          background-color: #f0f9ff;
          color: #0284c7;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          font-size: 0.75rem;
          top: 0.1em;
        }
        
        /* Niveau 3 : i, ii, iii... */
        .modern-lists ol ol ol {
          counter-reset: level3;
          padding-left: 0;
        }
        .modern-lists ol ol ol > li {
          counter-increment: level3;
          padding-left: 2.2em;
          margin-left: 0;
        }
        .modern-lists ol ol ol > li::before {
          content: counter(level3, lower-roman);
          background-color: #f0f9ff;
          color: #0284c7;
          font-size: 0.75rem;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          top: 0.1em;
        }

        /* Dark mode styles */
        :global(.dark) .modern-lists li::before {
            background-color: #3730a3;
            color: #e0e7ff;
        }
        :global(.dark) .modern-lists ol ol > li::before {
            background-color: #075985;
            color: #f0f9ff;
        }
        :global(.dark) .modern-lists ol ol ol > li::before {
            background-color: #075985;
            color: #f0f9ff;
        }
      `}</style>
    </div>
  );
};

export default MathRenderer;