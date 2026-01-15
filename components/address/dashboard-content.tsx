"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData, TabType, DashboardItem } from "@/types/dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardPagination } from "@/hooks/use-dashboard-pagination";
import { useDashboardExport } from "@/hooks/use-dashboard-export";
import { useTheme } from 'next-themes';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs } from "./tabs";
import { DashboardFilters } from "./dashboard-filters";
import { DashboardTable } from "./dashboard-table";
import { Pagination } from "./pagination";
import { AddDialog } from "./add-dialog";
import { EditDialog } from "./edit-dialog";

export function DashboardContent({
  initialData,
  defaultTab = "regions",
}: {
  initialData: DashboardData;
  defaultTab?: TabType;
}) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedHidden, setSelectedHidden] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DashboardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { filteredData, availableDistricts } = useDashboardData(
    initialData,
    activeTab,
    searchTerm,
    selectedRegion,
    selectedDistrict
  );

  // Apply hidden filter for mahallas
  const filterByHidden = (data: DashboardItem[]) => {
    if (activeTab !== "mahallas" || selectedHidden === "") {
      return data;
    }
    const hiddenBool = selectedHidden === "true";
    return data.filter((item) => {
      if ("hidden" in item) {
        return item.hidden === hiddenBool;
      }
      return true;
    });
  };

  const finalFilteredData = filterByHidden(filteredData);

  const {
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    paginate,
    resetPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = useDashboardPagination();

  const { paginatedData, totalPages, totalItems } = paginate(finalFilteredData);

  const { isExporting, exportToExcel } = useDashboardExport();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm("");
    setSelectedRegion("");
    setSelectedDistrict("");
    setSelectedHidden("");
    resetPage();
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDistrict("");
    resetPage();
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleExport = () => {
    exportToExcel(activeTab, filteredData);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    resetPage();
  };

  const handleAddClick = () => {
    // Addresses can only be added from the map page
    if (activeTab === 'addresses') {
      return;
    }
    setAddDialogOpen(true);
  };

  const handleEdit = (item: DashboardItem) => {
    // Addresses cannot be edited from dashboard yet, but we'll show the dialog
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: DashboardItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      let url = "";
      switch (activeTab) {
        case "regions":
          url = `/api/regions/${itemToDelete.id}`;
          break;
        case "districts":
          url = `/api/districts/${itemToDelete.id}`;
          break;
        case "mahallas":
          url = `/api/mahallas/${itemToDelete.id}`;
          break;
        case "streets":
          url = `/api/streets/${itemToDelete.id}`;
          break;
        case "addresses":
          url = `/api/addresses/${itemToDelete.id}`;
          break;
      }

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting:", error);
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    router.refresh();
  };

  const handleView = (item: DashboardItem) => {
    if (activeTab === "addresses") return;

    const typeMap: Record<string, string> = {
      regions: "region",
      districts: "district",
      mahallas: "mahalla",
      streets: "street",
    };

    const type = typeMap[activeTab];
    if (type) {
      router.push(`/address-data/${type}/${item.id}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] transition-colors duration-200">
      <div className="mx-auto ">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Tabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddClick={handleAddClick}
          />

          <DashboardFilters
            activeTab={activeTab}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            selectedDistrict={selectedDistrict}
            onDistrictChange={handleDistrictChange}
            availableDistricts={availableDistricts}
            regions={initialData.regions}
            onExport={handleExport}
            isExporting={isExporting}
            canExport={filteredData.length > 0}
            selectedHidden={selectedHidden}
            onHiddenChange={setSelectedHidden}
          />

          <div className="p-4">
            <DashboardTable
              activeTab={activeTab}
              data={paginatedData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPrevious={goToPreviousPage}
              onNext={() => goToNextPage(totalPages)}
            />
          </div>
        </div>
      </div>

      <AddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        activeTab={activeTab}
        regions={initialData.regions}
        districts={initialData.districts}
        selectedRegion={selectedRegion}
        onSuccess={handleSuccess}
      />

      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        activeTab={activeTab}
        item={selectedItem}
        regions={initialData.regions}
        districts={initialData.districts}
        mahallas={initialData.mahallas}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Ushbu ma'lumotni o'chirishni xohlaysizmi?
            </AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? "text-gray-400" : ""}>
              Bu amalni qaytarib bo'lmaydi. Iltimos, ehtiyot bo'ling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className='cursor-pointer'>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
