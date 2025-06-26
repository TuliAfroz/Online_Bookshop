'use client';

import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-teal-900 text-white relative">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <BookOpen size={32} className="text-white" />
        <span className="text-2xl font-[cursive] tracking-widest italic">PORUA</span>
      </div>
    </div>
  );
}
