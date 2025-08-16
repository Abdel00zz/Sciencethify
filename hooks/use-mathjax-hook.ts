// hooks/useMathJax.ts
import { useEffect, useCallback } from 'react';

export const useMathJax = () => {
  // Force le re-typeset de tout le document
  const typesetDocument = useCallback(() => {
    const MathJax = (window as any).MathJax;
    if (MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise().catch((err: any) => {
        console.warn('MathJax global typeset error:', err);
      });
    }
  }, []);

  // Force le re-typeset d'un élément spécifique
  const typesetElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    const MathJax = (window as any).MathJax;
    if (MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([element]).catch((err: any) => {
        console.warn('MathJax element typeset error:', err);
      });
    }
  }, []);

  // Re-typeset automatique après les changements de DOM
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      // Vérifier si des éléments avec des formules ont été ajoutés
      const hasNewMath = mutations.some(mutation => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          return addedNodes.some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              return element.textContent?.includes('\\(') || 
                     element.textContent?.includes('\\[') ||
                     element.querySelector?.('.MathJax');
            }
            return false;
          });
        }
        return false;
      });

      if (hasNewMath) {
        // Débounce pour éviter les appels multiples
        setTimeout(typesetDocument, 100);
      }
    });

    // Observer uniquement le contenu principal, pas tout le document
    const mainContent = document.querySelector('main');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [typesetDocument]);

  return { typesetDocument, typesetElement };
};