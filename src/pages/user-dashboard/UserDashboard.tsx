import React, { useEffect, useState, useCallback } from "react";
import { useApi } from "../../services/useApi";
import styles from "./UserDashboard.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import bannerImg from "../../assets/images/banner3.jpg";
import { MdAccessTimeFilled, MdHistory } from "react-icons/md";
import { HiXMark  } from "react-icons/hi2";
import { formatDateTimeFromIso } from "../../utils/formatters";
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goToUpcoming = () => navigate("/user-appointments");
  const goToCancelled = () => navigate("/cancelled-appointments");
  const goToPast = () => navigate("/past-appointments");
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [dashboardData, setDashboardData] = useState<{
    pastAppointmentCount: number;
    futureAppointmentCount: number;
    upcomingAppointmentDate: string;
    cancelledAppointmentCount: number;
  } | null>(null);
  const { authenticatedFetch } = useApi(); // Get the fetch utility
  const fetchDashboardData = useCallback(async () => {
      try {
            const response = await authenticatedFetch('api/v1/appointment/summary', {
              method: 'GET',
          });
          const data = await response.json();
          console.log(data);
          setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", (error as Error).message);
            // The authenticatedFetch handles 401 logout automatically
        }
  },[authenticatedFetch]);

  useEffect(() => {
        fetchDashboardData();
  }, [fetchDashboardData]);
  
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
  return (
    <div className={styles.layout}>
      {/* LEFT SIDEBAR */}
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
        {/* TOP HEADER */}
        <header className={styles.header}>
          <h1 className={styles.logo}>Medilink</h1>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </header>

        {/* BANNER */}
        <section className={styles.banner}  style={{
            backgroundImage: `url(${bannerImg})`
        }}>
            <div className={styles.bannerRow}>
                    <span>Hi {user?.username}</span>
                    <button className={styles.primaryBtn} onClick={()=>{navigate('/display-timescreen')}}>Book an Appointment</button>
            </div>
            <div className={styles.bannerRow}>
                <span>Here's your profile summary for today.</span>
                <button className={styles.dangerBtn}>Cancel an Appointment</button>
            </div>
        </section>

        {/* SUMMARY BOXES */}
        <section className={styles.statsRow}>
          <div className={styles.statUpcomingAppointmentBox}>
            <div className={`${styles.statHeader} ${styles.greenBg}`}>
              Next Appointment
            </div>
            <div className={styles.statRow}>
                {formatDateTimeFromIso(dashboardData?.upcomingAppointmentDate ?? "")}
            </div>
          </div>

          <div className={styles.statBox} onClick={goToPast}>
            <div className={`${styles.statHeader} ${styles.blueBg}`}>
              Past Appointments
            </div>
            <div className={styles.statRow}>
                <MdHistory className={styles.statsIconBlue} />
                <span className={styles.statNumber}>{dashboardData?.pastAppointmentCount ?? 0}</span>
            </div>
          </div>
          <div className={styles.statBox} onClick={goToCancelled}>
            <div className={`${styles.statHeader} ${styles.redBg}`}>
              Cancelled Appointments
            </div><div className={styles.statRow}>
              <HiXMark className={styles.statsIconRed} />
              <span className={styles.statNumber}>{dashboardData?.cancelledAppointmentCount ?? 0}</span>
            </div>
          </div>
          <div className={styles.statBox} onClick={goToUpcoming}>
            <div className={`${styles.statHeader} ${styles.OrangeBg}`}>
              Upcoming Appointments
            </div><div className={styles.statRow}>
              <MdAccessTimeFilled className={styles.statsIconOrange} />
              <span className={styles.statNumber}>{dashboardData?.futureAppointmentCount ?? 0}</span>
            </div>
          </div>  
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;