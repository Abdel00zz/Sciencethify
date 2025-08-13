
import React, { useState, useEffect, useRef } from 'react';
import mathService from '../../services/mathService';
import Spinner from './Spinner';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Composant robuste pour rendre une chaîne contenant du HTML et du LaTeX.
 * Utilise un service MathJax personnalisé pour garantir un rendu correct.
 */
const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [renderedContent, setRenderedContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Si le contenu est vide, ne rien rendre
  if (!content || content.trim() === '') {
    return null;
  }

  useEffect(() => {
    let isMounted = true;

    const renderContent = async () => {
      setIsLoading(true);
      
      try {
        // Utiliser le service MathJax personnalisé pour rendre le contenu
        const rendered = await mathService.renderContent(content);
        
        if (isMounted) {
          setRenderedContent(rendered);
          
          // Attendre un petit délai pour s'assurer que le DOM est mis à jour
          setTimeout(() => {
            if (isMounted && containerRef.current) {
              // Re-typeset l'élément pour s'assurer que tout est rendu
              mathService.typesetElement(containerRef.current).then(() => {
                if (isMounted) {
                  setIsLoading(false);
                }
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Erreur de rendu MathRenderer:', error);
        if (isMounted) {
          // En cas d'erreur, afficher le contenu brut
          setRenderedContent(content);
          setIsLoading(false);
        }
      }
    };

    renderContent();

    return () => {
      isMounted = false;
    };
  }, [content]);

  return (
    <div ref={containerRef} className={`${className || ''} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm z-10 rounded-lg min-h-[4rem]">
          <Spinner size="sm" />
        </div>
      )}
      <div 
        style={{ 
          opacity: isLoading ? 0 : 1, 
          transition: 'opacity 0.3s ease-in-out' 
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
    </div>
  );
};

export default MathRenderer;
