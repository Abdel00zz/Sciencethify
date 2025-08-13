import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, ExportOptions } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { generateHtmlForExport, generateHtmlForPrint } from '../../services/htmlGenerator';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import { Printer, Loader2, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { debounce } from '../../utils/debounce';
import { useMobile } from '../../hooks/useMobile';

interface ExportViewProps {
  document: Document;
  onClose: () => void;
}

const OptionSelect: React.FC<{
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ label, name, value, onChange, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 transition-colors"
    >
      {children}
    </select>
  </div>
);

const ExportModal: React.FC<ExportViewProps> = ({ document, onClose }) => {
  const { settings, t } = useSettings();
  const { addToast } = useToast();
  const isMobile = useMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [options, setOptions] = useState<ExportOptions>({
    columns: 1,
    fontSize: 11,
    theme: 'default',
    showDifficulty: true,
    showKeywords: true,
    showTitles: true,
  });
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  const updateScale = useCallback(debounce(() => {
    if (!iframeRef.current || !previewContainerRef.current) return;
    
    const iframe = iframeRef.current;
    const container = previewContainerRef.current;
    const PAGE_WIDTH_PX = 794; 
    
    const scale = Math.min(1, container.clientWidth / PAGE_WIDTH_PX);
    
    const htmlEl = iframe.contentDocument?.documentElement;
    if (htmlEl) {
      htmlEl.style.setProperty('zoom', scale.toString());
      htmlEl.style.setProperty('overflow', 'auto');
    }
  }, 50), []);

  useEffect(() => {
    setIsLoadingPreview(true);
    const html = generateHtmlForExport(document, settings, options);
    setPreviewHtml(html);
  }, [document, settings, options]);

  useEffect(() => {
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      updateScale.cancel();
    };
  }, [updateScale]);

  const handleOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : isNaN(Number(value)) ? value : Number(value),
    }));
  }, []);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    const printHtml = generateHtmlForPrint(document, settings, options);
    const blob = new Blob([printHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      addToast("Could not open print window. Please disable pop-up blockers.", 'error');
      setIsPrinting(false);
      URL.revokeObjectURL(url);
      return;
    }
    const timer = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(timer);
        setIsPrinting(false);
        URL.revokeObjectURL(url);
      }
    }, 500);
  }, [document, settings, options, addToast]);
  
  const handleIframeLoad = () => {
    setIsLoadingPreview(false);
    updateScale();
  };

  const optionsPanel = (
    <div className="space-y-6">
      <OptionSelect label={t('modals.export.columns')} name="columns" value={options.columns} onChange={handleOptionChange}>
        <option value="1">{t('modals.export.one_column')}</option>
        <option value="2">{t('modals.export.two_columns')}</option>
      </OptionSelect>
      <OptionSelect label={t('modals.export.fontSize')} name="fontSize" value={options.fontSize} onChange={handleOptionChange}>
        <option value="9">{t('modals.export.small')} (9pt)</option>
        <option value="11">{t('modals.export.medium')} (11pt)</option>
        <option value="13">{t('modals.export.large')} (13pt)</option>
      </OptionSelect>
      <OptionSelect label={t('modals.export.theme')} name="theme" value={options.theme} onChange={handleOptionChange}>
        <option value="default">{t('modals.export.default')}</option>
        <option value="ink-saver">{t('modals.export.inkSaver')}</option>
        <option value="high-contrast">{t('modals.export.highContrast')}</option>
      </OptionSelect>
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('modals.export.display')}</h4>
        <Checkbox label={t('modals.export.showTitles')} name="showTitles" checked={options.showTitles} onChange={handleOptionChange} />
        <Checkbox label={t('modals.export.showDifficulty')} name="showDifficulty" checked={options.showDifficulty} onChange={handleOptionChange} />
        <Checkbox label={t('modals.export.showKeywords')} name="showKeywords" checked={options.showKeywords} onChange={handleOptionChange} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-950 z-50 flex flex-col animate-fade-in" role="dialog" aria-modal="true">
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{t('modals.export.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={document.title}>{document.title}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <Button variant="primary" onClick={handlePrint} isLoading={isPrinting} disabled={isLoadingPreview}>
                    <Printer size={16} className="mr-2" />
                    {t('modals.export.print')}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Print Preview">
                    <X size={24} />
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        <aside className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto custom-scrollbar">
            {optionsPanel}
        </aside>

        <div ref={previewContainerRef} className="flex-1 bg-gray-200 dark:bg-gray-800/50 p-4 sm:p-8 overflow-auto custom-scrollbar relative shadow-inner">
             {isLoadingPreview && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800/50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            title="Export Preview"
            className={`w-full h-full border-0 transition-opacity duration-300 ${isLoadingPreview ? 'opacity-0' : 'opacity-100'}`}
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
          />
        </div>
      </main>
    </div>
  );
};

export default React.memo(ExportModal);