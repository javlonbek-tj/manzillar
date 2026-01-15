import { useState } from "react";
import { Pencil, Trash2, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardItem, TabType, Address, Region, District, Mahalla, Street } from "@/types/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardTableProps {
  activeTab: TabType;
  data: DashboardItem[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (item: DashboardItem) => void;
  onDelete: (item: DashboardItem) => void;
  onView?: (item: DashboardItem) => void;
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md transition-all duration-200 cursor-pointer group/copy hover:bg-blue-100/50 dark:hover:bg-gray-700/80"
          >
            <span className="text-gray-600 dark:text-gray-400 group-hover/copy:text-blue-600 dark:group-hover/copy:text-blue-400 font-medium transition-colors">
              {code}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 text-blue-500 shrink-0 transition-opacity" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 transition-colors [&_[data-slot=tooltip-arrow]]:hidden">
          {copied ? "Nusxa olindi!" : "Buferga saqlash"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DashboardTable({
  activeTab,
  data,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onView,
}: DashboardTableProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <table className="relative w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
              T/R
            </th>

            {activeTab === "addresses" ? (
              <>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Hudud
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Tuman
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Mahalla
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Ko'cha
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Uy raqami
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Koordinatalar
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                   Qo'shimcha ma'lumot
                </th>
              </>
            ) : activeTab === "mahallas" ? (
              <>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Viloyat
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Tuman
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  UzKad nomi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Geonames nomi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  UzKad kodi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  APU kodi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  1C kodi
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Optimallashgan
                </th>
              </>
            ) : activeTab === "streets" ? (
              <>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Viloyat
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Tuman
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Nomi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Turi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Kodi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Mahalla bog'lanishi
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Avvalgi nomi
                </th>
              </>
            ) : (
              <>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Nomi
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                  Soato kodi
                </th>
              </>
            )}
            <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
              Amallar
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  activeTab === "addresses" ? 9 : activeTab === "mahallas" ? 10 : activeTab === "streets" ? 9 : 4
                }
                className="px-6 py-12 text-center"
              >
                <div className="text-sm text-gray-800 dark:text-gray-400 font-medium">
                  Ma'lumot topilmadi
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isHidden =
                activeTab === "mahallas" && (item as Mahalla).hidden;
              return (
                <tr
                  key={item.id}
                  className={`group transition-all duration-200 ${
                    isHidden
                      ? "bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 grayscale opacity-60 hover:opacity-70"
                      : (index % 2 !== 0) 
                        ? "bg-gray-50/50 dark:bg-gray-700/20 hover:bg-gray-100/80 dark:hover:bg-gray-700/40" 
                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300"
                  >
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {activeTab === "addresses" ? (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Address).regionName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Address).districtName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Address).mahallaName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Address).streetName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary">
                        {(item as Address).houseNumber || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-800">
                        {(item as Address).latitude.toFixed(6)}, {(item as Address).longitude.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-800 italic">
                        {(item as Address).description || "—"}
                      </td>
                    </>
                  ) : activeTab === "mahallas" ? (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Mahalla).district.region.nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Mahalla).district.nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {(item as Mahalla).uzKadName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <CopyableCode code={(item as Mahalla).code} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {(item as Mahalla).geoCode || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {(item as Mahalla).oneId || "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(item as Mahalla).hidden && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </td>
                    </>
                  ) : activeTab === "streets" ? (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Street).district.region.nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                        {(item as Street).district.nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {(item as Street).nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                          {(item as Street).type || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <CopyableCode code={(item as Street).code} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {(item as Street)?.mahalla?.nameUz || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic">
                        {(item as Street).oldName || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {(item as Region | District).nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <CopyableCode code={(item as Region | District).code} />
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TooltipProvider delayDuration={200}>
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onView && onView(item)}
                              className="h-8 w-8 cursor-pointer rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/40 dark:text-blue-400 transition-all active:scale-95"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 [&_[data-slot=tooltip-arrow]]:hidden">
                            Ko'rish
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onEdit(item)}
                              className="h-8 w-8 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 [&_[data-slot=tooltip-arrow]]:hidden">
                            Tahrirlash
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onDelete(item)}
                              className="h-8 w-8 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/40 dark:text-red-400 transition-all active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 [&_[data-slot=tooltip-arrow]]:hidden">
                            O'chirish
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
