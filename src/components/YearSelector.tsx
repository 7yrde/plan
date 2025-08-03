'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ currentYear, onYearChange }: YearSelectorProps) {
  const handlePreviousYear = () => {
    onYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    onYearChange(currentYear + 1);
  };

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <button
        onClick={handlePreviousYear}
        className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="이전 연도"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <div className="text-2xl font-bold text-gray-900">
        {currentYear}년
      </div>
      
      <button
        onClick={handleNextYear}
        className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="다음 연도"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
} 