'use client';

import { useState } from 'react';
import AddBookForm from './sections/AddBookForm';
import AddAuthorForm from './sections/AddAuthorForm';
import AddPublisherForm from './sections/AddPublisherForm';
import AddCategoryForm from './sections/AddCategoryForm';
import BookSearch from './sections/BookSearch';

const tabs = [
  { key: 'search', label: 'Search Books' },
  { key: 'add-book', label: 'Add Book' },
  { key: 'add-author', label: 'Add Author' },
  { key: 'add-publisher', label: 'Add Publisher' },
  { key: 'add-category', label: 'Add Category' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Admin Dashboard</h1>

      <div className="flex space-x-2 mb-6 justify-center">
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
        {activeTab === 'add-book' && <AddBookForm />}
        {activeTab === 'add-author' && <AddAuthorForm />}
        {activeTab === 'add-publisher' && <AddPublisherForm />}
        {activeTab === 'add-category' && <AddCategoryForm />}
      </div>
    </div>
  );
}
