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

const tabs = [
  { key: 'search', label: 'Search Books' },
  { key: 'books', label: '📘 View Books' },
  { key: 'add-book', label: '➕ Add Book' },
  { key: 'inventory', label: '📦 Inventory' },
  { key: 'manage-inventory', label: '🛠️ Manage Inventory' },
  { key: 'add-author', label: '✍️ Add Author' },
  { key: 'add-publisher', label: '🏢 Add Publisher' },
  { key: 'publishers', label: '📇 View Publishers' },
  { key: 'add-category', label: '🏷️ Add Category' },
  { key: 'categories', label: '📂 View Categories' },
  { key: 'view-authors', label: 'View Authors' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Admin Dashboard</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
        {activeTab === 'categories' && <CategoryList />}
        {activeTab === 'view-authors' && <AuthorList />}
      </div>
    </div>
  );
}
