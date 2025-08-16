import React from 'react';
import { MathJax } from 'better-react-mathjax';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * A robust component to render a string containing HTML and LaTeX.
 * It leverages the `better-react-mathjax` library to handle typesetting.
 */
const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  // If content is empty or just whitespace, return null to avoid rendering empty containers.
  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <div className={`${className || ''} math-renderer-container`}>
      {/* 
        The `key` prop is crucial. It forces React to re-mount the MathJax component
        when the content string changes. This ensures that MathJax re-processes the new
        content instead of reusing the old, already-typeset DOM.
      */}
      <MathJax key={content}>
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="modern-lists math-content"
        />
      </MathJax>
      
      {/* The component-specific styles are defined here using styled-jsx */}
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
        
        /* Sub-level for a., b., c... */
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
          /* Use 'lower-alpha' for a, b, c... and append a dot */
          content: counter(level2, lower-alpha) ".";
          background-color: #f0f9ff;
          color: #0284c7;
          width: 1.8em;
          height: 1.8em;
          line-height: 1.8em;
          font-size: 0.75rem;
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
      `}</style>
    </div>
  );
};

export default MathRenderer;