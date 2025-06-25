'use client';

import { useEffect, useState } from 'react';

export default function PublisherList() {
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/publishers')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setPublishers(data.data);
                } else {
                    console.error('Failed to load publishers');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching publishers:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center text-gray-500">Loading publishers...</div>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">📦 Publishers</h2>
            {publishers.length === 0 ? (
                <div className="text-gray-500">No publishers found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-xl shadow-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishers.map((publisher) => (
                                <tr key={publisher.publisher_id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-center">{publisher.publisher_id}</td>
                                    <td className="py-2 px-4 border-b">{publisher.publisher_name}</td>
                                    <td className="py-2 px-4 border-b text-center">{publisher.phone_no || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

