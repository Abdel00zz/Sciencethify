import { Document, AppSettings, ExportOptions, Exercise } from '../types';

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

const MATHJAX_SCRIPT = `
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\\\(', '\\\\)']],
      displayMath: [['\\\\[', '\\\\]']],
      processEscapes: true,
      processEnvironments: true,
      packages: ['base', 'ams', 'noerrors', 'noundefined', 'autoload'],
      macros: {
        R: '{\\\\mathbb{R}}',
        N: '{\\\\mathbb{N}}',
        Z: '{\\\\mathbb{Z}}',
        Q: '{\\\\mathbb{Q}}',
        C: '{\\\\mathbb{C}}'
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
        console.log('MathJax configuration loaded for print');
        if (window.MathJax) {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.promise.then(() => {
            console.log('MathJax initial typesetting complete for print');
            // Forcer un nouveau rendu après le chargement
            setTimeout(() => {
              if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().then(() => {
                  console.log('MathJax re-typesetting complete');
                }).catch((error) => {
                  console.error('MathJax re-typesetting error:', error);
                });
              }
            }, 500);
          }).catch((error) => {
            console.error('MathJax startup error:', error);
          });
        }
      }
    },
    loader: {
      load: ['[tex]/ams', '[tex]/noerrors', '[tex]/noundefined', '[tex]/autoload']
    }
  };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
`;

const AUTOPRINT_SCRIPT = `
<script>
  let printAttempted = false;
  
  function attemptPrint() {
    if (printAttempted) return;
    printAttempted = true;
    
    console.log('Attempting to print...');
    try {
      window.print();
    } catch (error) {
      console.error('Print error:', error);
    }
  }
  
  function waitForMathJaxAndPrint() {
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(() => {
        console.log('MathJax ready, waiting for typesetting...');
        // Attendre un peu plus pour s'assurer que tout est rendu
        setTimeout(() => {
          if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().then(() => {
              console.log('MathJax typesetting complete, printing...');
              setTimeout(attemptPrint, 500);
            }).catch((error) => {
              console.error('MathJax typesetting error:', error);
              setTimeout(attemptPrint, 1000);
            });
          } else {
            setTimeout(attemptPrint, 1000);
          }
        }, 1000);
      }).catch((error) => {
        console.error('MathJax startup error:', error);
        setTimeout(attemptPrint, 2000);
      });
    } else {
      // Fallback si MathJax n'est pas disponible
      console.log('MathJax not available, printing anyway...');
      setTimeout(attemptPrint, 2000);
    }
  }
  
  window.addEventListener('load', () => {
    console.log('Page loaded, waiting for MathJax...');
    waitForMathJaxAndPrint();
  });
  
  window.addEventListener('afterprint', () => {
    console.log('Print dialog closed, closing window...');
    setTimeout(() => {
      window.close();
    }, 100);
  });
  
  // Fallback timeout au cas où quelque chose se passe mal
  setTimeout(() => {
    if (!printAttempted) {
      console.log('Fallback print timeout reached');
      attemptPrint();
    }
  }, 10000);
</script>
`;


