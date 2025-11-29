import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Layout from "./components/layout/Layout";
import LoginSplash from "./pages/login-splash/LoginSplash";
import UserDashboard from "./pages/user-dashboard/UserDashboard";
import AdminDashboard from "./pages/admin-dashboard/AdminDashboard";
import PatientLogin from "./pages/patient-login/PatientLogin";
import UserAppointments from "./pages/user-appointments/UserAppointments";
import CancelledAppointments from "./pages/cancelled-appointments/CancelledAppointments";
import HomePage from "./pages/home/Home";
import DisplayTimeScreen from "./pages/display-timescreen/DisplayTimeScreen";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
            <div className="App">
              <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/login" element={<Layout><LoginSplash /></Layout>} />                    
                    <Route path="/patient-login" element={<Layout><PatientLogin /></Layout>} />

                    {/* Protected Routes (Require the user to be logged in) */}
                    {/* Use ProtectedRoute as a wrapper for secured areas */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/user-dashboard" element={<UserDashboard />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/user-appointments" element={<UserAppointments />} />
                      <Route path="/display-timescreen" element={<DisplayTimeScreen />} />
                      <Route path="/cancelled-appointments" element={<CancelledAppointments />} />
                     </Route>
                </Routes>
              </main>
            </div>        
        </BrowserRouter>
      </AuthProvider>
    );
}

export default App;