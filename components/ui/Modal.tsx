
import React, { ReactNode, useRef } from 'react';
import Icon from './Icon';
import { useMobile } from '../../hooks/useMobile';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const isMobile = useMobile();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const desktopContainerClasses = `fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-modal-overlay-show backdrop-blur-sm`;
  const mobileContainerClasses = `fixed inset-0 bg-gray-900/60 z-50 flex flex-col justify-end animate-modal-overlay-show backdrop-blur-sm`;
  
  const panelDesktopClasses = `bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] animate-modal-content-show`;
  const panelMobileClasses = `bg-white dark:bg-gray-900 rounded-t-xl shadow-xl w-full flex flex-col max-h-[90vh] animate-sheet-content-show`;

  return (
    <div className={isMobile ? mobileContainerClasses : desktopContainerClasses} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        ref={modalRef}
        className={isMobile ? panelMobileClasses : panelDesktopClasses}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            <Icon name="X" size={20} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <main className="p-6 overflow-y-auto flex-grow custom-scrollbar">
          {children}
        </main>
        {footer && (
          <footer className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 rounded-b-xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;