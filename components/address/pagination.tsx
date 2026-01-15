import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className='flex justify-between items-center mt-4'>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Jami: <span className="font-semibold text-primary">{totalItems}</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          }`}
        >
          <ChevronLeft className='w-4 h-4' />
        </button>

        <div className='flex gap-1'>
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
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 text-sm rounded ${
                  currentPage === pageNum
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className='text-gray-400'>...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="min-w-8 h-8 text-sm rounded text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          }`}
        >
          <ChevronRight className='w-4 h-4' />
        </button>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
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
  );
}