const getStyles = (options: ExportOptions) => {
  let themeStyles = '';
  if (options.theme === 'ink-saver') {
    themeStyles = `
      .page { color: #404040; }
      .doc-title { color: #000000; }
      .doc-meta { color: #6b7280; }
      .exercise-main-title { color: #111827; }
      .exercise-subtitle { color: #404040; }
      .star-rating span { color: #a1a1aa; }
      .keyword-tag { background-color: transparent; color: #525252; border: 1px solid #d4d4d8; }
      .exercise-content ol > li::before { color: #404040; }
      .exercise-content ol ol > li::before, .exercise-content ol ol ol > li::before { color: #525252; }
      .exercise:not(:first-child)::before { color: #d1d5db; }
      .content { ${options.columns > 1 ? 'column-rule-color: #e5e7eb;' : ''} }
    `;
  } else if (options.theme === 'high-contrast') {
    themeStyles = `
      .page { color: #000000; font-weight: 600; }
      .doc-title { color: #000000; }
      .doc-meta { color: #000000; }
      .exercise-main-title, .exercise-subtitle { color: #000000; }
      .star-rating span { color: #000000; }
      .keyword-tag { background-color: transparent; color: #000000; border: 1px solid #000000; font-weight: 600;}
      .exercise-content ol li::before { color: #000000; font-weight: 600; }
      .exercise:not(:first-child)::before { color: #000000; font-weight: 600; }
      .content { ${options.columns > 1 ? 'column-rule: 1px solid #000000;' : ''} }
    `;
  }

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
      
      body {
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      @media screen {
        body {
            padding: 2rem; /* Padding for preview */
            background-color: #e2e8f0; /* Light desk color */
        }
        .dark body {
            background-color: #0f172a; /* Dark desk color */
        }
      }

      .page {
        font-family: 'Inter', sans-serif;
        line-height: 1.5;
        font-size: ${options.fontSize}pt;
        color: #1f2937;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        
        /* A4 paper simulation */
        background: white;
        width: 21cm;
        min-height: 29.7cm;
        padding: 1.5cm;
        margin: 0 auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      header { text-align: center; margin-bottom: 2.5rem; }
      .doc-title { font-family: 'Manrope', sans-serif; font-size: 2.0em; font-weight: 800; margin: 0; color: #111827; }
      .doc-meta { display: flex; justify-content: space-between; width: 100%; max-width: 400px; margin: 0.5rem auto 0; font-size: 0.9em; color: #4b5563; }
      
      .content { 
        column-count: ${options.columns}; 
        column-gap: 1.5cm;
        ${options.columns > 1 ? 'column-rule: 1px dotted #cbd5e1;' : ''}
      }
      
      .exercise {
        margin-bottom: 1.2rem;
        padding-top: 1.2rem;
      }
      .exercise:first-child { padding-top: 0; }
      
      .exercise:not(:first-child) {
        padding-top: 2rem;
        margin-top: 2rem;
        position: relative;
      }

      .exercise:not(:first-child)::before {
        content: '∗ ∗ ∗';
        position: absolute;
        top: 0.5rem;
        left: 50%;
        transform: translateX(-50%);
        color: #94a3b8;
        font-size: 1.2em;
        font-weight: 400;
        letter-spacing: 0.5em;
      }
      
      .exercise-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.6rem;
      }
      .exercise-title-block { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; line-height: 1.3; }
      
      .exercise-main-title {
        font-family: 'Manrope', sans-serif;
        font-size: 1.15em;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }
      .exercise-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 1em;
        margin: 0;
        font-weight: 600;
        font-style: italic;
        color: #4b5563;
      }
      
      .star-rating { font-size: 1em; letter-spacing: 2px; white-space: nowrap; }
      .star-rating span { display: inline-block; color: #f59e0b; }
      
      .keywords {
        margin-top: 0.25rem;
        margin-bottom: 0.75rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .keyword-tag { font-size: 0.75em; background-color: #f3f4f6; color: #4b5563; padding: 0.15rem 0.5rem; border-radius: 4px; }
      
      .exercise-content p, .exercise-content ul { margin-top: 0.4rem; margin-bottom: 0.4rem; }
      .exercise-content ul { list-style-position: outside; padding-left: 1.5em; }
      
      .exercise-content ol { list-style-type: none; counter-reset: item; padding-left: 0; margin-top: 0.4rem; margin-bottom: 0.4rem; }
      .exercise-content ol > li {
        display: block;
        position: relative;
        padding-left: 2.2em; /* Provide space for the marker */
        margin-bottom: 0.5em;
        font-size: 0.95em; /* Reduce font size as requested */
      }
      .exercise-content ol > li > p:first-child { display: inline; }
      
      /* Level 1: 1., 2., etc. */
      .exercise-content ol > li::before {
        content: counter(item) ".";
        counter-increment: item;
        position: absolute;
        left: 0;
        top: 0;
        width: 1.7em; /* Allocate space for double-digit numbers */
        text-align: right;
        font-weight: 600;
        color: #1f2937;
      }
      
      /* Level 2: a), b), etc. */
      .exercise-content ol ol {
        counter-reset: subitem;
        margin-top: 0.5em;
        padding-left: 0;
      }
      .exercise-content ol ol > li::before {
        content: counter(subitem, lower-alpha) ")";
        counter-increment: subitem;
        font-weight: normal;
        color: #4b5563;
      }
      
      /* Level 3: i., ii., etc. */
      .exercise-content ol ol ol {
        counter-reset: subsubitem;
        padding-left: 0;
      }
      .exercise-content ol ol ol > li::before {
        content: counter(subsubitem, lower-roman) ".";
        counter-increment: subsubitem;
      }

      @media print {
        body { padding: 0; background-color: #ffffff !important; font-weight: normal !important; }
        .page {
          margin: 0;
          box-shadow: none;
          border: none;
          width: auto;
          min-height: auto;
          padding: 1.5cm;
          background: #ffffff !important;
          color: #000000 !important;
        }
      }
      ${themeStyles}
    </style>
  `;
};

const renderStar = (isFilled: boolean) => `<span class="star">${isFilled ? '★' : '☆'}</span>`;

const renderExercise = (exercise: Exercise, index: number, options: ExportOptions) => {
  const starsHtml = Array.from({length: 5}, (_, i) => renderStar(i < exercise.difficulty)).join('');

  return `
    <div class="exercise">
      <div class="exercise-header">
        <div class="exercise-title-block">
          <h3 class="exercise-main-title">Exercice ${index + 1}</h3>
          ${options.showTitles && exercise.title ? `<p class="exercise-subtitle">${exercise.title}</p>` : ''}
        </div>
        ${options.showDifficulty ? `<div class="star-rating">${starsHtml}</div>` : ''}
      </div>
      ${options.showKeywords && exercise.keywords && exercise.keywords.length > 0 ? `
        <div class="keywords">
          ${exercise.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
        </div>` : ''}
      <div class="exercise-content tex2jax_process">
        ${exercise.content}
      </div>
    </div>
  `;
};

export const generateHtmlForExport = (
  doc: Document,
  settings: AppSettings,
  options: ExportOptions
): string => {
  const formattedDate = new Date(doc.date).toLocaleDateString(settings.language, { year: 'numeric', month: 'long', day: 'numeric' });
  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return `
    <!DOCTYPE html>
    <html lang="${settings.language}" class="${isDarkMode ? 'dark' : ''}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${doc.title}</title>
      ${getStyles(options)}
      ${MATHJAX_SCRIPT}
    </head>
    <body oncontextmenu="return false;">
      <div class="page">
        <header>
          <h1 class="doc-title">${doc.title}</h1>
          <div class="doc-meta">
            <span>${settings.teacherName || doc.className}</span>
            <span>${doc.schoolYear}</span>
            <span>${formattedDate}</span>
          </div>
        </header>
        <main class="content">
          ${doc.exercises.map((ex, i) => renderExercise(ex, i, options)).join('')}
        </main>
      </div>
    </body>
    </html>
  `;
};


export const generateHtmlForPrint = (
  doc: Document,
  settings: AppSettings,
  options: ExportOptions
): string => {
    const content = generateHtmlForExport(doc, settings, options);
    // Inject print-specific script and class
    return content
        .replace('</body>', `${AUTOPRINT_SCRIPT}</body>`)
        .replace('<body oncontextmenu="return false;">', '<body class="print-mode" oncontextmenu="return false;">');
}