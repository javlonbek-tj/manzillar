import { useState } from 'react';
import { 
  Layers, 
  Grid2X2, 
  Waypoints, 
  Navigation, 
  Home, 
  CaseSensitive, 
  LandPlot, 
  Hash, 
  CheckSquare, 
  Square,
  Eye,
  EyeOff,
  X,
  Check
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface for the filter state from useMapFilters
interface MapLayersControlProps {
  filterState: {
    showMahallas: boolean;
    setShowMahallas: (v: boolean) => void;
    showMavzes: boolean;
    setShowMavzes: (v: boolean) => void;
    showStreets: boolean;
    setShowStreets: (v: boolean) => void;
    showProperties: boolean;
    setShowProperties: (v: boolean) => void;
    showStreetPolygons: boolean;
    setShowStreetPolygons: (v: boolean) => void;
    showStreetLabels: boolean;
    setShowStreetLabels: (v: boolean) => void;
    showPropertyLabels: boolean;
    setShowPropertyLabels: (v: boolean) => void;
    showAddressing: boolean;
    setShowAddressing: (v: boolean) => void;
    [key: string]: any;
  };
}

export function MapLayersControl({ filterState }: MapLayersControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const layers = [
    { id: 'mahallas', label: "Mahallalar", icon: Grid2X2, value: filterState.showMahallas, setValue: filterState.setShowMahallas },
    { id: 'mavzes', label: "Mavzelar", icon: Waypoints, value: filterState.showMavzes, setValue: filterState.setShowMavzes },
    { id: 'streets', label: "Ko'cha chiziqlari", icon: Navigation, value: filterState.showStreets, setValue: filterState.setShowStreets },
    { id: 'streetPolygons', label: "Poligonli ko'chalar", icon: LandPlot, value: filterState.showStreetPolygons, setValue: filterState.setShowStreetPolygons },
    { id: 'properties', label: "Mulklar", icon: Home, value: filterState.showProperties, setValue: filterState.setShowProperties },
    { id: 'streetLabels', label: "Ko'cha nomlari", icon: CaseSensitive, value: filterState.showStreetLabels, setValue: filterState.setShowStreetLabels },
    { id: 'propertyLabels', label: "Uy raqamlari", icon: Hash, customIcon: <span className="text-sm font-bold">#</span>, value: filterState.showPropertyLabels, setValue: filterState.setShowPropertyLabels }, // Using span for property labels to match prev
    { id: 'addressing', label: "Manzillar (Yangi)", icon: Hash, value: filterState.showAddressing, setValue: filterState.setShowAddressing },
  ];

  const allVisible = layers.every(l => l.value);
  const someVisible = layers.some(l => l.value);

  const toggleAll = () => {
    const targetState = !allVisible;
    layers.forEach(layer => layer.setValue(targetState));
  };

  return (
    <div className="flex flex-col gap-2 font-sans">
      <div className={`
        flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300
        ${isOpen ? 'w-64 p-2' : 'w-12 p-1 bg-transparent border-none shadow-none'}
      `}>
        {/* Toggle Button (Visible when collapsed) */}
        {!isOpen && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-teal-500/20"
                >
                  <Layers className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Qatlamlarni boshqarish
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Expanded Content */}
        {isOpen && (
          <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Qatlamlar</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Master Toggle */}
            <button
              onClick={toggleAll}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors"
            >
              <div className="flex items-center gap-2">
                {allVisible ? <Eye className="w-4 h-4 text-teal-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Barchasi</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${allVisible ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${allVisible ? 'left-4.5 translate-x-0' : 'left-0.5'}`}></div> 
                 {/* CSS Toggle switch simulation if no component available */}
                 <div className={`absolute top-1 left-1 bg-white w-2 h-2 rounded-full transition-all duration-300 ${allVisible ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
            
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-1" />

            {/* List */}
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => layer.setValue(!layer.value)}
                  className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md transition-colors ${layer.value ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {layer.customIcon ? layer.customIcon : <layer.icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm ${layer.value ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                      {layer.label}
                    </span>
                  </div>
                  
                  {/* Status Indicator */}
                  {layer.value && <Check className="w-4 h-4 text-teal-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
