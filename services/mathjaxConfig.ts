// services/mathjaxConfig.ts

export const mathjaxConfig = {
  loader: { 
    load: ['[tex]/html', '[tex]/ams'] 
  },
  tex: {
    packages: { '[+]': ['html', 'ams'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    // Important pour éviter les problèmes de rendu
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
    processHtmlClass: 'tex2jax_process',
    ignoreHtmlClass: 'tex2jax_ignore'
  },
  startup: {
    pageReady: () => {
      // Utiliser window.MathJax au lieu de MathJax directement
      return (window as any).MathJax.startup.defaultPageReady().then(() => {
        console.log('MathJax initial typesetting complete');
      });
    },
    typeset: true  // Important : activer le typesetting automatique
  },
  svg: {
    fontCache: 'global'
  },
  chtml: {
    scale: 1,
    minScale: 0.5,
    mtextInheritFont: false,
    merrorInheritFont: true,
    mathmlSpacing: false,
    skipAttributes: {},
    exFactor: 0.5,
    displayAlign: 'center',
    displayIndent: '0'
  }
};