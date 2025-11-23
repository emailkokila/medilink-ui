import { ReactNode } from "react";
import styles from "./Layout.module.css";
import Header from "./Header";
import Footer from "./Footer";
interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className={styles.layout}>
             <Header />
        <div className={styles.content}>{children}
        </div>
            <Footer />
        </div>
    );
}