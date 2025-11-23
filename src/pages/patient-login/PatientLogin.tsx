import React, { useState } from "react";
import styles from "./PatientLogin.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function PatientLogin() {  
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // *** REDLINE CHANGE: Call the context's login function with two arguments ***
      // This function already handles the API call and context update internally.
      const userData = await login(userCode, password);
      
      console.log("Login successful:", userData);

      // localStorage saving is now handled inside AuthContext.tsx's `saveUserData` function.

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login API call error:", err);
      // Display the specific error message caught from the context's throw Error
      setError(err.message || "An error occurred. Please try again."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h2 className={styles.title}>Patient Login</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User Code"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitBtn}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </main>
    </div>
  );
}