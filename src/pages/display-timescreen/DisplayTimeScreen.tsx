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

interface SuccessDialogProps {
    message: string;
    isOpen: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
}
interface ErrorDialogProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
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
  const [newDates, setNewDates] = useState<string[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
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
  
  const appointmentId = location.state?.currentAppointmentId;
  const loadSlots = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryDate = date ? formatDateForApi(new Date(date)) : formatDateForApi(new Date());
      const response = await authenticatedFetch(
        `api/v1/appointment/available-slots?Date=${queryDate}`,
         { method: "GET" }
      );
      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      if (!response.ok) {
         let errorText = "";
      try {
        const json = JSON.parse(responseText);
        errorText = json.message || JSON.stringify(json);
      } catch {
        errorText = responseText.substring(0, 200);
      }
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      const data: AvailableSlotsResponse = JSON.parse(responseText);
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
  
  const SuccessDialog: React.FC<SuccessDialogProps> = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className={styles.overlay}>
        <div className={styles.dialogBox}>
          <div className={styles.iconPlaceholder}>✅</div> {/* Success Icon */}
          <p className={styles.message}>{message}</p>
          <button onClick={onClose} className={styles.closeButton}>
            OK
          </button>
        </div>
      </div>
    );
  };
  const ErrorDialog: React.FC<ErrorDialogProps> = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className={styles.overlay}>
          <div className={styles.dialogBox}>
            <div className={styles.iconPlaceholder}>❌</div> {/* Error Icon */}
            <p className={styles.message}>{message}</p>
            <button onClick={onClose} className={styles.closeButton}>
              OK
            </button>
          </div>
        </div>
      );
  };
  const showErrorDialog = (message: string) => {
    setErrorMessage(message);
    setErrorDialogOpen(true);    
  };

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage("");
  };
  const reScheduleAppointment = async() =>{
      try{
          const response = await authenticatedFetch(`api/v2/appointment/rebook-appointment`, 
            { 
              method: "POST",
              headers: {
              'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
              existingAppointmentId: appointmentId,
              date: selectedSlot?.date,
              time: selectedSlot?.time
              })
            }      
          );
          // Check if the response is OK (status in the range 200-299)
        if (response.ok) {
            // Handle successful scenario (HTTP 200 OK implied)
            setSuccessMessage("Appointment successfully updated.");
            setIsSuccessOpen(true);            
        } else {
            // Handle error scenarios where status is outside 200-299
            const statusCode = response.status;
            let errorMessage = "An unexpected error occurred.";

            switch (statusCode) {
                case 400:
                    errorMessage = "Invalid date or time provided. Please check your selection.";
                    break;
                case 404:
                    errorMessage = "The original appointment could not be found.";
                    break;
                case 409:
                    errorMessage = "The requested time slot is already booked. Please choose another time.";
                    break;
                default:
                     const errorData = await response.json(); 
                     errorMessage = errorData.message || errorMessage;
                     break;
            }
             showErrorDialog(errorMessage);
          }
      }
      catch (networkerror){

      }
  }

  const ScheduleAppointment = async() =>{
      try{
          const response = await authenticatedFetch(`api/v1/appointment/book-slot`, 
            { 
              method: "POST",
              headers: {
              'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
              date: selectedSlot?.date,
              time: selectedSlot?.time
              })
            }      
          );
          // Check if the response is OK (status in the range 200-299)
        if (response.ok) {
            // Handle successful scenario (HTTP 200 OK implied)
            setSuccessMessage("Appointment successfully created.");
            setIsSuccessOpen(true);            
        } else {
            // Handle error scenarios where status is outside 200-299
            const statusCode = response.status;
            let errorMessage = "An unexpected error occurred.";

            switch (statusCode) {
               case 401:
                    errorMessage = "Incorrect input format";
                    break;
                case 400:
                    errorMessage = "Invalid date or time provided. Please check your selection.";
                    break;
                case 404:
                    errorMessage = "The original appointment could not be found.";
                    break;
                case 409:
                    errorMessage = "The requested time slot is already booked. Please choose another time.";
                    break;
                default:
                     const errorData = await response.json(); 
                     errorMessage = errorData.message || errorMessage;
                    break;
            }
            showErrorDialog(errorMessage);
          }
      }
      catch (error:any){
         showErrorDialog(error.message || "Network error occurred.");
      }
  }

  const Schedule = async () => {
      console.log("ScheduleAppointment called", selectedSlot);
      console.log("Schedule branch chosen:", appointmentId != null && appointmentId > 0 ? "reschedule" : "new schedule");
    if (appointmentId != null &&appointmentId > 0)
    {
      await reScheduleAppointment();
    }
    else
    {
      await ScheduleAppointment();
    }
  }

  const goBack = ()=>{
    setSelectedSlot(null);
    navigate(-1);
  }

  return (
  <div className={styles.layout}>
    {/* SIDEBAR */}
    <aside className={styles.sidebar}>
      <div className={styles.userBox}>
        <h3>{user?.username || "User"}</h3>
      </div>
      <nav className={styles.menu}>
        <button className={styles.menuBtn}>Book an Appointment</button>
        <button className={styles.menuBtn} onClick={()=>{navigate('/user-dashboard')}}>Home</button>
        <button className={styles.menuBtn} onClick={()=>{navigate('/user-appointments')}}>My Appointments</button>
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
                                  } ${!slot.isAvailable ? styles.disabledTime : ''}`}
                                  onClick={() => {
                                    if (slot.isAvailable)
                                    {
                                      chooseSlot(day.date, slot.time)
                                    }
                                  }}
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
        <button className={styles.backBtn} onClick={() => goBack()}>Back</button>
        {selectedSlot && (
          <div className={styles.selectedTimeText}>
            Your selected time is on: {formatDateTime(selectedSlot.date, selectedSlot.time)}
            <button className={styles.bookBtn} onClick={()=>Schedule()}>Book an appointment</button>
            
          </div>
        )}
        <SuccessDialog 
                message={successMessage} 
                isOpen={isSuccessOpen} 
                onClose={() => {
                  setIsSuccessOpen(false);
                  navigate('/user-appointments');
                }} 
         />
         <ErrorDialog
            message={errorMessage}
            isOpen={errorDialogOpen}
            onClose={() => {
              setErrorDialogOpen(false);
              setErrorMessage('');
              navigate('/user-appointments');
            }}
          />
      </div>
    </div>
  </div>
);
};

export default DisplayTimeScreen;