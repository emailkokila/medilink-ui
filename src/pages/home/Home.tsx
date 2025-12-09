import styles from "./Home.module.css";
import backgroundImage from "../../assets/images/background-image.jpg";
import { useNavigate } from "react-router-dom";
export default function HomePage() {
    return <div
      className={styles.container}
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Medilink</h1>

        <p className={styles.subtitle}>
          Your trusted healthcare portal designed to make managing your appointments
          simple, fast, and convenient.
        </p>

        <p className={styles.description}>
          With Medilink, you can book appointments, view your upcoming schedules, and stay
          connected with your healthcare provider - all in one place.
        </p>

        <ul className={styles.featureList}>
          <li>Book appointments in seconds</li>
          <li>View and manage your bookings</li>
          <li>Fast, secure, and easy to use</li>
        </ul>
      </main>
    </div>;
}