import React, { useEffect, useState, useCallback  } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../services/useApi";
import styles from "./CancelledAppointments.module.css";
import { formatDateTime, formatDateTimeFromIso, formatStatus } from '../../utils/formatters';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface Appointment {
    appointmentId: number;
    patientId: number;
    appointmentDate: string;
    appointmentTime: string;
    createdAt: string | null;
    status: number;
    cancelledDate: string;
}
const CancelledAppointments = ()=> {
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
    const [isFirstLoad, setIsFirstLoad] = useState(true);
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
    const fetchAppointments = useCallback(async () => {
      if (isFirstLoad)
        setIsLoading(true);
        try{
             const response = await authenticatedFetch(`api/v1/appointment/by-patient?PageNumber=${currentPage}&PageSize=${pageSize}&Status=2`, {
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
            setIsFirstLoad(false);
        }
    },[authenticatedFetch, currentPage, pageSize, isFirstLoad]);
    // Fetch whenever page or pageSize changes
    useEffect(()=>{
        fetchAppointments();
    }, [fetchAppointments]);
    
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
    if (isLoading && totalCount === 0) {
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
          <h2 className={styles.headerText}>Cancelled Appointments</h2>
          <button className={styles.btnPastAppt} onClick={()=>{navigate('/user-appointments')}}>
            <FontAwesomeIcon icon={faArrowLeft} /> 
            {' '}
            Go Back to Current Appointments
          </button>
        </div>
        {/* SUBTITLE */}
        <div className={styles.paginationText}>
          <h4>List of all your cancelled appointments</h4>
        </div>
         {/* TABLE */}
        <div className={styles.tableContainer} style={{ marginTop: "20px" }}>
            {/* Entries selector */}
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
            {isLoading && (
              <div className={styles.smallLoaderOverlay }>
                Loading...
              </div>
            )}
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
                       Name
                    </th>
                     <th style={{ cursor: "pointer" }}>
                       Status
                    </th>
                    <th style={{ cursor: "pointer" }}>
                        Date / Time
                    </th>
                    <th style={{ cursor: "pointer" }}>
                        Cancelled Date
                    </th>
                </tr>
                </thead>
                <tbody>
                {appointments?.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center">
                            No appointments found
                        </td>
                    </tr>
                ) : (
                    appointments?.map((appt) => (
                    <tr key={appt.appointmentId} className={styles.tableDataRow}>
                        <td className={styles.tableText}>{user?.username}</td>
                        <td className={styles.tableText}>{formatStatus(appt.status)}</td>
                        <td className={styles.tableText}>{formatDateTime(appt.appointmentDate, appt.appointmentTime)}</td>
                        <td className={styles.tableText}>{formatDateTimeFromIso(appt.cancelledDate)}</td>
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
    </div>
    );
}
export default CancelledAppointments;