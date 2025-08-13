
import React, { useState, useCallback } from 'react';
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
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </MathJax>
    </div>
  );
};

export default MathRenderer;
