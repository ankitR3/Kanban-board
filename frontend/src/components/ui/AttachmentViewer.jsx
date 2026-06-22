import { X, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AttachmentViewer({ attachments, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const att = attachments[current];
  const isImage = att?.type?.startsWith('image/');
  const isPdf   = att?.type === 'application/pdf';

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setCurrent((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrent((i) => Math.min(attachments.length - 1, i + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [attachments.length, onClose]);

  if (!att) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* ── Header ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isPdf && <FileText size={15} className="text-red-400 shrink-0" />}
          <span className="text-white text-sm font-medium truncate max-w-[400px]">{att.name}</span>
          {attachments.length > 1 && (
            <span className="text-gray-500 text-xs shrink-0">
              {current + 1} / {attachments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={att.url}
            download={att.name}
            title="Download"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-all border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="flex items-center justify-center w-full h-full pt-14 pb-4 px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={att.url}
            alt={att.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
            draggable={false}
          />
        )}

        {isPdf && (
          <iframe
            src={att.url}
            title={att.name}
            className="w-full h-full rounded-lg border border-white/10 bg-white"
            style={{ maxWidth: '900px' }}
          />
        )}

        {!isImage && !isPdf && (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <FileText size={48} />
            <p className="text-sm">{att.name}</p>
            <a
              href={att.url}
              download={att.name}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              Download file
            </a>
          </div>
        )}
      </div>

      {/* ── Prev / Next arrows ── */}
      {attachments.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((i) => Math.max(0, i - 1)); }}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((i) => Math.min(attachments.length - 1, i + 1)); }}
            disabled={current === attachments.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* ── Thumbnail strip (if multiple) ── */}
      {attachments.length > 1 && (
        <div
          className="absolute bottom-4 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {attachments.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setCurrent(i)}
              className={`w-10 h-10 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                i === current ? 'border-white scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              {a.type?.startsWith('image/') ? (
                <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                  <FileText size={16} className="text-red-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
