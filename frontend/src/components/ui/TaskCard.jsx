import { Flag, Tag, AlignLeft, Ban, Check, Pencil, Trash, Paperclip, FileText } from 'lucide-react';
import { useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card.jsx';
import PillDropdown from './PillDropdown.jsx';
import AttachmentViewer from './AttachmentViewer.jsx';
import { Priority, Category } from '../../constants/enums.js';

const priorityOptions = [
  { value: Priority.LOW,    label: 'Low',    color: '#9ca3af' },
  { value: Priority.MEDIUM, label: 'Medium', color: '#3b82f6' },
  { value: Priority.HIGH,   label: 'High',   color: '#f59e0b' },
];

const categoryOptions = [
  { value: Category.GENERAL,     label: 'General' },
  { value: Category.BUG,         label: 'Bug' },
  { value: Category.FEATURE,     label: 'Feature' },
  { value: Category.ENHANCEMENT, label: 'Enhancement' },
];

const priorityColor = {
  LOW:    '#9ca3af',
  MEDIUM: '#3b82f6',
  HIGH:   '#f59e0b',
};

const priorityLabel = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
};

export default function TaskCard({ task, onEdit, onDelete, onMarkDone, onUpdate }) {
  const hasPriority    = Boolean(task.priority);
  const hasCategory    = Boolean(task.category);
  const hasDescription = Boolean(task.description?.trim());

  const attachments     = task.attachments || [];
  const imageAttachments = attachments.filter((a) => a.type?.startsWith('image/'));
  const fileAttachments  = attachments.filter((a) => !a.type?.startsWith('image/'));
  const hasAttachments  = attachments.length > 0;

  const setPriority = (value) => onUpdate?.(task.id, { priority: value });
  const setCategory = (value) => onUpdate?.(task.id, { category: value });

  const [viewerIndex, setViewerIndex] = useState(null);

  const openViewer = (e, index) => {
    e.stopPropagation();
    setViewerIndex(index);
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className="bg-[#212121] rounded-md mb-2.5 cursor-pointer transition-all relative"
      style={{
        boxShadow: 'inset 0 2px 0 0 rgba(42,42,42,1), inset 0 -1px 0 0 rgba(0,0,0,0.3), 0 1px 0px rgba(0,0,0,0.1)'
      }}
    >
      {/* ── Image attachment preview (top of card, like ClickUp) ── */}
      {imageAttachments.length > 0 && (
        <div
          className={`w-full overflow-hidden rounded-t-md ${
            imageAttachments.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {imageAttachments.slice(0, 4).map((img) => {
            const globalIdx = attachments.indexOf(img);
            return (
              <img
                key={img.id}
                src={img.url}
                alt={img.name}
                onClick={(e) => openViewer(e, globalIdx)}
                className="w-full object-cover max-h-48 cursor-zoom-in hover:brightness-90 transition-all"
                style={imageAttachments.length > 1 ? { height: '80px' } : {}}
              />
            );
          })}
        </div>
      )}

      <div className="p-3">
      {/* Title & Actions Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-white text-sm font-medium break-words flex-1 pr-1">{task.title}</p>
        
        {/* Actions Container */}
        <div 
          className="flex items-center gap-0.5 bg-[#2E2E2E]/60 border border-[#3E3E3E] rounded px-1 py-0.5 shrink-0" 
          onClick={(e) => e.stopPropagation()}
        >
          {task.column !== 'DONE' && (
            <button
              onClick={() => onMarkDone?.(task)}
              title="Mark as complete"
              className="p-1 rounded text-gray-400 hover:text-green-400 hover:bg-[#3E3E3E] transition-all cursor-pointer"
            >
              <Check size={12} />
            </button>
          )}
          <button
            onClick={() => onEdit?.(task)}
            title="Edit task name"
            className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-[#3E3E3E] transition-all cursor-pointer"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            title="Delete task"
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#3E3E3E] transition-all cursor-pointer"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>

      {/* Description indicator — hover card shows preview, click opens full task */}
      {hasDescription && (
        <div className="mb-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div
                className="text-gray-500 hover:text-gray-300 w-fit"
                onClick={(e) => e.stopPropagation()}
              >
                <AlignLeft size={14} />
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="start">
              <p className="text-gray-400 text-xs font-medium mb-1">Description</p>
              <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">
                {task.description}
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      )}
      {!hasDescription && <div className="mb-3" />}

      {/* Icon row — priority + category + file attachments */}
      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        {/* Priority dropdown */}
        <PillDropdown
          icon={Flag}
          iconColor={hasPriority ? priorityColor[task.priority] : undefined}
          label={hasPriority ? priorityLabel[task.priority] : ''}
        >
          {(close) => (
            <>
              <p className="text-gray-500 text-[12px] px-3 pt-1 pb-2">Priority</p>
              {priorityOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { setPriority(opt.value); close(); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-md text-white hover:bg-[#333] cursor-pointer"
                >
                  <Flag size={12} fill={opt.color} color={opt.color} /> {opt.label}
                </div>
              ))}
              <div className="border-t border-[#3a3a3a] mt-1 pt-1">
                <div
                  onClick={() => { setPriority(null); close(); }}
                  className="flex items-center gap-2 px-3 py-2 text-md text-gray-400 hover:bg-[#333] cursor-pointer"
                >
                  <Ban size={12} /> Clear
                </div>
              </div>
            </>
          )}
        </PillDropdown>

        {/* Category dropdown */}
        <PillDropdown
          icon={Tag}
          label={hasCategory ? task.category.toLowerCase() : ''}
        >
          {(close) => (
            <>
              <p className="text-gray-500 text-[12px] px-3 pt-1 pb-2">Category</p>
              {categoryOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { setCategory(opt.value); close(); }}
                  className="px-3 py-1 text-md text-white hover:bg-[#333] cursor-pointer"
                >
                  {opt.label}
                </div>
              ))}
              <div className="border-t border-[#3a3a3a] mt-1 pt-1">
                <div
                  onClick={() => { setCategory(null); close(); }}
                  className="flex items-center gap-2 px-3 py-2 text-md text-gray-400 hover:bg-[#333] cursor-pointer"
                >
                  <Ban size={12} /> Clear
                </div>
              </div>
            </>
          )}
        </PillDropdown>

        {/* Non-image file attachments — show as clickable pills */}
        {fileAttachments.map((file) => {
          const globalIdx = attachments.indexOf(file);
          return (
            <button
              key={file.id}
              onClick={(e) => openViewer(e, globalIdx)}
              title={file.name}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2a2a2a] border border-[#383838] text-gray-400 hover:text-white hover:border-[#555] transition-all text-[11px] max-w-[120px] cursor-pointer"
            >
              <FileText size={11} className="shrink-0 text-red-400" />
              <span className="truncate">{file.name}</span>
            </button>
          );
        })}

        {/* Attachment count badge if images present */}
        {imageAttachments.length > 0 && (
          <span className="flex items-center gap-1 text-gray-500 text-[11px]">
            <Paperclip size={11} />
            {attachments.length}
          </span>
        )}
      </div>
      </div>

      {/* Attachment lightbox viewer */}
      {viewerIndex !== null && (
        <AttachmentViewer
          attachments={attachments}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}