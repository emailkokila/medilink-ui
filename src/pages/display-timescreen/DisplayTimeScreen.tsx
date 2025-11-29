import React, { useEffect, useState  } from 'react';
import { useApi } from '../../services/useApi';
import styles from './DisplayTimeScreen.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { formatDateTime } from '../../utils/formatters';

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

const DisplayTimeScreen = () => {
  const { authenticatedFetch } = useApi();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [availableSlot, setAvailableSlots] = useState<AvailableSlotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [lastLoadedDate, setLastLoadedDate] = useState<string>(new Date().toISOString());
  const visibleDaysCount = 5;

  const toggleGroup = (date: string, group: string) => {
    const key = `${date}-${group}`;
    setExpandedGroup(expandedGroup === key ? null : key);
  };

  const chooseSlot = (date: string, time: string) => {
    setSelectedSlot({ date, time });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Returns the FIRST visible date in the current grid
    const getFirstVisibleDate = () => {
    if (!availableSlot) return null;

    const days = availableSlot.days.slice(startIndex, startIndex + visibleDaysCount);
    return days.length > 0 ? days[0].date : null;
    };

    // Returns the LAST visible date in the current grid
    const getLastVisibleDate = () => {
    if (!availableSlot) return null;

    const days = availableSlot.days.slice(startIndex, startIndex + visibleDaysCount);
    return days.length > 0 ? days[days.length - 1].date : null;
    };

  const prevDays = async () => {
    if (!availableSlot) return;

    const firstDateStr = getFirstVisibleDate();
    if (!firstDateStr) return;

    const d = new Date(firstDateStr);
    d.setDate(d.getDate() - visibleDaysCount);

    await loadSlots(formatDateForApi(d));

    setStartIndex(prev => Math.max(prev - visibleDaysCount, 0));
  };
  const [loadingNextPrev, setLoadingNextPrev] = useState(false);
  const nextDays = async () => {
  if (!availableSlot) return;

  const lastDateStr = getLastVisibleDate();
  if (!lastDateStr) return;

  const d = new Date(lastDateStr);
    d.setDate(d.getDate() + 1); // NEXT block

    setLoadingNextPrev(true);
    await loadSlots(formatDateForApi(d));
    setStartIndex(prev => prev + visibleDaysCount);
    setLoadingNextPrev(false);
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 35); // 5 weeks = 35 days

  const handleRefresh = () => {
  setStartIndex(0); // reset to first page
  setAvailableSlots(null); // clear existing slots
  setLastLoadedDate(new Date().toISOString()); // reset last loaded date
  loadSlots(); // load today's slots
};
  const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD
};
  const isNextDisabled = !availableSlot || 
  new Date(availableSlot.days[Math.min(startIndex + visibleDaysCount - 1, availableSlot.days.length - 1)].date) >= maxDate;
  const [newDates, setNewDates] = useState<string[]>([]);
  const loadSlots = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const appointmentId = location.state?.currentAppointmentId;
      const queryDate = date ? formatDateForApi(new Date(date)) : formatDateForApi(new Date());
      const response = await authenticatedFetch(`api/v1/appointment/available-slots?Date=${queryDate}`, { method: "GET" });
      const data: AvailableSlotsResponse = await response.json();
      if (availableSlot) {
        // Append new days if already loaded
        setAvailableSlots(prev => {
          if (!prev) { 
            setNewDates(data.days.map(d => d.date));
            return data
          };
          const newDays = data.days.filter(d => !prev.days.some(pd => pd.date === d.date));
          setNewDates(newDays.map(d => d.date));
          return { days: [...prev.days, ...newDays]};
        });
      } else {
      setAvailableSlots(data);
      }
      // Update lastLoadedDate to last date returned
      if (data.days.length > 0) {
        setLastLoadedDate(data.days[data.days.length - 1].date);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  // Clear new day highlights after animation
useEffect(() => {
  if (newDates.length === 0) return;
  const timer = setTimeout(() => setNewDates([]), 300); // match animation duration
  return () => clearTimeout(timer);
}, [newDates]);

  if (loading && !availableSlot) return <div>Loading slots...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
  <div className={styles.layout}>
    {/* SIDEBAR */}
    <aside className={styles.sidebar}>
      <div className={styles.userBox}>
        <h3>{user?.username || "User"}</h3>
      </div>
      <nav className={styles.menu}>
        <button className={styles.menuBtn}>Book an Appointment</button>
        <button className={styles.menuBtn}>Home</button>
        <button className={styles.menuBtn}>My Appointments</button>
      </nav>
    </aside>

    {/* MAIN CONTENT */}
    <div className={styles.mainContent}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.logo}>Medilink</h1>
        <button className={styles.logout} onClick={handleLogout}>Logout</button>
      </header>
      <h2 className={styles.headerText}>Select a time</h2>

      {/* DAY NAVIGATION */}
      <div className={styles.dayNavigationWrapper}>
        <button
          className={styles.navBtn}
          onClick={prevDays}
          disabled={startIndex === 0}
        >
          &lt;
        </button>

        <div className={styles.timesContainerWrapper}>
          {loadingNextPrev && <div className={styles.loadingOverlay}></div>}
          <div className={styles.timesContainer}>
            {availableSlot?.days
              .slice(startIndex, startIndex + visibleDaysCount)
              .map(day => {
                const isNew = newDates.includes(day.date);
                return (
                  <div
                    key={day.date}
                    className={`${styles.dayColumn} ${isNew ? styles.newDay : ''}`}
                  >
                    <div className={styles.dayHeader}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </div>

                    {day.availableSlots.map(group => {
                      const key = `${day.date}-${group.groupName}`;
                      const isExpanded = expandedGroup === key;

                      return (
                        <div key={group.groupName} className={styles.groupBox}>
                          <div
                            className={styles.slotHeader}
                            onClick={() => toggleGroup(day.date, group.groupName)}
                          >
                            {group.groupName}
                          </div>

                          <div
                            className={styles.availableRow}
                            onClick={() => toggleGroup(day.date, group.groupName)}
                          >
                            {group.slots.filter(s => s.isAvailable).length} Available
                          </div>

                          {isExpanded && (
                            <div className={styles.slotContainer}>
                              {group.slots.map(slot => (
                                <div
                                  key={slot.time}
                                  className={`${styles.timeItem} ${
                                    selectedSlot?.time === slot.time && selectedSlot?.date === day.date
                                      ? styles.selectedTime
                                      : ''
                                  }`}
                                  onClick={() => chooseSlot(day.date, slot.time)}
                                >
                                  {slot.time}
                                </div>
                              ))}
                              <button className={styles.backBtn} onClick={() => setExpandedGroup(null)}>
                                Back
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>

        <button
          className={styles.navBtn}
          onClick={nextDays}
          disabled={isNextDisabled}
        >
          {loadingNextPrev ? 'Loading...' : '>'}
        </button>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button className={styles.refreshBtn} onClick={handleRefresh}>Refresh</button>
        <button className={styles.backBtn} onClick={() => setSelectedSlot(null)}>Back</button>
        {selectedSlot && (
          <div className={styles.selectedTimeText}>
            Your selected time is on: {formatDateTime(selectedSlot.date, selectedSlot.time)}
            <button className={styles.bookBtn} onClick={() => setSelectedSlot(null)}>Book an appointment</button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default DisplayTimeScreen;