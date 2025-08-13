
export const mathjaxConfig = {
  tex: {
    inlineMath: [['\\(', '\\)'], ['$', '$']],
    displayMath: [['\\[', '\\]'], ['$$', '$$']],
    processEscapes: true,
    processEnvironments: true,
    packages: ['base', 'ams', 'noerrors', 'noundefined', 'autoload'],
  },
  chtml: {
    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
    displayAlign: 'center',
    displayIndent: '0em'
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    includeHtmlTags: ['div', 'span', 'p', 'li']
  },
  startup: {
    typeset: false
  }
};
