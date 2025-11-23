import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <span className={styles.logo}>Medilink</span>
            </div>

            <div className={styles.right}>
                <Link to="/login" className={styles.loginBtn}>Login</Link>
            </div>
        </nav>
    );
}