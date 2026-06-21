import { create } from 'zustand';
import { SidebarEnum } from '../constants/enums.js';

// Helper to safely parse local storage
const getLocalStorageItem = (key, defaultValue) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.error(`Error parsing localStorage for ${key}:`, e);
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage for ${key}:`, e);
  }
};

export const useHomeStore = create((set) => ({
  activeTab: SidebarEnum.HOME,
  setActiveTab: (item) => set({ activeTab: item }),

  // Workspace states
  workspaces: getLocalStorageItem('kanban_workspaces', ["Ankit Raj's Workspace"]),
  activeWorkspace: getLocalStorageItem('kanban_active_workspace', "Ankit Raj's Workspace"),
  workspaceTaskMap: getLocalStorageItem('kanban_workspace_task_map', {}),

  addWorkspace: (name) => set((state) => {
    const trimmed = name.trim();
    if (!trimmed || state.workspaces.includes(trimmed)) return {};
    const newWorkspaces = [...state.workspaces, trimmed];
    setLocalStorageItem('kanban_workspaces', newWorkspaces);
    setLocalStorageItem('kanban_active_workspace', trimmed);
    return {
      workspaces: newWorkspaces,
      activeWorkspace: trimmed
    };
  }),

  setActiveWorkspace: (name) => set(() => {
    setLocalStorageItem('kanban_active_workspace', name);
    return { activeWorkspace: name };
  }),

  assignTaskToWorkspace: (taskId, workspaceName) => set((state) => {
    const newMap = { ...state.workspaceTaskMap, [taskId]: workspaceName };
    setLocalStorageItem('kanban_workspace_task_map', newMap);
    return { workspaceTaskMap: newMap };
  })
}));