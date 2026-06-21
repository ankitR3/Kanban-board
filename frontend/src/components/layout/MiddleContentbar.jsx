import { Search, LayoutDashboard } from 'lucide-react';
import { useHomeStore } from '../../store/useHomeStore.js';
import { SidebarEnum } from '../../constants/enums.js';

export default function MiddleContentbar() {
  const { activeTab } = useHomeStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Kanban', active: true },
  ];

  const getTitle = () => {
    if (activeTab === SidebarEnum.HOME)     return 'Home';
    if (activeTab === SidebarEnum.PROJECTS) return 'Projects';
    if (activeTab === SidebarEnum.INVITE)   return 'Invite';
    if (activeTab === SidebarEnum.UPGRADE)  return 'Upgrade';
    return 'Home';
  };

  return (
    <aside className="w-56 h-full bg-[#121212] flex flex-col py-4 px-2 rounded-l-md border border-[#1F1F1F] overflow-y-auto">

      {/* Title + icons */}
      <div className="flex items-center justify-between px-3 mb-4 shrink-0">
        <h2 className="text-white font-medium text-base">{getTitle()}</h2>
        <div className="flex items-center gap-2 text-gray-500">
          <Search size={14} className="cursor-pointer hover:text-white mt-1" />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 shrink-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm transition-all
                ${item.active
                  ? 'bg-[#2A2A2A] text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}