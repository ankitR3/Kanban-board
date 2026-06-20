import { X } from 'lucide-react';

export default function Dialog({ isOpen, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1c1c] border border-gray-800 rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        {children}

        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}