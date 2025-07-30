'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import AddPublisherForm from './sections/AddPublisherForm';
import AddCategoryForm from './sections/AddCategoryForm';
import AssignCategory from './sections/AssignCategory';
import BookSearch from './sections/BookSearch';
import PublisherList from './sections/PublisherList';
import CategoryList from './sections/CategoryList';
import InventoryList from './sections/InventoryList';
import AuthorList from './sections/AuthorList';
import CustomerList from './sections/CustomerList';
import CustomerDetails from './sections/CustomerDetails';
import BuyBooks from './sections/BuyBooks';
import GiftCard from './sections/GiftCard';
import PreviousOrders from './sections/PreviousOrders';
const tabs = [
  { key: 'search', label: 'Books' },
  { key: 'view-customers', label: 'Customers' },
  { key: 'view-authors', label: 'Authors' },
  { key: 'publishers', label: 'Publishers' },
  { key: 'categories', label: 'Categories' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'add-publisher', label: 'Add Publisher' },
  { key: 'add-category', label: 'Add Category' },
  { key: 'assign-category', label: 'Assign Category' },
  { key: 'buy-books', label: 'Buy Books' },
  { key: 'gift-card', label: 'Giftcards' },
  { key: 'previous-orders', label: 'Previous Orders' },
  { key: 'logout', label: 'Logout' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false); // close dropdown
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Menu Toggle Button (Top Right) */}
      <div className="flex justify-end p-4 relative z-50">
        <button onClick={() => setMenuOpen(!menuOpen)}>
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

      {/* Main Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow">
          {activeTab === 'search' && <BookSearch />}
          {activeTab === 'inventory' && <InventoryList />}
          {activeTab === 'add-publisher' && <AddPublisherForm />}
          {activeTab === 'add-category' && <AddCategoryForm />}
          {activeTab === 'assign-category' && <AssignCategory />}
          {activeTab === 'publishers' && <PublisherList />}
          {activeTab === 'buy-books' && <BuyBooks />}
          {activeTab === 'previous-orders' && <PreviousOrders />}
          {activeTab === 'categories' && <CategoryList />}
          {activeTab === 'view-authors' && <AuthorList />}
          {activeTab === 'gift-card' && <GiftCard />}
          {activeTab === 'view-customers' && (
            selectedCustomer ? (
              <CustomerDetails customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
            ) : (
              <CustomerList onSelectCustomer={setSelectedCustomer} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
