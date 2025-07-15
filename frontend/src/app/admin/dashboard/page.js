'use client';

import { useState } from 'react';
import AddBookForm from './sections/AddBookForm';
import AddAuthorForm from './sections/AddAuthorForm';
import AddPublisherForm from './sections/AddPublisherForm';
import AddCategoryForm from './sections/AddCategoryForm';
import BookSearch from './sections/BookSearch';
import PublisherList from './sections/PublisherList';
import CategoryList from './sections/CategoryList';
import BookList from './sections/BookList';
import InventoryList from './sections/InventoryList';
import ManageInventory from './sections/ManageInventory';
import AuthorList from './sections/AuthorList';
import AdminHeader from '@/components/AdminHeader';
import CustomerList from './sections/CustomerList';
import CustomerDetails from './sections/CustomerDetails';
//import AdminBuyBooks from './sections/AdminBuyBooks';


const tabs = [
  { key: 'search', label: 'Search Books' },
  { key: 'view-customers', label: 'View Customers' },
  { key: 'books', label: 'View Books' },
  { key: 'add-book', label: 'Add Book' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'manage-inventory', label: 'Manage Inventory' },
  { key: 'view-authors', label: 'View Authors' },
  { key: 'add-author', label: 'Add Author' },
  { key: 'publishers', label: 'View Publishers' },
  { key: 'add-publisher', label: 'Add Publisher' },
  { key: 'categories', label: 'View Categories' },
  { key: 'add-category', label: 'Add Category' },
  { key: 'buy-books', label: 'Buy Books' },
  { key: 'logout', label: 'Logout' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  if (activeTab === 'logout') {
    handleLogout();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow">
          {activeTab === 'search' && <BookSearch />}
          {activeTab === 'books' && <BookList />}
          {activeTab === 'add-book' && <AddBookForm />}
          {activeTab === 'inventory' && <InventoryList />}
          {activeTab === 'manage-inventory' && <ManageInventory />}
          {activeTab === 'add-author' && <AddAuthorForm />}
          {activeTab === 'add-publisher' && <AddPublisherForm />}
          {activeTab === 'publishers' && <PublisherList />}
          {activeTab === 'add-category' && <AddCategoryForm />}
          {activeTab === 'buy-books' && <AdminBuyBooks />}
          {activeTab === 'categories' && <CategoryList />}
          {activeTab === 'view-authors' && <AuthorList />}
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
