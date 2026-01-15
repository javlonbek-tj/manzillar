import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TabType } from '@/types/dashboard';

interface AddButtonProps {
  activeTab: TabType;
  onClick: () => void;
}

const tabLabels: Record<TabType, string> = {
  regions: "Hudud qo'shish",
  districts: "Tuman qo'shish",
  mahallas: "Mahalla qo'shish",
  streets: "Ko'cha qo'shish",
  addresses: "Manzil qo'shish",
};

export function AddButton({ activeTab, onClick }: AddButtonProps) {
  // Addresses can only be added from the map page
  if (activeTab === 'addresses') {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      className="ml-auto cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
    >
      <Plus className='w-4 h-4' />
      {tabLabels[activeTab]}
    </Button>
  );
}
