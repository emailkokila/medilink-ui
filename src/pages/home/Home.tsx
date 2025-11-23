import styles from "./Home.module.css";
import backgroundImage from "../../assets/images/background-image.jpg";
import { useNavigate } from "react-router-dom";
export default function HomePage() {    
const navigate = useNavigate();
const handleLogin = () => {
    navigate("/login");
  };
    return <div
      className={styles.container}
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
    </div>;
}