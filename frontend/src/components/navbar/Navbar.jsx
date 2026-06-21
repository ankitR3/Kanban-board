import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronDown, 
  Calendar, 
  Sparkles, 
  Settings, 
  Users, 
  LayoutGrid, 
  FolderArchive, 
  ClipboardList, 
  Bolt, 
  Check, 
  Plus,
  Kanban,
  Bell,
  HelpCircle,
  CreditCard,
  Laptop,
  LogOut,
  User,
  Folder
} from 'lucide-react';
import { useHomeStore } from '../../store/useHomeStore.js';


export default function Navbar() {
  const { 
    workspaces, 
    activeWorkspace, 
    addWorkspace, 
    setActiveWorkspace 
  } = useHomeStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
    addWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setIsCreating(false);
    setDropdownOpen(false);
  };

  // Get first letter of workspace name for avatar badge
  const workspaceInitial = activeWorkspace ? activeWorkspace.charAt(0).toUpperCase() : 'A';

  // Generate consistent gradients for workspaces based on name length/hash
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

  const activeGradient = getWorkspaceGradient(activeWorkspace);

  return (
    <header className="h-11 px-3 pt-1 flex items-center justify-between relative select-none z-50 w-full">
      
      {/* ── LEFT SECTION: WORKSPACE SELECTOR ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Workspace Switcher Trigger */}
        <div className="relative">
          <div 
            onClick={toggleDropdown}
            className="flex items-center gap-2 hover:bg-white/[0.06] px-2 py-1 rounded-md transition-all duration-200 cursor-pointer text-gray-200"
          >
            {/* Folder Icon */}
            <Folder size={16} className="text-amber-400 fill-amber-400" />
            {/* Workspace Title */}
            <span className="text-[13px] font-medium text-gray-200 line-clamp-1 max-w-[160px]">
              {activeWorkspace || 'Winterfell'}
            </span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Transparent Backdrop to close dropdown on click outside */}
          {dropdownOpen && (
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={toggleDropdown}
            />
          )}

          {/* Switcher Dropdown Panel */}
          {dropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-80 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 z-50 flex flex-col gap-3.5 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {!isCreating ? (
                <>
                  {/* Active Workspace Banner Card */}
                  <div className="flex flex-col gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white font-extrabold text-base shadow-md`}>
                        {workspaceInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white text-xs line-clamp-1">
                          {activeWorkspace}
                        </span>
                        <span className="text-[9px] text-[#A855F7] font-semibold tracking-wider uppercase">
                          Free Forever · Upgrade
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full">
                      <button className="flex-1 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-white/[0.05] transition-all duration-150 cursor-pointer">
                        <Settings size={13} className="text-gray-400" />
                        Settings
                      </button>
                      <button className="flex-1 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-white/[0.05] transition-all duration-150 cursor-pointer">
                        <Users size={13} className="text-gray-400" />
                        People
                      </button>
                    </div>
                  </div>

                  {/* Manage Menu Items */}
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase px-1">
                      Manage
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                        <LayoutGrid size={13} className="text-gray-400" />
                        <span>Apps</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                        <FolderArchive size={13} className="text-gray-400" />
                        <span>Templates</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                        <ClipboardList size={13} className="text-gray-400" />
                        <span>Custom Fields</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                        <Bolt size={13} className="text-gray-400" />
                        <span>Automations</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.06] my-0.5" />

                  {/* Workspaces list */}
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase px-1">
                      Workspaces
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1.5 max-h-28 overflow-y-auto pr-1 kanban-scroll">
                      {workspaces.map((ws) => {
                        const isSelected = ws === activeWorkspace;
                        const wsGradient = getWorkspaceGradient(ws);
                        return (
                          <div
                            key={ws}
                            onClick={() => {
                              setActiveWorkspace(ws);
                              setDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150 border border-transparent
                              ${isSelected ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 border-violet-500/20 text-white font-medium shadow-[0_2px_10px_rgba(139,92,246,0.08)]' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded bg-gradient-to-br ${wsGradient} flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-sm`}>
                                {ws.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate">{ws}</span>
                            </div>
                            {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.06]" />

                  {/* Footer add button */}
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-md shadow-violet-600/15 transition-all duration-200 cursor-pointer w-full border-0"
                  >
                    <Plus size={14} />
                    Create Workspace
                  </button>
                </>
              ) : (
                /* Inline Workspace Creation Form */
                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-3 py-1">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Create New Workspace
                    </h4>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Workspace Name"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="w-full bg-[#161824] border border-[#272B3C] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all duration-150"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700/80 text-xs text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer font-medium border-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWorkspaceName.trim()}
                      className={`px-3.5 py-1.5 text-xs text-white rounded-lg font-bold transition-all border-0 cursor-pointer
                        ${newWorkspaceName.trim() ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/15' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
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
          {/* "/" Shortcut Indicator */}
          <kbd className="absolute right-3 px-1.5 py-0.5 rounded border border-[#444] bg-[#333] text-[11px] text-gray-400 font-mono select-none pointer-events-none">
            /
          </kbd>
        </div>
      </div>

      {/* ── RIGHT SECTION: ACTIONS & PROFILE ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* + CREATE PROJECT Button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[12px] font-semibold rounded-md hover:bg-gray-200 transition-all duration-150 cursor-pointer border-0 tracking-wide"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>CREATE PROJECT</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center p-0.5 hover:bg-white/[0.06] rounded-full cursor-pointer transition-all duration-150 group select-none"
          >
            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 overflow-hidden">
              <span>AR</span>
            </div>
          </div>

          {profileDropdownOpen && (
            <>
              {/* Transparent Backdrop to close on click outside */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setProfileDropdownOpen(false)}
              />
              
              {/* Profile Dropdown Panel */}
              <div 
                className="absolute top-full right-0 mt-2 w-64 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 z-50 flex flex-col gap-3.5 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User info card */}
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 shadow-sm shrink-0">
                    AR
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-white text-xs truncate">Ankit Raj</span>
                    <span className="text-[10px] text-gray-400 truncate">ankit.raj@example.com</span>
                  </div>
                </div>

                {/* Account and preferences menu items */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                    <User size={13} className="text-gray-400" />
                    <span>Profile & Account</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                    <Settings size={13} className="text-gray-400" />
                    <span>Preferences</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300 hover:text-white cursor-pointer transition-all duration-150">
                    <CreditCard size={13} className="text-gray-400" />
                    <span>Billing & Plan</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06]" />

                {/* Theme switcher */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Laptop size={13} className="text-gray-400" />
                    <span>Theme</span>
                  </div>
                  <span className="text-[10px] text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded">Dark Mode</span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06]" />

                {/* Logout */}
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-xs text-gray-400 cursor-pointer transition-all duration-150">
                  <LogOut size={13} className="text-gray-400 shrink-0" />
                  <span>Sign Out</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </header>
  );
}
