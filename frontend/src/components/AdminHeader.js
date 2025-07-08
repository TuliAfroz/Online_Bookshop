'use client';

import { BookOpen, Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader({ tabs, activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (key) => {
    setActiveTab(key);
    setMenuOpen(false); // close dropdown after selecting
  };

  return (
    <div className="flex justify-between items-center p-4 bg-slate-700 text-white relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <BookOpen size={32} className="text-white" />
        <span className="text-2xl font-[cursive] tracking-widest italic">PORUA</span>
      </div>

      {/* Menu Toggle Button */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="relative">
        <Menu size={28} />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-2 w-56 bg-white text-gray-900 rounded-xl shadow-xl z-50 overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`w-full px-4 py-2 text-left hover:bg-slate-100 ${
                activeTab === tab.key ? 'bg-slate-200 font-semibold' : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
