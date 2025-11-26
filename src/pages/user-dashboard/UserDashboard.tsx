import React, { useEffect, useState } from "react";
import { useApi } from "../../services/useApi";
import styles from "./UserDashboard.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import bannerImg from "../../assets/images/banner3.jpg";
import { MdAccessTimeFilled, MdHistory, MdClose } from "react-icons/md";
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goToUpcoming = () => navigate("/user-appointments");
  const goToPast = () => navigate("/past-appointments");
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [dashboardData, setDashboardData] = useState<{
    pastAppointmentCount: number;
    futureAppointmentCount: number;
    upcomingAppointmentDate?: string;
  } | null>(null);
  const { authenticatedFetch } = useApi(); // Get the fetch utility
  
  const formatAppointmentDate = (dateString: string): { formattedDate: string; formattedTime: string } => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

   return { formattedDate, formattedTime };
  };

  const fetchDashboardData = async () => {
      try {
            const response = await authenticatedFetch('api/v1/appointment/summary', {
              method: 'GET',
          });
          const data = await response.json();
          //console.log(data);
          setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", (error as Error).message);
            // The authenticatedFetch handles 401 logout automatically
        }
  };

  useEffect(() => {
        fetchDashboardData();
  }, []);

 
  const next = dashboardData?.upcomingAppointmentDate
    ? formatAppointmentDate(dashboardData.upcomingAppointmentDate)
    : null;
    
  return (
    <div className={styles.layout}>
      {/* LEFT SIDEBAR */}
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
        {/* TOP HEADER */}
        <header className={styles.header}>
          <h1 className={styles.medilink}>Medilink</h1>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </header>

        {/* BANNER */}
        <section className={styles.banner}  style={{
            backgroundImage: `url(${bannerImg})`
        }}>
            <div className={styles.bannerRow}>
                    <span>Hi {user?.username}</span>
                    <button className={styles.primaryBtn}>Book an Appointment</button>
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
                <span>{next ? `${next.formattedDate} ${next.formattedTime}` : "No upcoming appointment"}</span>
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

          <div className={styles.statBox} onClick={goToUpcoming}>
            <div className={`${styles.statHeader} ${styles.redBg}`}>
              Upcoming Appointments
            </div><div className={styles.statRow}>
              <MdAccessTimeFilled className={styles.statsIconRed} />
              <span className={styles.statNumber}>{dashboardData?.futureAppointmentCount ?? 0}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;