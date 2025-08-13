
// Déclarations TypeScript pour MathJax
declare global {
  interface Window {
    MathJax: {
      startup: {
        defaultReady: () => void;
        promise: Promise<void>;
      };
      typesetPromise: () => Promise<void>;
      tex2chtml: (tex: string, options?: any) => HTMLElement;
      tex2svg: (tex: string, options?: any) => SVGElement;
    };
  }
}

export const mathjaxConfig = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    packages: ['base', 'ams', 'noerrors', 'noundefined', 'autoload'],
    macros: {
      // Macros communes pour éviter les erreurs
      R: '{\\mathbb{R}}',
      N: '{\\mathbb{N}}',
      Z: '{\\mathbb{Z}}',
      Q: '{\\mathbb{Q}}',
      C: '{\\mathbb{C}}'
    }
  },
  chtml: {
    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
    adaptiveCSS: true,
    matchFontHeight: false,
    scale: 1
  },
  svg: {
    fontCache: 'local'
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
    renderActions: {
      addMenu: [0, '', '']
    },
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  startup: {
    ready: () => {
      console.log('MathJax configuration loaded');
      if (typeof window !== 'undefined' && window.MathJax) {
        window.MathJax.startup.defaultReady();
        window.MathJax.startup.promise.then(() => {
          console.log('MathJax ready for typesetting');
        }).catch((error: any) => {
          console.error('MathJax startup error:', error);
        });
      }
    }
  },
  loader: {
    load: ['[tex]/ams', '[tex]/noerrors', '[tex]/noundefined', '[tex]/autoload']
  }
};
