'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserAddDialog } from './user-add-dialog';
import { UserEditDialog } from './user-edit-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface User {
  id: string;
  fullName: string;
  jshshir: string;
  phoneNumber: string;
  position: string;
  status: string;
  location: string;
  locationCode: string;
  region?: string;
  userType: 'region' | 'district';
}

interface Region {
  id: string;
  nameUz: string;
}

interface District {
  id: string;
  nameUz: string;
  regionId: string;
}

interface UsersContentProps {
  regions?: Region[];
  allDistricts?: District[];
}

export function UsersContent({ regions = [], allDistricts = [] }: UsersContentProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('');
  const [status, setStatus] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const availableDistricts = selectedRegion 
    ? allDistricts.filter(d => d.regionId === selectedRegion)
    : [];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        userType: userType || 'all',
        status: status || 'all',
        regionId: selectedRegion,
        districtId: selectedDistrict,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, userType, status, selectedRegion, selectedDistrict]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleUserTypeChange = (value: string) => {
    setUserType(value === 'all' ? '' : value);
    // If switching to region xodimlari, we must clear district because it doesn't apply
    if (value === 'region') {
      setSelectedDistrict('');
    }
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value === 'all' ? '' : value);
    setSelectedDistrict('');
    setCurrentPage(1);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all users for export
      const params = new URLSearchParams({
        page: '1',
        limit: '10000',
        search: searchTerm,
        userType: userType || 'all',
        status: status || 'all',
        regionId: selectedRegion,
        districtId: selectedDistrict,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      const exportData = data.users.map((user: User, index: number) => ({
        'T/R': index + 1,
        'Viloyat': user.region || '-',
        'Tuman': user.userType === 'district' ? user.location : '-',
        'F.I.O': user.fullName,
        'JSHSHIR': user.jshshir,
        'Telefon': user.phoneNumber,
        'Lavozim': user.position,
        'Holat': user.status === 'active' ? 'Faol' : 'Bo\'sh',
        'Turi': user.userType === 'region' ? 'Viloyat' : 'Tuman',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Xodimlar');
      
      XLSX.writeFile(workbook, `xodimlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users?id=${userToDelete.id}&userType=${userToDelete.userType}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('O\'chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    fetchUsers();
    router.refresh(); // Also refresh server-side if needed
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] transition-colors duration-200">
      <div className="mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Qidiruv..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64 h-10 shadow-sm transition-all focus:ring-4 focus:ring-primary/10"
              />

              <Select
                value={selectedRegion || 'all'}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Barcha hududlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha hududlar</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.nameUz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {((userType !== 'region') || !userType) && selectedRegion && (
                <Select
                  value={selectedDistrict || 'all'}
                  onValueChange={handleDistrictChange}
                >
                  <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="Tuman tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha tumanlar</SelectItem>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameUz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={userType || 'all'}
                onValueChange={handleUserTypeChange}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Xodim turi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha xodimlar</SelectItem>
                  <SelectItem value="region">Viloyat xodimlari</SelectItem>
                  <SelectItem value="district">Tuman xodimlari</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="vacant">Bo'sh</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={() => setAddDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 h-10 rounded-lg text-sm font-medium transition-all cursor-pointer bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Xodim qo'shish
                </button>

                <button
                  onClick={handleExport}
                  disabled={users.length === 0 || isExporting}
                  className="flex items-center gap-2 px-4 py-2 h-10 rounded-lg text-sm font-medium transition-all cursor-pointer bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              <table className="relative w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      T/R
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Viloyat
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Tuman
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      F.I.O
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      JSHSHIR
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Telefon
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Lavozim
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Holat
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Turi
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none">
                      Amallar
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="text-sm text-gray-800 dark:text-gray-400 font-medium">
                          Yuklanmoqda...
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="text-sm text-gray-800 dark:text-gray-400 font-medium">
                          Ma'lumot topilmadi
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`group transition-all duration-200 ${
                          index % 2 !== 0
                            ? 'bg-gray-50/50 dark:bg-gray-700/20 hover:bg-gray-100/80 dark:hover:bg-gray-700/40'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                          {user.region || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                          {user.userType === 'district' ? user.location : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {user.jshshir}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.position !== '-' ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                              {user.position}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                              user.status === 'active'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/50'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50'
                            }`}
                          >
                            {user.status === 'active' ? 'Faol' : 'Bo\'sh'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                              user.userType === 'region'
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50'
                                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50'
                            }`}
                          >
                            {user.userType === 'region' ? 'Viloyat' : 'Tuman'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                              title="Tahrirlash"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Jami: <span className="font-semibold text-primary">{total}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-8 h-8 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="min-w-8 h-8 text-sm rounded text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                >
                  <SelectTrigger className="ml-4 w-[80px] h-8 text-xs">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        regions={regions}
        allDistricts={allDistricts}
        onSuccess={handleSuccess}
      />

      <UserEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        regions={regions}
        allDistricts={allDistricts}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Xodimni o'chirishni xohlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Bu amalni qaytarib bo'lmaydi. Ushbu xodim ma'lumotlari bazadan butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  O'chirilmoqda...
                </>
              ) : (
                "O'chirish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
