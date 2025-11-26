import React, { useEffect, useState } from 'react';
import { useApi } from '../../services/useApi';
import styles from './TimeScreen.module.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface Slot {
    time: string;
    isAvailable: boolean;
}

interface SlotGroup {
    groupName: string;
    slots: Slot[];
}

interface AvailableDay {
    date: string;
    availableSlots: SlotGroup[];
}

interface AvailableSlotsResponse {
    days: AvailableDay[];
}
const TimeScreen = () => {
    const { authenticatedFetch } = useApi();
     const { logout, user } = useAuth();
    const navigate = useNavigate();
    // Update state type to match the expected API response structure
    const [appointmentData, setAppointmentData] = useState<AvailableSlotsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;
    const handleLogout = () => {
    logout();            // clear tokens / user session
    navigate("/login");  // redirect to login page
  };
    const loadSlots = async () => {
        setLoading(true);
        setError(null);

        try {
            const today = new Date().toISOString().split("T")[0];
            const endpoint = `appointment/available-slots?Date=${today}`;
            const BASE_API_URL = "https://localhost:7179/api/v1/";
            const fullUrl = `${BASE_API_URL}${endpoint}`;

            // Call authenticated API
            const response = await authenticatedFetch(fullUrl, { method: "GET" });

            const data: AvailableSlotsResponse = await response.json();
            setAppointmentData(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.container}>
      <header className={styles.header}>
        <span>Welcome, {user?.username || "User"}!</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className={styles.main}>
        {/* Your dashboard content goes here */}
        <h1>Dashboard</h1>
      </main>
    </div>
        /*<div className={styles.container}>
            <h1>Dashboard</h1>
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboardButtons}>
                    <a className={`${styles.bigBtn} ${styles.btnGreen}`} onClick={loadSlots}>Book an Appoitment</a> <p>
                    <a className={`${styles.bigBtn} ${styles.btnRed}`}>Cancel Appointment</a></p>
                </div>
            </div>
            <hr />
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {(appointmentData?.days?.length ?? 0 > 0) && (
                appointmentData?.days.map((day) => (
                <div key={day.date}>
                    <h2>Date: {new Date(day.date).toLocaleDateString()}</h2>
                    {day.availableSlots.map((group) => (
                        <div key={group.groupName}>
                            <h3>{group.groupName}</h3>
                            <ul>
                                {group.slots.map((slot) => (
                                    <li key={slot.time}>
                                        {slot.time} — {slot.isAvailable ? "Available" : "Booked"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
               ))
            )}
        </div>*/
    );
};

export default TimeScreen;