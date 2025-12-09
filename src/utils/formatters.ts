 export const formatDateTime  = (dateString: string, timeString: string) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const date = new Date(dateString);
        date.setHours(hours, minutes, seconds);

        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "short", // Wed
            month: "short",   // Nov
            day: "numeric",   // 27
            year: "numeric"   // 2025
        });

        const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // 24-hour format
        });

        return `${formattedDate} at ${formattedTime}`;
  };

  export const formatDateTimeFromIso = (isoString: string): string => {
    // The Date object handles parsing the full ISO string automatically
    if (isoString === "")
    {
        return "No appointments";
    }
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short", // Wed
        month: "short",   // Nov
        day: "numeric",   // 27
        year: "numeric"   // 2025
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24-hour format
    });

    return `${formattedDate} at ${formattedTime}`;
};
export const formatStatus = (status: number) => {
        switch (status) {
            case 0:
                return 'Inactive';
            case 1:
                return 'Active';
            case 2:
                return 'Cancelled';
            case 3:
                return 'Completed';
            default:
                return 'Unknown';
        }
};
