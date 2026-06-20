import { useState, useEffect, useRef } from 'react';
import { Flag, Tag, Paperclip, ChevronDown, X, Ban, FileText } from 'lucide-react';
import { Column, Priority, Category } from '../../constants/enums.js';
import PillDropdown from './PillDropdown.jsx';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_MB   = 5;

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

const columnLabels = {
  [Column.TODO]:        'TO DO',
  [Column.IN_PROGRESS]: 'IN PROGRESS',
  [Column.DONE]:        'DONE',
};

export default function TaskModal({ isOpen, onClose, onSave, initialTask }) {
  const isEditing = Boolean(initialTask);
  const fileInputRef = useRef(null);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [column,      setColumn]      = useState(Column.TODO);
  const [priority,    setPriority]    = useState(null);
  const [category,    setCategory]    = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [fileError,   setFileError]   = useState('');

  /* Populate fields when the modal opens or the task changes */
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setColumn(initialTask.column || Column.TODO);
        setPriority(initialTask.priority || null);
        setCategory(initialTask.category || null);
        setAttachments(Array.isArray(initialTask.attachments) ? initialTask.attachments : []);
      } else {
        setTitle('');
        setDescription('');
        setColumn(Column.TODO);
        setPriority(null);
        setCategory(null);
        setAttachments([]);
      }
      setFileError('');
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const selectedPriority = priorityOptions.find((p) => p.value === priority);
  const selectedCategory = categoryOptions.find((c) => c.value === category);

  /* ── File upload handler ── */
  const handleFileChange = (e) => {
    setFileError('');
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" is not supported. Use PNG, JPG, GIF, WebP or PDF.`);
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds ${MAX_FILE_MB} MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: file.name, url: ev.target.result, type: file.type },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // allow re-selecting the same file
  };

  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  /* ── Save ── */
  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title:       title.trim(),
      description,
      column,
      priority:    priority || Priority.MEDIUM,
      category:    category || Category.GENERAL,
      attachments,
    });
  };

  return (
    <div
      data-testid="task-modal"
      className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-20"
      onClick={onClose}
    >
      <div
        className="bg-[#191919] border border-[#2a2a2a] rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 shrink-0">
          <span className="text-sm pb-3 text-white border-b-2 border-white font-medium">
            {isEditing ? 'Edit Task' : 'Task'}
          </span>
          <button
            data-testid="modal-close"
            onClick={onClose}
            className="mb-3 w-6.5 h-6.5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
        <div className="border-b border-[#2a2a2a]" />

        {/* Scrollable body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Task type pill */}
          <div className="flex items-center gap-2 mb-5">
            <button className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#262626] border border-[#3a3a3a] rounded-md px-2.5 py-1.5">
              ● Task <ChevronDown size={12} />
            </button>
          </div>

          {/* Title input */}
          <input
            data-testid="task-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Name"
            autoFocus
            className="w-full bg-transparent text-gray-200 text-xl outline-none placeholder-gray-600 mb-4"
          />

          {/* Description */}
          <textarea
            data-testid="task-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description"
            className="w-full bg-transparent text-gray-300 text-sm outline-none placeholder-gray-600 resize-none h-20 mb-6"
          />

          {/* Property pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <PillDropdown label={columnLabels[column]} filled>
              {(close) => (
                <>
                  {Object.entries(columnLabels).map(([val, lbl]) => (
                    <div key={val} onClick={() => { setColumn(val); close(); }} className="px-3 py-2 text-xs text-white hover:bg-[#333] cursor-pointer">
                      {lbl}
                    </div>
                  ))}
                </>
              )}
            </PillDropdown>

            <PillDropdown icon={Flag} iconColor={selectedPriority?.color} label={selectedPriority ? `${selectedPriority.label} priority` : 'Priority'}>
              {(close) => (
                <>
                  <p className="text-gray-500 text-[12px] px-3 pt-1 pb-2">Priority</p>
                  {priorityOptions.map((opt) => (
                    <div key={opt.value} onClick={() => { setPriority(opt.value); close(); }} className="flex items-center gap-2 px-3 py-1.5 text-md text-white hover:bg-[#333] cursor-pointer">
                      <Flag size={12} fill={opt.color} color={opt.color} /> {opt.label}
                    </div>
                  ))}
                  <div className="border-t border-[#3a3a3a] mt-1 pt-1">
                    <div onClick={() => { setPriority(null); close(); }} className="flex items-center gap-2 px-3 py-2 text-md text-gray-400 hover:bg-[#333] cursor-pointer">
                      <Ban size={12} /> Clear
                    </div>
                  </div>
                </>
              )}
            </PillDropdown>

            <PillDropdown icon={Tag} label={selectedCategory ? selectedCategory.label : 'Category'}>
              {(close) => (
                <>
                  <p className="text-gray-500 text-[12px] px-3 pt-1 pb-2">Category</p>
                  {categoryOptions.map((opt) => (
                    <div key={opt.value} onClick={() => { setCategory(opt.value); close(); }} className="px-3 py-1 text-md text-white hover:bg-[#333] cursor-pointer">
                      {opt.label}
                    </div>
                  ))}
                  <div className="border-t border-[#3a3a3a] mt-1 pt-1">
                    <div onClick={() => { setCategory(null); close(); }} className="flex items-center gap-2 px-3 py-2 text-md text-gray-400 hover:bg-[#333] cursor-pointer">
                      <Ban size={12} /> Clear
                    </div>
                  </div>
                </>
              )}
            </PillDropdown>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Attachments</span>
              <button
                data-testid="attach-button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#262626] border border-[#3a3a3a] rounded-md px-2.5 py-1 transition-colors cursor-pointer"
              >
                <Paperclip size={12} /> Attach file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
                className="hidden"
                data-testid="file-input"
                onChange={handleFileChange}
              />
            </div>

            {/* Validation error */}
            {fileError && (
              <p data-testid="file-error" className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                ⚠ {fileError}
              </p>
            )}

            {/* Attachment list */}
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} data-testid="attachment-item" className="flex items-center gap-3 bg-[#262626] border border-[#333] rounded-lg p-2.5">
                    {att.type.startsWith('image/') ? (
                      <img src={att.url} alt={att.name} className="w-10 h-10 rounded object-cover shrink-0 border border-[#3a3a3a]" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-gray-400" />
                      </div>
                    )}
                    <span className="text-xs text-gray-300 truncate flex-1">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-xs italic">No attachments yet. Supports PNG, JPG, GIF, WebP, PDF (max {MAX_FILE_MB} MB).</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end bg-[#111111] px-6 py-4 border-t border-[#2a2a2a] shrink-0">
          <div className="flex items-center rounded-md overflow-hidden">
            <button
              data-testid="save-task-btn"
              onClick={handleSave}
              className="text-[14px] font-medium text-gray-900 bg-white hover:bg-gray-200 px-4 py-1.5 hover:cursor-pointer transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
            <button className="text-gray-900 bg-white hover:bg-gray-200 px-2 py-2 border-l border-gray-300 hover:cursor-pointer">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}