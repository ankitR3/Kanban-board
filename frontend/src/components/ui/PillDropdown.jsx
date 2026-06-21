import { useState } from 'react';

export default function PillDropdown({ icon: Icon, iconColor, label, children, filled, upward }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5 transition-all hover:cursor-pointer
          ${filled ? 'bg-[#3a3a3a] text-white' : 'bg-transparent text-gray-300 border border-[#3a3a3a] hover:bg-[#262626]'}`}
      >
        {Icon && <Icon size={16} fill={iconColor || 'none'} color={iconColor || 'currentColor'} />}
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className={`absolute left-0 bg-[#262626] border border-[#3a3a3a] rounded-lg shadow-xl z-20 min-w-42.5 py-1
              ${upward ? 'bottom-full mb-1' : 'top-full mt-1'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}