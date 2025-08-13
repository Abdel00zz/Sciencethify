
import React, { useState, useCallback, useRef } from 'react';
import { Exercise } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import ExerciseEditorModal from '../modals/ExerciseEditorModal';
import ConfirmModal from '../modals/ConfirmModal';
import { MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import StarRating from '../ui/StarRating';
import MathRenderer from '../ui/MathRenderer';
import Tooltip from '../ui/Tooltip';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { MathJax } from 'better-react-mathjax';


interface ExerciseItemProps {
  docId: string;
  exercise: Exercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ docId, exercise, index, isFirst, isLast }) => {
  const { deleteExercise, reorderExercises } = useDocuments();
  const { t } = useSettings();
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(actionsRef, () => setActionsOpen(false));

  const handleDelete = useCallback(() => {
    setDeleteOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      deleteExercise(docId, exercise.id);
    }, 310);
  }, [deleteExercise, docId, exercise.id]);
  
  const handleAction = (action: () => void) => {
    action();
    setActionsOpen(false);
  };
  
  const handleMoveUp = useCallback(() => {
    if (!isFirst) {
        reorderExercises(docId, index, index - 1);
    }
  }, [isFirst, reorderExercises, docId, index]);

  const handleMoveDown = useCallback(() => {
      if (!isLast) {
          reorderExercises(docId, index, index + 1);
      }
  }, [isLast, reorderExercises, docId, index]);


  const animationClasses = isExiting
    ? 'animate-list-item-disappear'
    : 'opacity-0 animate-list-item-appear';
    
  const containerClasses = `relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800/50 flex flex-col group transition-all duration-300 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 ${animationClasses}`;

  return (
    <>
      <div 
        className={containerClasses}
        style={!isExiting ? { animationDelay: `${index * 50}ms` } : {}}
      >
        <div className="flex justify-between items-start gap-3 p-2 sm:p-3">
            <div className="flex-grow min-w-0">
                <div className="flex items-baseline gap-2">
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">Exercice {index + 1}</h4>
                    {exercise.title && (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                    {exercise.title && (
                        <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 italic">
                            <MathJax hideUntilTypeset="first" inline key={exercise.title}>
                                {exercise.title}
                            </MathJax>
                        </p>
                    )}
                </div>
            </div>
            {/* Actions container */}
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Tooltip text={t('tooltips.moveUp')}>
                     <Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50" onClick={handleMoveUp} disabled={isFirst}>
                         <ArrowUp size={24} className="text-indigo-600 dark:text-indigo-400" />
                     </Button>
                 </Tooltip>
                 <Tooltip text={t('tooltips.moveDown')}>
                     <Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50" onClick={handleMoveDown} disabled={isLast}>
                         <ArrowDown size={24} className="text-indigo-600 dark:text-indigo-400" />
                     </Button>
                 </Tooltip>
                <div ref={actionsRef} className="relative z-10">
                   <Tooltip text={t('tooltips.actions')}>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActionsOpen(c => !c)}>
                           <MoreVertical size={20} />
                       </Button>
                   </Tooltip>
                   {isActionsOpen && (
                       <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-950 rounded-xl shadow-lg z-20 border border-gray-200 dark:border-gray-800 p-2 space-y-1 animate-scale-in origin-top-right">
                           <button onClick={() => handleAction(() => setEditorOpen(true))} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                               <Pencil size={16} />
                               <span>{t('actions.edit')}</span>
                           </button>
                           <button onClick={() => handleAction(() => setDeleteOpen(true))} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400">
                               <Trash2 size={16} />
                               <span>{t('actions.delete')}</span>
                           </button>
                       </div>
                   )}
               </div>
            </div>
        </div>
        
        <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-gray-200 dark:border-gray-800">
             <div className="flex justify-between items-start mb-4">
                <StarRating rating={exercise.difficulty} size={16} />
            </div>
            {exercise.keywords && exercise.keywords.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                {exercise.keywords.map(kw => (
                    <span key={kw} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-medium">{kw}</span>
                ))}
                </div>
            )}
            <MathRenderer 
                content={exercise.content} 
                className="prose prose-sm prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
            />
        </div>
      </div>
      <ExerciseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setEditorOpen(false)}
        docId={docId}
        exerciseToEdit={exercise}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`${t('actions.delete')} Exercise`}
      >
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {`${t('actions.delete')} "${exercise.title || `Exercice ${index + 1}`}"?`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('modals.confirm.text')}
        </p>
      </ConfirmModal>
    </>
  );
};

export default React.memo(ExerciseItem);
