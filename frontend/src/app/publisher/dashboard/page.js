'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import AddBookForm from './sections/AddBookForm';
import AddAuthorForm from './sections/AddAuthorForm';
import PendingOrders from './sections/PendingOrders';
import PreviousOrders from './sections/PreviousOrders';
import PublisherProfile from './sections/PublisherProfile';
import EditBookPrices from './sections/EditBookPrices';
import SearchOwnBooks from './sections/SearchOwnBooks';

const tabs = [
  { key: 'profile', label: 'My Profile' },
  { key: 'search', label: 'My Books' },
  { key: 'add-book', label: 'Add Book' },
  { key: 'add-author', label: 'Add Author' },
  { key: 'edit-price', label: 'Edit Price' },
  { key: 'pending-orders', label: 'Pending Orders' },
  { key: 'previous-orders', label: 'Previous Orders' },
  { key: 'logout', label: 'Logout' },
];

export default function PublisherDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('search');
  const [menuOpen, setMenuOpen] = useState(false);
  const [publisherId, setPublisherId] = useState(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch publisher ID from localStorage or token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setPublisherId(payload.user_id || payload.publisher_id);
      } catch {
        console.error('Invalid token format');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (activeTab === 'logout') {
    handleLogout();
    return null;
  }

  const handleTabClick = (key) => {
    setActiveTab(key);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Menu Button */}
      <div className="flex justify-end p-4 relative z-50">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={28} />
        </button>
        {menuOpen && (
          <div className="absolute right-4 top-full mt-2 w-56 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
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

      {/* Main Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow">
          {activeTab === 'search' && <SearchOwnBooks publisherId={publisherId} />}
          {activeTab === 'add-book' && <AddBookForm publisherId={publisherId} />}
          {activeTab === 'add-author' && <AddAuthorForm />}
          {activeTab === 'pending-orders' && <PendingOrders publisherId={publisherId} />}
          {activeTab === 'previous-orders' && <PreviousOrders publisherId={publisherId} />}
          {activeTab === 'edit-price' && <EditBookPrices publisherId={publisherId} />}
          {activeTab === 'profile' && <PublisherProfile publisherId={publisherId} />}
        </div>
      </div>
    </div>
  );
}
