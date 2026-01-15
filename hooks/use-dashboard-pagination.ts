import { useState, useMemo } from 'react';

export function useDashboardPagination(initialItemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const paginate = <T,>(data: T[]) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return {
      paginatedData,
      totalPages,
      totalItems: data.length,
    };
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = (totalPages: number) => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  return {
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    paginate,
    resetPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  };
}

