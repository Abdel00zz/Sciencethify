// Service personnalisé pour gérer MathJax de façon plus robuste
declare global {
  interface Window {
    MathJax: any;
  }
}

export class MathService {
  private static instance: MathService;
  private isReady = false;
  private readyPromise: Promise<void>;
  private readyResolve: (() => void) | null = null;

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.readyResolve = resolve;
    });
    this.initializeMathJax();
  }

  public static getInstance(): MathService {
    if (!MathService.instance) {
      MathService.instance = new MathService();
    }
    return MathService.instance;
  }

  private async initializeMathJax(): Promise<void> {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Configuration de MathJax
    window.MathJax = {
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
        typeset: false,
        ready: () => {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.promise.then(() => {
            this.isReady = true;
            console.log('MathJax ready');
            if (this.readyResolve) {
              this.readyResolve();
            }
          });
        }
      }
    };

    // Charger MathJax si pas déjà chargé
    if (!document.querySelector('#MathJax-script')) {
      const script = document.createElement('script');
      script.id = 'MathJax-script';
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  public async waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  public async renderContent(content: string): Promise<string> {
    await this.waitForReady();
    
    if (!content || content.trim() === '') {
      return '';
    }

    // Préprocesser le contenu LaTeX
    const processedContent = this.preprocessLatex(content);
    
    // Créer un élément temporaire pour le rendu
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      // Forcer le rendu MathJax
      if (window.MathJax && window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise([tempDiv]);
      }
      
      // Récupérer le contenu rendu
      const renderedContent = tempDiv.innerHTML;
      return renderedContent;
    } catch (error) {
      console.error('Erreur de rendu MathJax:', error);
      return processedContent;
    } finally {
      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);
    }
  }

  private preprocessLatex(content: string): string {
    return content
      .replace(/\$\$([^$]+?)\$\$/g, '\\[$1\\]') // Convertir $$ en \[ \]
      .replace(/(?<!\\)\$([^$\n]+?)\$/g, '\\($1\\)') // Convertir $ en \( \) mais éviter ceux déjà échappés
      .replace(/\\begin\{([^}]+)\}/g, '\\begin{$1}') // S'assurer que les environnements sont correctement formatés
      .replace(/\\end\{([^}]+)\}/g, '\\end{$1}');
  }

  public async typesetElement(element: HTMLElement): Promise<void> {
    await this.waitForReady();
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.error('Erreur de typeset MathJax:', error);
      }
    }
  }
}

export default MathService.getInstance();