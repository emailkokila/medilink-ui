import React from "react";
import styles from "./ConfirmationModal.module.css";
interface ModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ModalProps> = ({
    onConfirm,
    onCancel,
    title = "Are you sure?",
    message = "Do you really want to cancel this appointment?",
    confirmLabel = "Yes, Cancel",
    cancelLabel = "No",
    isLoading = false
}) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary} onClick={onCancel}>{cancelLabel}</button>
                    <button className={styles.btnPrimary} onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};