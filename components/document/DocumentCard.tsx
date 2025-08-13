
import React, { useState, useRef } from 'react';
import { Document } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import ConfirmModal from '../modals/ConfirmModal';
import NewDocumentModal from '../modals/NewDocumentModal';
import { Link } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';
import { MoreVertical, Pencil, Copy, Trash2, FileJson2, FileText, Book, Calendar } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface DocumentCardProps {
  document: Document;
  isRecent?: boolean;
}

const DocumentCardAction: React.FC<{onClick: (e: React.MouseEvent) => void, icon: React.ReactNode, label: string, className?: string}> = ({ onClick, icon, label, className }) => (
    <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${className}`}>
        {icon}
        <span>{label}</span>
    </button>
);


const DocumentCard: React.FC<DocumentCardProps> = ({ document, isRecent = false }) => {
  const { deleteDocument, duplicateDocument } = useDocuments();
  const { t, settings } = useSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);
  
  const actionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(actionsRef, () => setActionsOpen(false));


  const handleDelete = () => {
    deleteDocument(document.id);
    setDeleteModalOpen(false);
  };

  const handleExportJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionsOpen(false);
  };
  
  const lastModified = document.lastModified ? new Date(document.lastModified) : new Date(document.date);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setActionsOpen(false);
  };
  
  const highlightClass = isRecent ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50';

  return (
    <>
      <li className={`relative transition-colors duration-200 ${highlightClass}`}>
        <Link to={`/document/${document.id}`} className="block">
          <div className="flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 rounded-xl">
            <div className="flex-shrink-0 mr-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-1">{document.title}</p>
              <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2"><Book size={16} className="text-indigo-500" /><span className="font-medium">{document.className}</span></div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /><span className="font-medium">{document.schoolYear}</span></div>
              </div>
            </div>
            <div className="hidden md:flex flex-shrink-0 items-center gap-8 ml-8 mr-6 text-sm">
               <div className="text-center">
                 <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{document.exercises.length}</p>
                 <p className="text-gray-500 dark:text-gray-400 text-xs">{t('dashboard.documentCard.exercises')}</p>
               </div>
               <div className="text-right">
                 <p className="text-gray-600 dark:text-gray-300 font-medium">{t('dashboard.documentCard.lastModified')}</p>
                 <p className="text-gray-500 dark:text-gray-400 text-xs">{lastModified.toLocaleDateString(settings.language)}</p>
               </div>
            </div>
          </div>
        </Link>
        <div ref={actionsRef} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <Tooltip text={t('tooltips.actions')}>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setActionsOpen(c => !c)}>
                    <MoreVertical size={20} />
                </Button>
            </Tooltip>
            {isActionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg z-20 border border-gray-200 dark:border-gray-800 p-2 space-y-1 animate-scale-in origin-top-right">
                <DocumentCardAction onClick={(e) => handleAction(e, () => setEditModalOpen(true))} icon={<Pencil size={16} />} label={t('actions.edit')} />
                <DocumentCardAction onClick={(e) => handleAction(e, () => duplicateDocument(document.id))} icon={<Copy size={16} />} label={t('actions.duplicate')} />
                <DocumentCardAction onClick={handleExportJson} icon={<FileJson2 size={16} />} label={t('actions.exportJson')} />
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                <DocumentCardAction onClick={(e) => handleAction(e, () => setDeleteModalOpen(true))} icon={<Trash2 size={16} />} label={t('actions.delete')} className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400" />
            </div>
            )}
        </div>
      </li>

      <NewDocumentModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} documentToEdit={document} />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`${t('actions.delete')} Document`}
      >
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {`${t('actions.delete')} "${document.title}"?`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('modals.confirm.text')}
        </p>
      </ConfirmModal>
    </>
  );
};

export default React.memo(DocumentCard);