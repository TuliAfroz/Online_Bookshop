'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AssignCategory() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchBooksAndCategories = async () => {
            try {
                const booksRes = await axios.get('http://localhost:3000/api/books');
                const categoriesRes = await axios.get('http://localhost:3000/api/categories');

                setBooks(booksRes.data?.data || []);
                setCategories(categoriesRes.data?.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setMessage('Error fetching books or categories.');
            }
        };

        fetchBooksAndCategories();
    }, []);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prevSelected) => {
            if (prevSelected.includes(categoryId)) {
                // remove category
                return prevSelected.filter((id) => id !== categoryId);
            } else {
                // add category
                return [...prevSelected, categoryId];
            }
        });
    };

    const handleAssign = async () => {
        if (!selectedBook) {
            setMessage('Please select a book.');
            return;
        }
        if (selectedCategories.length === 0) {
            setMessage('Please select at least one category.');
            return;
        }

        try {
            const res = await axios.post('http://localhost:3000/api/books/assign-category', {
                book_id: Number(selectedBook),
                category_ids: selectedCategories.map((id) => Number(id)),
            });

            if (res.data.success) {
                setMessage('✅ Categories assigned successfully!');
            } else {
                setMessage(`❌ ${res.data.error || 'Something went wrong.'}`);
            }
        } catch (error) {
            console.error('Assign category error:', error.response?.data || error.message || error);
            setMessage('❌ Error assigning categories.');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Assign Categories to Book</h2>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Select Book</label>
                <select
                    className="w-full border rounded p-2"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                >
                    <option value="">-- Choose a book --</option>
                    {books.map((book) => (
                        <option key={book.book_id} value={book.book_id}>
                            {book.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Select Categories</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                    {categories.map((cat) => (
                        <label key={cat.category_id} className="block mb-1 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedCategories.includes(cat.category_id.toString()) || selectedCategories.includes(cat.category_id)}
                                onChange={() => handleCategoryChange(cat.category_id)}
                            />
                            {cat.category_name}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <button
                    onClick={handleAssign}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded"
                >
                    Assign Category
                </button>
            </div>


            {message && (
                <div
                    className={`mt-4 text-sm font-medium ${message.startsWith('✅') ? 'text-green-700' : 'text-red-700'
                        }`}
                >
                    {message}
                </div>
            )}
        </div>
    );
}
