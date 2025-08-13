import React, { useState, useCallback } from 'react';
import { Document, ExportOptions } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { generateHtmlForPrint } from '../../services/htmlGenerator';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import { Printer, Download, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
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
  
  const [options, setOptions] = useState<ExportOptions>({
    columns: 1,
    fontSize: 11,
    theme: 'default',
    showDifficulty: true,
    showKeywords: true,
    showTitles: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : isNaN(Number(value)) ? value : Number(value),
    }));
  }, []);

  const handleExport = useCallback(async () => {
    setIsGenerating(true);
    try {
      const printHtml = await generateHtmlForPrint(document, settings, options);
      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;

      if (isMobile) {
        // On mobile, trigger download directly
        link.download = `${document.title.replace(/[^a-z0-9]/gi, '_') || 'document'}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(t('modals.export.download_started'), 'success');
      } else {
        // On desktop, open in a new tab for printing
        window.open(url, '_blank');
      }
      
      // Delay revoking the URL to ensure the new tab or download can start
      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error("Error generating file:", error);
      addToast(t('modals.export.generation_error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [document, settings, options, addToast, isMobile, t]);

  const optionsPanel = (
    <div className="space-y-6 p-6 md:p-8">
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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out-cubic" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('modals.export.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={document.title}>{document.title}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={24} />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {optionsPanel}
        </main>

        <footer className="flex-shrink-0 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleExport} isLoading={isGenerating}>
            {isMobile ? <Download size={16} className="mr-2" /> : <Printer size={16} className="mr-2" />}
            {isMobile ? t('modals.export.download') : t('modals.export.print_preview')}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(ExportModal);