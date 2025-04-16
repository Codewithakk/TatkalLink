"use client"
import React, { useState, useEffect } from 'react';

const mockRequests = [
    {
        _id: "1",
        mode: "train",
        from: "Lucknow",
        to: "Surat",
        travelDate: "2025-04-10T00:00:00.000Z",
        timeRange: "06:00 - 10:00",
        priority: "high",
        maxBudget: 5000,
        status: "open",
    },
    {
        _id: "2",
        mode: "train",
        from: "New Delhi",
        to: "Mumbai",
        travelDate: "2025-04-12T00:00:00.000Z",
        timeRange: "Evening (5 PM - 9 PM)",
        priority: "high",
        maxBudget: 2500,
        status: "open",
    },
    {
        _id: "3",
        mode: "train",
        from: "New Delhi",
        to: "Lucknow",
        travelDate: "2025-04-20T00:00:00.000Z",
        timeRange: "Evening (7 PM - 12 PM)",
        priority: "high",
        maxBudget: 2500,
        status: "cancelled",
    },
    {
        _id: "4",
        mode: "bus",
        from: "Delhi",
        to: "Agra",
        travelDate: "2025-04-15T00:00:00.000Z",
        timeRange: "Morning (8 AM - 11 AM)",
        priority: "medium",
        maxBudget: 800,
        status: "open",
    }
];

function TravelRequests() {
    const [requests, setRequests] = useState<Array<{
        _id: string;
        mode: string;
        from: string;
        to: string;
        travelDate: string;
        timeRange: string;
        priority: string;
        maxBudget: number;
        status: string;
    }>>([]);
    const [selectedMode, setSelectedMode] = useState('All');

    useEffect(() => {
        // Using fake data for now
        setRequests(mockRequests);
    }, []);

    const modes = ['All', ...new Set(requests.map(request => request.mode))];

    const handleModeClick = (mode: string) => {
        setSelectedMode(mode);
    };

    const filteredRequests = selectedMode === 'All'
        ? requests
        : requests.filter(request => request.mode === selectedMode);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {modes.map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeClick(mode)}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: selectedMode === mode ? '#007bff' : '#f0f0f0',
                            color: selectedMode === mode ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {mode.toUpperCase()}
                    </button>
                ))}
            </div>

            {filteredRequests.length === 0 ? (
                <p>No requests found for <strong>{selectedMode}</strong>.</p>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            {['From', 'To', 'Date', 'Time Range', 'Priority', 'Budget', 'Status'].map(header => (
                                <th key={header} style={{
                                    border: '1px solid #ddd',
                                    padding: '12px',
                                    textAlign: 'left'
                                }}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(request => (
                            <tr key={request._id} style={{ backgroundColor: request.status === 'cancelled' ? '#ffe6e6' : 'white' }}>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{request.from}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{request.to}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    {new Date(request.travelDate).toLocaleDateString()}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{request.timeRange}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{request.priority}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{request.maxBudget} ₹</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px', textTransform: 'capitalize' }}>{request.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TravelRequests;
