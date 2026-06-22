import { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  Check, 
  Plus,
  Folder,
  Trash2
} from 'lucide-react';
import { useHomeStore } from '../../store/useHomeStore.js';
import useSocket from '../../hooks/useSocket.js';


export default function Navbar() {
  const { activeWorkspace, setActiveWorkspace } = useHomeStore();
  const { workspaces, createWorkspace, deleteWorkspace } = useSocket();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setIsCreating(false);
    setNewWorkspaceName('');
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setIsCreating(false);
    setDropdownOpen(false);
  };

  // Generate consistent gradients for workspaces based on name
  const getWorkspaceGradient = (name) => {
    if (!name) return 'from-violet-500 to-indigo-500';
    const gradients = [
      'from-teal-500 to-emerald-500',
      'from-violet-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-amber-500 to-orange-500',
      'from-blue-500 to-cyan-500',
      'from-fuchsia-500 to-violet-500'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  const workspaceName = activeWorkspace?.name ?? null;
  const workspaceInitial = workspaceName ? workspaceName.charAt(0).toUpperCase() : '?';
  const activeGradient = getWorkspaceGradient(workspaceName);

  return (
    <header className="h-11 px-3 pt-1 flex items-center justify-between relative select-none z-50 w-full">
      
      {/* ── LEFT SECTION: WORKSPACE SELECTOR ── */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="relative">
          <div 
            onClick={toggleDropdown}
            className="flex items-center gap-2 hover:bg-white/[0.06] px-2 py-1 rounded-md transition-all duration-200 cursor-pointer text-gray-200"
          >
            <Folder size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-[13px] font-medium text-gray-200 line-clamp-1 max-w-[160px]">
              {workspaceName ?? 'No Workspace'}
            </span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Backdrop */}
          {dropdownOpen && (
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={toggleDropdown}
            />
          )}

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-80 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-4 z-50 flex flex-col gap-3.5 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {!isCreating ? (
                <>

                  {/* Workspaces list */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-1">
                      Workspaces
                    </span>
                    <div className="flex flex-col gap-0.5 mt-2 max-h-32 overflow-y-auto pr-1 kanban-scroll">
                      {workspaces.length === 0 ? (
                        <p className="text-xs text-gray-600 px-3 py-2">No workspaces yet.</p>
                      ) : (
                        workspaces.map((ws) => {
                          const isSelected = ws.id === activeWorkspace?.id;
                          const wsGradient = getWorkspaceGradient(ws.name);
                          return (
                            <div
                              key={ws.id}
                              onClick={() => {
                                setActiveWorkspace(ws);
                                setDropdownOpen(false);
                              }}
                              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-all duration-150 border border-transparent
                                ${isSelected ? 'bg-[#222] border-[#333] text-white font-medium' : 'text-gray-400 hover:bg-[#1e1e1e] hover:text-white'}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-6 h-6 rounded bg-gradient-to-br ${wsGradient} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                  {ws.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{ws.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isSelected && <Check size={15} className="text-emerald-400" />}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWorkspace(ws.id);
                                  }}
                                  title="Delete workspace"
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 text-gray-500 transition-all duration-150 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#2a2a2a]" />

                  {/* Create Workspace Button */}
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-[#222] hover:bg-[#2a2a2a] rounded-lg border border-[#333] transition-all duration-200 cursor-pointer w-full"
                  >
                    <Plus size={15} />
                    Create Workspace
                  </button>
                </>
              ) : (
                /* Inline Workspace Creation Form */
                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-3 py-1">
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Create New Workspace
                    </h4>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Workspace Name"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-150"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3.5 py-1.5 bg-[#222] hover:bg-[#2a2a2a] text-[13px] text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer font-medium border border-[#333]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWorkspaceName.trim()}
                      className={`px-3.5 py-1.5 text-[13px] text-white rounded-lg font-semibold transition-all border cursor-pointer
                        ${newWorkspaceName.trim() ? 'bg-white/10 hover:bg-white/15 border-[#444]' : 'bg-[#1a1a1a] text-neutral-500 cursor-not-allowed border-[#2a2a2a]'}`}
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER SECTION: SEARCH BAR ── */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative flex items-center w-full max-w-md">
          <Search size={14} className="absolute left-3 text-gray-500 z-10 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full h-8 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-[13px] text-gray-300 pl-9 pr-12 select-none focus:outline-none transition-all duration-200
              ${searchFocused ? 'border-[#555] bg-[#333]' : 'hover:border-[#444]'}`}
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 rounded border border-[#444] bg-[#333] text-[11px] text-gray-400 font-mono select-none pointer-events-none">
            /
          </kbd>
        </div>
      </div>

    </header>
  );
}
