'use client';

import { useEffect, useState } from 'react';

interface Seeker {
    _id: string;
    name: string;
    email: string;
}

interface TicketRequest {
    _id: string;
    seekerId: Seeker;
    mode: string;
    from: string;
    to: string;
    travelDate: string;
    timeRange: string;
    additionalNotes: string;
    status: string;
    priority: string;
    maxBudget: number;
    contactPreference: string;
    isDeleted: boolean;
    createdAt: string;
}

export default function TicketRequestsPage() {
    const [requests, setRequests] = useState<TicketRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch('https://tatkallink.onrender.com/api/v1/admin/requests');
                if (!res.ok) throw new Error("Failed to fetch data.");
                const data = await res.json();
                setRequests(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) return <div className="p-4">Loading ticket requests...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Ticket Requests</h1>
            <div className="overflow-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Seeker</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Mode</th>
                            <th className="border p-2">From</th>
                            <th className="border p-2">To</th>
                            <th className="border p-2">Travel Date</th>
                            <th className="border p-2">Time Range</th>
                            <th className="border p-2">Notes</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Priority</th>
                            <th className="border p-2">Max Budget</th>
                            <th className="border p-2">Contact</th>
                            <th className="border p-2">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id} className="hover:bg-gray-50">
                                <td className="border p-2">{req.seekerId?.name}</td>
                                <td className="border p-2">{req.seekerId?.email}</td>
                                <td className="border p-2">{req.mode}</td>
                                <td className="border p-2">{req.from}</td>
                                <td className="border p-2">{req.to}</td>
                                <td className="border p-2">{new Date(req.travelDate).toLocaleDateString()}</td>
                                <td className="border p-2">{req.timeRange}</td>
                                <td className="border p-2">{req.additionalNotes}</td>
                                <td className="border p-2">{req.status}</td>
                                <td className="border p-2">{req.priority}</td>
                                <td className="border p-2">₹{req.maxBudget}</td>
                                <td className="border p-2">{req.contactPreference}</td>
                                <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
