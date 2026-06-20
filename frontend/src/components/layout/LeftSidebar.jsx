import { Home, FolderKanban, GitPullRequest, Bot, Users, MoreHorizontal, UserPlus, ArrowUpCircle } from 'lucide-react';
import { useHomeStore } from '../../store/useHomeStore';
import { SidebarEnum } from '../../constants/enums';

export default function LeftSidebar() {
    const { activeTab, setActiveTab } = useHomeStore();

    function handleTabChange(tab) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        setActiveTab(tab);
    }

    const menuItems = [
        { value: SidebarEnum.HOME, icon: Home, label: 'Home' },
        { value: SidebarEnum.PROJECTS, icon: FolderKanban, label: 'Projects' },
    ];

    const bottomItems = [
    { value: SidebarEnum.INVITE, icon: UserPlus, label: 'Invite' },
    { value: SidebarEnum.UPGRADE, icon: ArrowUpCircle, label: 'Upgrade' },
  ];

    return (
        <aside className="w-16 h-full bg-[#121212] flex flex-col items-center py-3 rounded-md border border-[#1F1F1F]">
            {/* Top nav */}
            <nav className="flex flex-col items-center gap-1 flex-1 w-full px-1 pt-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    return (
                        <div
                        key={item.value}
                        onClick={() => handleTabChange(item.value)}
                        className={`w-full flex flex-col items-center gap-1 py-2 px-1 rounded-lg cursor-pointer transition-all
                            ${isActive
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-200'
                            }`}
                        >
                        <Icon size={18} />
                        <span className="text-[10px] leading-none">{item.label}</span>
                        </div>
                    );
                })}
            </nav>

            {/* Bottom nav */}
            <div className="flex flex-col items-center gap-1 w-full px-1 pb-2">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    return (
                        <div
                        key={item.value}
                        onClick={() => handleTabChange(item.value)}
                        className={`w-full flex flex-col items-center gap-1 py-2 px-1 rounded-lg cursor-pointer transition-all
                            ${isActive
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-200'
                            }`}
                        >
                        <Icon size={18} />
                        <span className="text-[10px] leading-none">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </aside>
    )
}