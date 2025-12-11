import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../services/useApi";
import styles from "./UserAppointments.module.css";
import { formatDateTime } from '../../utils/formatters';
import { ConfirmationModal } from '../../pages/confirmation-modal/ConfirmationModal';

interface Appointment {
    appointmentId: number;
    patientId: number;
    appointmentDate: string;
    appointmentTime: string;
    createdAt: string | null;
    status: number;
    cancelledDate: string;
}
const UserAppointments = ()=> {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const { authenticatedFetch } = useApi();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    // Function to handle moving to the next page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Function to handle moving to the previous page
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

     const handleReschedule = (appointmentId: number) => {
        navigate('/display-timescreen', { state: { currentAppointmentId: appointmentId } });
    };

    const handleCancel = (appointmentId: number): void => {
       setSelectedAppointmentId(appointmentId);
       setIsModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (selectedAppointmentId !== null) {
            await cancelAppointment(selectedAppointmentId);
            setIsModalOpen(false); // Close the modal
            setSelectedAppointmentId(null); // Reset the ID
        }
    };

    const closeCancellationModal = () => {
        setIsModalOpen(false);
        setSelectedAppointmentId(null);
    };

    const cancelAppointment = async(appointmentId: number): Promise<void>=>{
        try
        {
            const response = await authenticatedFetch(
                `api/v2/appointment/cancel-appointment`, 
                { 
                    method: "POST",
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ existingAppointmentId: appointmentId })
                }
            );

            if (!response.ok){
                const errorData = await response.text();
                throw new Error(`API error: ${response.status} - ${errorData}`);
            }

            const cancelledAppointment : Appointment = await response.json();
            console.log(`Successfully cancelled appointment: ${cancelledAppointment.appointmentId}`);
            navigate('/cancelled-appointments');
        }
        catch(error){
            console.error("Failed to cancel appointment:", (error as Error).message);
        }
    }

     const formatStatus = (status: number) => {
        switch (status) {
            case 0:
                return 'Inactive';
            case 1:
                return 'Active';
            case 2:
                return 'Completed';
            case 3:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const fetchAppointments = useCallback(async (page :number, size :number) => {
        if (appointments.length === 0) {
            setIsLoading(true);
        }
        try{
             const response = await authenticatedFetch(`api/v1/appointment/by-patient?PageNumber=${page}&PageSize=${size}&Status=1`, {
              method: 'GET',
          });
         if (!response.ok) {
               const errorData = await response.text();
               throw new Error(`API error: ${response.status} - ${errorData}`);
          }
          
          const result: Appointment[] = await response.json();
          const total = response.headers.get("x-total-count");
          const totalCountFromHeader = total ? parseInt(total) : result.length;
          setAppointments(result);
          setTotalCount(totalCountFromHeader);
        }
        catch(error){
             console.error("Failed to fetch appointments:", (error as Error).message);
             setAppointments([]);
             setTotalCount(0);
             setIsLoading(false);
        }
        finally {
            setIsLoading(false); // Set loading to false when done
        }
    },[authenticatedFetch, appointments.length]);
    // Fetch whenever page or pageSize changes
    useEffect(()=>{
        fetchAppointments(currentPage, pageSize);
    }, [currentPage, pageSize, fetchAppointments]);
    
    const hasUserRole = user?.role?.includes("User");
    const hasAdminRole = user?.role?.includes("Admin");
    var navigateTo = "/login";
        if (hasUserRole) 
        {
        navigateTo = "/user-dashboard";
        }
        else if (hasAdminRole)
        {
        navigateTo = "/clinician-appointments";
        }
        if (!hasUserRole) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <button className={styles.btnGoHome} onClick={() => navigate(navigateTo)}>Go Home</button>
            </div>
        );
    }
    // pagination calculation    
    const totalPages = Math.ceil(totalCount / pageSize);
    if (isLoading) {
        return <div className={styles.layout}>Loading appointments...</div>;
    }
    return (
     <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.userBox}>
          <h3>{user?.username || "User"}</h3>
        </div>
        <nav className={styles.menu}>
          <button className={styles.menuBtn} onClick={()=>{navigate('/display-timescreen')}}>Book an Appointment</button>
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
        {/* SECTION HEADER */}
        <div>
          <h2 className={styles.headerText}>My Appointments</h2>
          <button className={styles.btnPastAppt} onClick={()=>{navigate('/past-appointments')}}>
            View Past Appointments
          </button>
          <button className={styles.btnBookAppt} onClick={()=>{navigate('/display-timescreen')}}>
            Book an Appointment
          </button>
        </div>
        {/* SUBTITLE */}
        <div className={styles.paginationText}>
          <h4>List of all your current or future appointments</h4>
        </div>
         {/* TABLE */}
        <div className={styles.tableContainer} style={{ marginTop: "20px" }}>
            {/* Entries selector */}
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
            <div className={styles.paginationText}>
              Show{" "}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="form-control form-control-sm"
                style={{ width: "80px", display: "inline-block", marginLeft: "5px" }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>{" "}
              entries
            </div>
          </div>
            <table className={styles.appointmentTable}>
                <thead>
                <tr className={styles.tableHeaderText}>
                    <th style={{ cursor: "pointer" }}>
                        Date / Time
                    </th>
                    {/*<th style={{ cursor: "pointer" }}>
                        Patient
                    </th>*/}
                    <th style={{ cursor: "pointer" }}>
                        Status
                    </th>
                    <th style={{ cursor: "pointer" }}>
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody>
                {appointments?.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="text-center">
                            No appointments found
                        </td>
                    </tr>
                ) : (
                    appointments?.map((appt) => (
                    <tr key={appt.appointmentId} className={styles.tableDataRow}>
                        <td className={styles.tableText}>{formatDateTime(appt.appointmentDate, appt.appointmentTime)}</td>
                       {/* <td className={styles.tableText}>{`Patient ${appt.patientId}`}</td>*/} {/* Replace with real patient name when available */}
                        <td className={styles.tableText}>{formatStatus(appt.status)}</td> {/* Replace with real status if backend provides it */}
                        <td className={styles.tableText}>
                          <div className={styles.actionButtonsContainer}>
                                <button 
                                    onClick={() => handleReschedule(appt.appointmentId)}
                                    className={styles.btnActionReschedule}
                                >
                                    Reschedule
                                </button>
                                <button 
                                    onClick={() => handleCancel(appt.appointmentId)}
                                    className={styles.btnActionCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            {/* Prev / Next buttons and page info */}
          <div
            className={styles.paginationContainer}
            style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            
            {/* Page Info (Stays on the left) */}
            <span className={styles.paginationText}>
                Showing {currentPage} of {totalPages === 0 ? 1 : totalPages} entries
            </span>

            {/* Button Wrapper (Moves to the right) */}
            <div className={styles.paginationButtons}>
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isLoading}
                    className={styles.btnPagination}>
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                    className={styles.btnPagination}>
                    Next
                </button>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
                <ConfirmationModal 
                    onConfirm={confirmCancellation} 
                    onCancel={closeCancellationModal} 
                />
       )}
    </div>
    );
}
export default UserAppointments;