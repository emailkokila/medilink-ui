import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../services/useApi";
import styles from "./ClinicianAppointments.module.css";
import { formatDateTime } from '../../utils/formatters';
import { ConfirmationModal } from '../../pages/confirmation-modal/ConfirmationModal';

interface Appointment {
    appointmentId: number;
    patientId: number;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    createdAt: string | null;
    status: number;
    cancelledDate: string;
}
const ClinicianAppointments = ()=> {
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
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
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

    const handleCancel = (appointmentId: number, patientId : number): void => {
       setSelectedAppointmentId(appointmentId);
       setSelectedPatientId(patientId);
       setIsCancellationModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (selectedAppointmentId !== null && selectedPatientId != null) {
            await cancelAppointment(selectedAppointmentId, selectedPatientId);
            await fetchAppointments(currentPage, pageSize);
            setIsCancellationModalOpen(false); // Close the modal
            setSelectedAppointmentId(null);
            setSelectedPatientId(null);
        }
    };

    const closeCancellationModal = () => {
        setIsCancellationModalOpen(false);
        setSelectedAppointmentId(null);
        setSelectedPatientId(null);
    };

    const cancelAppointment = async(appointmentId: number, patientId : number): Promise<void>=>{
        try
        {
            const response = await authenticatedFetch(
                `api/v2/appointment/cancel-appointment`, 
                { 
                    method: "POST",
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                         existingAppointmentId: appointmentId,
                         patientId : patientId
                    })
                }
            );

            if (!response.ok){
                const errorData = await response.text();
                throw new Error(`API error: ${response.status} - ${errorData}`);
            }

            const cancelledAppointment : Appointment = await response.json();
            console.log(`Successfully cancelled appointment: ${cancelledAppointment.appointmentId}`);
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

    const handleComplete = (appointmentId: number, patientId : number) => {
       setSelectedAppointmentId(appointmentId);
       setSelectedPatientId(patientId);
       setIsCompletionModalOpen(true);
    };

    const confirmCompletion = async () => {
        if (selectedAppointmentId !== null && selectedPatientId != null) {
            await completeAppointment(selectedAppointmentId, selectedPatientId);
            await fetchAppointments(currentPage, pageSize);
            setIsCompletionModalOpen(false); // Close the modal
            setSelectedAppointmentId(null);
            setSelectedPatientId(null);
        }
    };

    const closeCompletionModal = () => {
        setIsCompletionModalOpen(false);
        setSelectedAppointmentId(null);
        setSelectedPatientId(null);
    };

    const completeAppointment = async(appointmentId: number, patientId : number): Promise<void>=>{
        try
        {
            const response = await authenticatedFetch(
                `api/v2/appointment/complete-appointment`, 
                { 
                    method: "POST",
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        existingAppointmentId: appointmentId,
                        patientId: patientId 
                    })
                }
            );

            if (!response.ok){
                const errorData = await response.text();
                throw new Error(`API error: ${response.status} - ${errorData}`);
            }

            const completedAppointment : Appointment = await response.json();
            console.log(`Successfully completed appointment: ${completedAppointment.appointmentId}`);
        }
        catch(error){
            console.error("Failed to complete appointment:", (error as Error).message);
        }
    }

    const fetchAppointments = async (page = currentPage, size = pageSize) => {
        setIsLoading(true); console.log('about');
        try{
             const isoDate = new Date().toISOString(); 
             const response = await authenticatedFetch(`api/v2/appointment/get-appointments?Date=${isoDate}&PageNumber=${page}&PageSize=${size}&Status=1`, {
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
    }
    // Fetch whenever page or pageSize changes
    useEffect(()=>{
        fetchAppointments(currentPage, pageSize);
    }, [currentPage, pageSize]);

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
          <h2 className={styles.headerText}>Appointments for today</h2>
        </div>
        {/* SUBTITLE */}
        <div className={styles.paginationText}>
          <h4>List of all your current appointments</h4>
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
                    <th style={{ cursor: "pointer" }}>
                        Patient
                    </th>
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
                        <td className={styles.tableText}>{appt.patientName}</td>
                        <td className={styles.tableText}>{formatStatus(appt.status)}</td> {/* Replace with real status if backend provides it */}
                        <td className={styles.tableText}>
                          <div className={styles.actionButtonsContainer}>
                                <button 
                                    onClick={() => handleComplete(appt.appointmentId, appt.patientId)}
                                    className={styles.btnActionCompletion}
                                >
                                    Complete
                                </button>
                                <button 
                                    onClick={() => handleCancel(appt.appointmentId, appt.patientId)}
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
      {isCompletionModalOpen && (
                <ConfirmationModal message="Do you want to complete the appointment?" confirmLabel="Yes, Complete"
                    onConfirm={confirmCompletion}
                    onCancel={closeCompletionModal} 
                />
       )}
      {isCancellationModalOpen && (
                <ConfirmationModal 
                    onConfirm={confirmCancellation} 
                    onCancel={closeCancellationModal} 
                />
       )}
    </div>
    );
}
export default ClinicianAppointments;