import { create } from 'zustand';
import { SidebarEnum } from '../constants/enums.js';

export const useHomeStore = create((set) => ({
  activeTab: SidebarEnum.HOME,
  setActiveTab: (item) => set({ activeTab: item }),
}));