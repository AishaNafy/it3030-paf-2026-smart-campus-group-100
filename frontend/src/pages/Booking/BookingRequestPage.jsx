import React, { useState } from 'react';

const BookingRequestPage = () => {
    // Defines missing formData and setFormData
    const [formData, setFormData] = useState({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Defines missing handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert("Booking submitted successfully!");
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">New Booking</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <input name="resourceId" placeholder="Resource ID" onChange={handleChange} className="w-full p-2 mb-4 border rounded"/>
                <input type="date" name="date" onChange={handleChange} className="w-full p-2 mb-4 border rounded"/>
                <input type="time" name="startTime" onChange={handleChange} className="w-full p-2 mb-4 border rounded"/>
                <input type="time" name="endTime" onChange={handleChange} className="w-full p-2 mb-4 border rounded"/>
                <textarea name="purpose" placeholder="Purpose" onChange={handleChange} className="w-full p-2 mb-4 border rounded"/>
                <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
                    Submit Request
                </button>
            </form>
        </div>
    );
};

export default BookingRequestPage; // Fixes the "module has no exports" error