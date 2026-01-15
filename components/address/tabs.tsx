import type { TabType } from '@/types/dashboard';
import { AddButton } from './add-button';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
}

export function Tabs({
  activeTab,
  onTabChange,
  onAddClick,
}: TabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
      <nav className="flex items-center space-x-8">
        <TabButton
          active={activeTab === "regions"}
          onClick={() => onTabChange("regions")}
        >
          Hududlar
        </TabButton>
        <TabButton
          active={activeTab === "districts"}
          onClick={() => onTabChange("districts")}
        >
          Tumanlar
        </TabButton>
        <TabButton
          active={activeTab === "mahallas"}
          onClick={() => onTabChange("mahallas")}
        >
          Mahallalar
        </TabButton>
        <TabButton
          active={activeTab === "streets"}
          onClick={() => onTabChange("streets")}
        >
          Ko'chalar
        </TabButton>
        <AddButton
          activeTab={activeTab}
          onClick={onAddClick}
        />
      </nav>
    </div>
  );
}
