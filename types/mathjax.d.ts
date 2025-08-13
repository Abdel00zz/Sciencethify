declare global {
  interface Window {
    MathJax: {
      startup: {
        promise: Promise<void>;
        defaultReady: () => void;
      };
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      tex2chtml: (tex: string, options?: any) => HTMLElement;
      tex2svg: (tex: string, options?: any) => SVGElement;
    };
  }
}

export {};