import React from "react";
import styles from "./ConfirmationModal.module.css";
interface ModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ModalProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Are you sure?</h3>
                <p>Do you really want to cancel this appointment?</p>
                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary} onClick={onCancel}>No</button>
                    <button className={styles.btnPrimary} onClick={onConfirm}>Yes, Cancel</button>
                </div>
            </div>
        </div>
    );
};