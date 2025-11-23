import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css'; // import CSS module

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate(); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo}>Medilink</div>
            <nav className={styles.navLinks}>
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        <span className={styles.welcomeText}>Welcome, {user.username}!</span>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            Log Out
                        </button>
                    </>
                ) : (
                    <Link to="/login">Log In</Link>
                )}
            </nav>
        </header>
    );
}

export default Header;