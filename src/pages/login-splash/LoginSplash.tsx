import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginSplash.module.css";
import backgroundImage from "../../assets/images/background-image.jpg";

export default function LoginSplash() {
  const navigate = useNavigate();

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${backgroundImage})` }} // inline style with imported image
    >

      <main className={styles.main}>
        <h2 className={styles.title}>Select Your Role</h2>

        <div className={styles.roles}>
          <div className={styles.roleBox}>
            <span className="fa fa-user fa-5x"></span>
            <button
              className={styles.roleBtn}
              onClick={() => navigate("/patient-login")}
            >
              Patient
            </button>
            <p>Login to view, edit or cancel appointments</p>
          </div>

          {/* Admin */}
          <div className={styles.roleBox}>
            <span className="fa fa-user-md fa-5x"></span>
            <button
              className={styles.roleBtn}
              onClick={() => navigate("/clinician-login")}
            >
              Clinic
            </button>
            <p>Login to complete appointments</p>
          </div>
        </div>
      </main>

    </div>
  );
}