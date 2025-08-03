'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ currentYear, onYearChange }: YearSelectorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <button
        onClick={() => onYearChange(currentYear - 1)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="이전 연도"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <h2 className="text-2xl font-bold text-foreground mx-6">
        {currentYear}년
      </h2>
      
      <button
        onClick={() => onYearChange(currentYear + 1)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="다음 연도"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
} 