import { create } from 'zustand';

import { SidebarEnum } from '../constants/enums.js';

const STORAGE_KEY = 'kanban_active_workspace';

const getSavedWorkspace = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveWorkspace = (workspace) => {
  try {
    if (workspace) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

export const useHomeStore = create((set) => ({
  activeTab: SidebarEnum.HOME,
  setActiveTab: (item) => set({ activeTab: item }),

  // Restored from localStorage immediately on page load — no flicker
  activeWorkspace: getSavedWorkspace(),
  setActiveWorkspace: (workspace) => {
    saveWorkspace(workspace);
    set({ activeWorkspace: workspace });
  },
}));