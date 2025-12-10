import React, { useEffect, useState, useCallback } from "react";
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

const ClinicianAppointments = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCancel = (appointmentId: number, patientId: number) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedPatientId(patientId);
    setIsCancellationModalOpen(true);
  };

  const handleComplete = (appointmentId: number, patientId: number) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedPatientId(patientId);
    setIsCompletionModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (selectedAppointmentId !== null && selectedPatientId != null) {
        setIsActionLoading(true);

     try {
      await cancelAppointment(selectedAppointmentId, selectedPatientId);
      await fetchAppointments(currentPage, pageSize); // refresh list
    } catch (error) {
      console.error(error);
    } finally {
      setIsActionLoading(false);
      closeCancellationModal();
      setSelectedAppointmentId(null);
      setSelectedPatientId(null);
    }
    }
  };

  const closeCancellationModal = () => {
    setIsCancellationModalOpen(false);
    setSelectedAppointmentId(null);
    setSelectedPatientId(null);
  };

  const confirmCompletion = async () => {
    if (selectedAppointmentId !== null && selectedPatientId != null) {
        setIsActionLoading(true);

        try {
        await completeAppointment(selectedAppointmentId, selectedPatientId);
        await fetchAppointments(currentPage, pageSize);
        } catch (error) {
        console.error(error);
        } finally {
        setIsActionLoading(false);
        closeCompletionModal();
        setSelectedAppointmentId(null);
        setSelectedPatientId(null);
        }
    }
  };

  const closeCompletionModal = () => {
    setIsCompletionModalOpen(false);
    setSelectedAppointmentId(null);
    setSelectedPatientId(null);
  };

  const cancelAppointment = async (appointmentId: number, patientId: number) => {
    try {
      const response = await authenticatedFetch(`api/v2/appointment/cancel-appointment`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingAppointmentId: appointmentId, patientId })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
    } catch (error) {
      console.error("Failed to cancel appointment:", (error as Error).message);
    }
  };

  const completeAppointment = async (appointmentId: number, patientId: number) => {
    try {
      const response = await authenticatedFetch(`api/v2/appointment/complete-appointment`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingAppointmentId: appointmentId, patientId })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
    } catch (error) {
      console.error("Failed to complete appointment:", (error as Error).message);
    }
  };

  const fetchAppointments = useCallback(async (page: number, size: number) => {
    setIsLoading(true);
    try {
      const isoDate = new Date().toISOString();
      const response = await authenticatedFetch(
        `api/v2/appointment/get-appointments?Date=${isoDate}&PageNumber=${page}&PageSize=${size}&Status=1`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const result: Appointment[] = await response.json();
      const total = response.headers.get("x-total-count");
      setAppointments(result);
      setTotalCount(total ? parseInt(total) : result.length);
    } catch (error) {
      console.error("Failed to fetch appointments:", (error as Error).message);
      setAppointments([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchAppointments(currentPage, pageSize);
  }, [currentPage, pageSize, fetchAppointments]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const formatStatus = (status: number) => {
    switch (status) {
      case 0: return 'Inactive';
      case 1: return 'Active';
      case 2: return 'Completed';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userBox}>
          <h3>{user?.username || "User"}</h3>
        </div>
        <nav className={styles.menu}></nav>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.logo}>Medilink</h1>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </header>

        <h2 className={styles.headerText}>Appointments for today</h2>
        <div className={styles.paginationText}>
          <h4>List of all your current appointments</h4>
        </div>

        <div className={styles.tableContainer} style={{ position: "relative", marginTop: "20px" }}>
          <table className={styles.appointmentTable}>
            <thead>
              <tr className={styles.tableHeaderText}>
                <th>Date / Time</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">No appointments found</td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.appointmentId} className={styles.tableDataRow}>
                    <td>{formatDateTime(appt.appointmentDate, appt.appointmentTime)}</td>
                    <td>{appt.patientName}</td>
                    <td>{formatStatus(appt.status)}</td>
                    <td>
                      <div className={styles.actionButtonsContainer}>
                        <button onClick={() => handleComplete(appt.appointmentId, appt.patientId)} className={styles.btnActionCompletion}>Complete</button>
                        <button onClick={() => handleCancel(appt.appointmentId, appt.patientId)} className={styles.btnActionCancel}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.paginationContainer} style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            <span className={styles.paginationText}>
              Showing {currentPage} of {totalPages === 0 ? 1 : totalPages} entries
            </span>
            <div className={styles.paginationButtons}>
              <button onClick={handlePrevPage} disabled={currentPage === 1 || isLoading} className={styles.btnPagination}>Previous</button>
              <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0 || isLoading} className={styles.btnPagination}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCompletionModalOpen && (
        <ConfirmationModal message="Do you want to complete the appointment?" confirmLabel="Yes, Complete"
          onConfirm={confirmCompletion} onCancel={closeCompletionModal} isLoading={isActionLoading}/>
      )}
      {isCancellationModalOpen && (
        <ConfirmationModal onConfirm={confirmCancellation} onCancel={closeCancellationModal} isLoading={isActionLoading}/>
      )}
    </div>
  );
};

export default ClinicianAppointments;